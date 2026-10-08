package main

import (
	"api/db"
	"api/request"
	"api/routes"
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

	/** Hostname */
	hostname, err := os.Hostname()
	if err != nil {
		hostname = "UNKNOWN"
	}

	/** GeoLite2 City */
	geolite, err := db.GeoLite(config)
	if err != nil {
		fmt.Printf("Fatal: failed to open GeoLite City: %v\n", err)
		os.Exit(1)
	}
	defer geolite.Close()

	/** GeoLite2 ASN */
	geoASN, err := db.GeoLiteASN(config)
	if err != nil {
		fmt.Printf("Fatal: failed to open GeoLite ASN: %v\n", err)
		os.Exit(1)
	}
	defer geoASN.Close()

	/** OCI NoSQL */
	nosql, err := db.CreateNoSQL(config)
	if err != nil {
		fmt.Printf("Fatal: failed to create NoSQL client: %v\n", err)
		os.Exit(1)
	}
	defer nosql.Close()

	/** Register routes */
	mux := http.NewServeMux()
	protect := func(h routes.Handler) http.HandlerFunc {
		return routes.Protect(config, hostname, geolite, geoASN, h)
	}
	mux.HandleFunc("POST /account", protect(func(w http.ResponseWriter, r *http.Request, data *request.Data) {
		routes.AccountCreate(nosql, config, w, r, data)
	}))

	/** Define the HTTP server */
	server := &http.Server{
		Addr:              fmt.Sprintf(":%d", config.ServicePort),
		Handler:           mux,
		ReadTimeout:       time.Duration(config.ServiceReadTimeout) * time.Second,
		WriteTimeout:      time.Duration(config.ServiceWriteTimeout) * time.Second,
		IdleTimeout:       time.Duration(config.ServiceIdleTimeout) * time.Second,
		ReadHeaderTimeout: time.Duration(config.ServiceReadHeaderTimeout) * time.Second,
	}

	/** Graceful shutdown listener */
	go func() {
		fmt.Printf("Server ready on port %d\n", config.ServicePort)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			fmt.Printf("Server error: %v\n", err)
		}
	}()

	/** Wait for interrupt or SIGTERM */
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)

	<-stop
	fmt.Println("\nShutdown signal received")

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
