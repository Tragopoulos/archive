package main

import (
	"context"
	"embed"
	"fmt"
	"html/template"
	"log"
	"mailer/db"
	"mailer/routes"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
)

//go:embed templates/*.html
var templatesFS embed.FS

func main() {
	htmlTemplates, err := template.ParseFS(templatesFS, "templates/*.html")
	if err != nil {
		log.Fatalf("Fatal: failed to parse HTML templates: %v\n", err)
	}

	config, err := db.LoadConfig()
	if err != nil {
		fmt.Printf("Fatal: failed to load config: %v\n", err)
		os.Exit(1)
	}

	/** Ensure Email Directory Exists */
	if err := os.MkdirAll(config.EmailDirectory, 0755); err != nil {
		fmt.Printf("Fatal: failed to create email directory: %v\n", err)
		os.Exit(1)
	}

	hostname, err := os.Hostname()
	if err != nil {
		hostname = "UNKNOWN"
	}

	mysql, err := db.CreateMySQL(config)
	if err != nil {
		fmt.Printf("Warning: MySQL connection failed: %v\n", err)
		mysql = nil
	}
	if mysql != nil {
		defer mysql.Close()
	}

	osClient, err := db.CreateObjectStorage()
	if err != nil {
		fmt.Printf("Warning: %v\n", err)
		osClient = nil
	}

	mux := http.NewServeMux()
	mux.HandleFunc("POST /cards_a", routes.PostCardsA(htmlTemplates, config, hostname, mysql, osClient))
	mux.HandleFunc("POST /cards_b", routes.PostCardsB(htmlTemplates, config, hostname, mysql, osClient))
	mux.HandleFunc("POST /cards_c", routes.PostCardsC(htmlTemplates, config, hostname, mysql, osClient))
	mux.HandleFunc("POST /marketing_a", routes.PostMarketingA(htmlTemplates, config, hostname, mysql, osClient))
	mux.HandleFunc("POST /marketing_b", routes.PostMarketingB(htmlTemplates, config, hostname, mysql, osClient))
	mux.HandleFunc("POST /marketing_c", routes.PostMarketingC(htmlTemplates, config, hostname, mysql, osClient))
	mux.HandleFunc("POST /marketing_d", routes.PostMarketingD(htmlTemplates, config, hostname, mysql, osClient))
	mux.HandleFunc("POST /marketing_e", routes.PostMarketingE(htmlTemplates, config, hostname, mysql, osClient))
	mux.HandleFunc("POST /marketing_f", routes.PostMarketingF(htmlTemplates, config, hostname, mysql, osClient))
	mux.HandleFunc("POST /marketing_g", routes.PostMarketingG(htmlTemplates, config, hostname, mysql, osClient))
	mux.HandleFunc("POST /marketing_h", routes.PostMarketingH(htmlTemplates, config, hostname, mysql, osClient))
	mux.HandleFunc("POST /marketing_i", routes.PostMarketingI(htmlTemplates, config, hostname, mysql, osClient))
	mux.HandleFunc("POST /marketing_j", routes.PostMarketingJ(htmlTemplates, config, hostname, mysql, osClient))
	mux.HandleFunc("GET /emails", routes.Emails(mysql))
	mux.HandleFunc("GET /emails/{id}", routes.Email(mysql))
	mux.HandleFunc("GET /emails/{id}/render", routes.GetEmails(htmlTemplates, mysql))

	server := &http.Server{
		Addr:              fmt.Sprintf(":%d", 8701),
		Handler:           mux,
		ReadTimeout:       5 * time.Second,
		WriteTimeout:      10 * time.Second,
		IdleTimeout:       120 * time.Second,
		ReadHeaderTimeout: 2 * time.Second,
	}

	go func() {
		fmt.Printf("Server ready on port %d\n", 8701)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			fmt.Printf("Server error: %v\n", err)
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)

	<-stop
	fmt.Println("\nShutdown signal received")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)

	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		fmt.Printf("HTTP server shutdown error: %v\n", err)
	} else {
		fmt.Println("HTTP server stopped gracefully")
	}

	fmt.Println("Closing database and resource pools")
}
