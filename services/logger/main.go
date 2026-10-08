package main

/**
Example request:
curl -X POST http://localhost:8702/ -H "Content-Type: application/json" -d '{
  "severity": "error",
  "message": "connection timeout",
  "violations": [{"field": "email", "rule": "required"}],
  "method": "POST",
  "route": "/api/v1/orders",
  "hostname": "api-server-01",
  "client_ip": "192.168.1.50",
  "load_balancer_ip": "10.0.0.1",
  "api_gateway_ip": "10.0.0.2",
  "oci_request_id": "ocid1.request.oc1..aaaaaaaaxyz",
  "accept_encoding": "gzip, deflate",
  "content_type": "application/json",
  "content_length": 256,
  "account_id": "acc_abc123",
  "device_id": "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4",
  "auth_time": "2026-06-04T10:00:00Z",
  "auth_expires_at": "2026-06-04T11:00:00Z",
  "platform": "ios",
  "ua_raw": "Mozilla/5.0 (iPhone; CPU iPhone OS 19_0 like Mac OS X)",
  "ua_device_family": "iPhone",
  "ua_device_brand": "Apple",
  "ua_device_model": "iPhone 16",
  "ua_os": "iOS",
  "ua_os_version": "19.0",
  "ua": "Mobile Safari",
  "ua_version": "19.0",
  "city": "Athens",
  "country": "Greece",
  "country_iso": "GR",
  "accuracy_radius": 20,
  "latitude": 37.9838,
  "longitude": 23.7275,
  "metro_code": 0,
  "time_zone": "Europe/Athens",
  "postal_code": "10431",
  "is_anonymous_proxy": false,
  "is_anycast": false,
  "is_satellite_provider": false,
  "asn": 3329,
  "asn_org": "Vodafone Greece",
  "origin": "mobile-app",
  "res_http_status": 504,
  "res_http_text": "Gateway Timeout",
  "res_body": {"error": "upstream timeout"},
  "req_body": {"order_id": "ord_99887"}
}'
*/

import (
	"bytes"
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"logger/db"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"syscall"
	"time"

	"github.com/oracle/oci-go-sdk/v65/objectstorage"
)

func main() {
	/** Configuration */
	config, err := db.LoadConfig()
	if err != nil {
		fmt.Printf("Fatal: failed to load config: %v\n", err)
		os.Exit(1)
	}

	/** Ensure Log Directory Exists Once */
	if err := os.MkdirAll(config.LogDirectory, 0755); err != nil {
		fmt.Printf("Fatal: failed to create log directory: %v\n", err)
		os.Exit(1)
	}

	/** Hostname */
	hostname, err := os.Hostname()
	if err != nil {
		hostname = "UNKNOWN"
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

	/** Object Storage Client (Instance Principal) */
	osClient, err := db.CreateObjectStorage()
	if err != nil {
		fmt.Printf("Warning: Object storage initialization failed: %v\n", err)
		osClient = nil
	}

	/** Register routes */
	mux := http.NewServeMux()
	mux.HandleFunc("POST /", func(w http.ResponseWriter, r *http.Request) {
		handler(w, r, mysql, osClient, config, hostname)
	})

	/** Define the HTTP server */
	server := &http.Server{
		Addr:              fmt.Sprintf(":%d", 8702),
		Handler:           mux,
		ReadTimeout:       5 * time.Second,
		WriteTimeout:      10 * time.Second,
		IdleTimeout:       120 * time.Second,
		ReadHeaderTimeout: 2 * time.Second,
	}

	/** Graceful shutdown listener */
	go func() {
		fmt.Printf("Server ready on port %d\n", 8702)
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

func handler(w http.ResponseWriter, r *http.Request, mysql *sql.DB, osClient *objectstorage.ObjectStorageClient, config *db.Config, hostname string) {
	/** Read body once */
	raw, err := io.ReadAll(r.Body)
	if err != nil {
		sendResponse(w, http.StatusBadRequest, map[string]any{"status": "error", "message": "failed to read request body"})
		return
	}

	var entry db.Log
	strictDecoder := json.NewDecoder(bytes.NewReader(raw))
	strictDecoder.DisallowUnknownFields()
	strictErr := strictDecoder.Decode(&entry)

	/** If strict schema validation failed, do a lenient fallback decode just to check basic layout */
	if strictErr != nil {
		if err := json.Unmarshal(raw, &entry); err != nil {
			sendResponse(w, http.StatusBadRequest, map[string]any{"status": "error", "message": "invalid JSON layout"})
			return
		}
	}

	/** Validate required fields explicitly */
	if entry.Severity == "" || entry.Method == "" || entry.Route == "" {
		sendResponse(w, http.StatusBadRequest, map[string]any{"status": "error", "message": "severity, method, and route are required"})
		return
	}

	timestamp := time.Now().UTC()
	objectName := fmt.Sprintf("%s-%d.json", timestamp.Format("20060102T150405Z"), timestamp.UnixNano())

	/** Tier 1: Try MySQL (Only if strict payload schema fully matched) */
	if strictErr == nil && mysql != nil {
		if id, err := db.InsertLog(mysql, &entry, timestamp, hostname); err == nil {
			sendResponse(w, http.StatusOK, map[string]any{
				"status":    "stored",
				"storage":   "mysql",
				"id":        id,
				"timestamp": timestamp.Format(time.RFC3339),
			})
			return
		} else {
			fmt.Printf("MySQL insert failed, falling back to OS: %v\n", err)
		}
	}

	/** Tier 2: Try Object Storage (Fallback for DB errors OR unstructured schema payloads) */
	if osClient != nil && config.ObjectStorageNamespace != "" && config.ObjectStorageBucket != "" {
		osCtx, cancel := context.WithTimeout(r.Context(), 3*time.Second)
		defer cancel()

		if err := db.UploadBytesToObjectStorage(osCtx, osClient, config, raw, objectName); err == nil {
			sendResponse(w, http.StatusAccepted, map[string]any{
				"status":    "fallback",
				"storage":   "object_storage",
				"object":    objectName,
				"timestamp": timestamp.Format(time.RFC3339),
			})
			return
		} else {
			fmt.Printf("Object Storage upload failed, falling back to local disk: %v\n", err)
		}
	}

	/** Tier 3: Try Local Disk (Ultimate Fallback) */
	filePath := filepath.Join(config.LogDirectory, objectName)
	if err := os.WriteFile(filePath, raw, 0644); err != nil {
		fmt.Printf("Local file write error (ALL STORAGES FAILED): %v\n", err)
		sendResponse(w, http.StatusInternalServerError, map[string]any{
			"status":    "dropped",
			"storage":   "none",
			"timestamp": timestamp.Format(time.RFC3339),
		})
		return
	}

	sendResponse(w, http.StatusAccepted, map[string]any{
		"status":    "fallback",
		"storage":   "filesystem",
		"file":      objectName,
		"timestamp": timestamp.Format(time.RFC3339),
	})
}

func sendResponse(w http.ResponseWriter, statusCode int, payload map[string]any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	_ = json.NewEncoder(w).Encode(payload)
}
