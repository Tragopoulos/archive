package main

import (
	"context"
	"core/db"
	"core/routes"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
)

func main() {
	config, err := db.LoadConfig()
	if err != nil {
		fmt.Printf("Fatal: failed to load config: %v\n", err)
		os.Exit(1)
	}

	if config.MySQL_IP == "" {
		log.Println("Warning: MySQL configuration incomplete")
	}

	mux := http.NewServeMux()
	mux.HandleFunc("GET /", routes.GetHello())

	server := &http.Server{
		Addr:              ":8700",
		Handler:           mux,
		ReadTimeout:       5 * time.Second,
		WriteTimeout:      10 * time.Second,
		IdleTimeout:       120 * time.Second,
		ReadHeaderTimeout: 2 * time.Second,
	}

	go func() {
		fmt.Println("Core service ready on port 8700")
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
}
