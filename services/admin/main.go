package main

import (
	"admin/db"
	"admin/routes"
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
)

func main() {
	/** Configuration */
	config, err := db.LoadConfig()
	if err != nil {
		fmt.Printf("Fatal: failed to load config: %v\n", err)
		os.Exit(1)
	}

	/** MySQL */
	mysql, err := db.CreateMySQL(config)
	if err != nil {
		fmt.Printf("Warning: MySQL connection failed: %v\n", err)
		mysql = nil
	}
	if mysql != nil {
		defer mysql.Close()
	}

	/** Periodic cleanup of expired magic links and sessions. Runs immediately
	 *  at startup and then every 30 minutes. */
	stopCleanup := make(chan struct{})
	if mysql != nil {
		purge := func() {
			if _, err := mysql.Exec("DELETE FROM magic_links WHERE expires_at < UTC_TIMESTAMP(6)"); err != nil {
				fmt.Printf("magic link purge error: %v\n", err)
			}
			/** Delete sessions that are expired, revoked, or orphaned
			 *  (user row was deleted). */
			if _, err := mysql.Exec(`
				DELETE s FROM sessions s
				LEFT JOIN users u ON u.email = s.email
				WHERE s.expires_at < UTC_TIMESTAMP(6)
				   OR s.revoked_at IS NOT NULL
				   OR u.email IS NULL
			`); err != nil {
				fmt.Printf("session purge error: %v\n", err)
			}
		}
		go func() {
			purge()
			ticker := time.NewTicker(30 * time.Minute)
			defer ticker.Stop()
			for {
				select {
				case <-ticker.C:
					purge()
				case <-stopCleanup:
					return
				}
			}
		}()
	}

	/** Routes */
	mux := http.NewServeMux()
	/** Start the passwordless login flow by sending a magic link. */
	mux.HandleFunc("POST /auth/request", routes.Request(config, mysql))
	/** Verify a magic link and establish an authenticated session. */
	mux.HandleFunc("GET /auth/verify", routes.Verify(config, mysql))
	/** Return the current authenticated user. */
	mux.HandleFunc("GET /auth/user", routes.User(config, mysql))
	/** Log the current user out and revoke the session. */
	mux.HandleFunc("POST /auth/logout", routes.Logout(config, mysql))
	/** List users. */
	mux.HandleFunc("GET /users", routes.GetUsers(config, mysql))
	/** Create a new user. */
	mux.HandleFunc("POST /users", routes.PostUsers(config, mysql))
	/** Update an existing admin user. */
	mux.HandleFunc("PATCH /users/{id}", routes.PatchUsers(config, mysql))
	/** Delete an admin user. */
	mux.HandleFunc("DELETE /users/{id}", routes.DeleteUsers(config, mysql))
	/** List available configuration entries. */
	mux.HandleFunc("GET /configs", routes.GetConfigs(config, mysql))
	/** Fetch a specific application environment configuration. */
	mux.HandleFunc("GET /configs/{app}/{env}", routes.GetConfig(config, mysql))
	/** Save changes for a specific application environment configuration. */
	mux.HandleFunc("PUT /configs/{app}/{env}", routes.PutConfig(config, mysql))
	/** Trigger a deployment workflow for a specific application environment. */
	mux.HandleFunc("POST /configs/{app}/{env}/deploy", routes.PostConfigDeploy(config, mysql))
	/** Restart the service for a specific application environment. */
	mux.HandleFunc("POST /configs/{app}/{env}/restart", routes.PostConfigRestart(config, mysql))
	/** Promote core binary from AREA51 to production hosts. */
	mux.HandleFunc("POST /configs/core/promote", routes.PostCorePromote(config, mysql))
	/** Rollback core binary on production hosts. */
	mux.HandleFunc("POST /configs/core/rollback", routes.PostCoreRollback(config, mysql))
	/** Delete workflow run logs from the configured Gitea repository. */
	mux.HandleFunc("POST /gitea/logs/delete", routes.DeleteGiteaLogs(config, mysql))
	/** List stored emails via mailer service. */
	mux.HandleFunc("GET /emails", routes.GetEmails(mysql, config))
	/** Get a stored email by ID via mailer service. */
	mux.HandleFunc("GET /emails/{id}", routes.GetEmail(mysql, config))
	/** Get the latest state for a specific installer. */
	mux.HandleFunc("GET /installers/{name}/status", routes.GetInstallerStatus(config, mysql))
	/** Trigger an installer by name. */
	mux.HandleFunc("POST /installers/{name}/trigger", routes.TriggerInstaller(config, mysql))
	/** Render a stored email by ID via mailer service. */
	mux.HandleFunc("GET /emails/{id}/render", routes.RenderEmail(config, mysql))

	/** Bind to 127.0.0.1 by default so the service is reachable only from the VM itself (nginx). */
	host := "127.0.0.1"

	/** Define the HTTP server */
	server := &http.Server{
		Addr:              fmt.Sprintf("%s:%d", host, 8703),
		Handler:           mux,
		ReadTimeout:       time.Duration(5) * time.Second,
		WriteTimeout:      time.Duration(5) * time.Minute,
		IdleTimeout:       time.Duration(120) * time.Second,
		ReadHeaderTimeout: time.Duration(2) * time.Second,
	}

	/** Wait for interrupt or SIGTERM */
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)

	/** Run the server in a goroutine; a fatal listen error (e.g. port in use)
	 *  signals shutdown via the stop channel so systemd sees the unit fail. */
	go func() {
		fmt.Printf("Server ready on %s:%d\n", host, 8703)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			fmt.Printf("Server error: %v\n", err)
			stop <- syscall.SIGTERM
		}
	}()

	<-stop
	fmt.Println("\nShutdown signal received")
	close(stopCleanup)

	/** Gracefully stop the server */
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		fmt.Printf("HTTP server shutdown error: %v\n", err)
	} else {
		fmt.Println("HTTP server stopped gracefully")
	}

	fmt.Println("Closing database and resource pools")
}
