package routes

import (
	"admin/db"
	"admin/helpers"
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

/** GET /emails — admin only. Returns all stored emails via mailer service. */
func GetEmails(adminMySQL *sql.DB, config *db.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if adminMySQL == nil {
			helpers.Response(w, http.StatusServiceUnavailable, map[string]any{"status": "error", "message": "database not configured"})
			return
		}
		if helpers.RequireAdmin(w, r, adminMySQL) == nil {
			return
		}
		if config.MailerURL == "" {
			helpers.Response(w, http.StatusServiceUnavailable, map[string]any{"status": "error", "message": "mailer not configured"})
			return
		}

		url := fmt.Sprintf("%s/emails", config.MailerURL)
		req, err := http.NewRequest(http.MethodGet, url, nil)
		if err != nil {
			helpers.Response(w, http.StatusInternalServerError, map[string]any{"status": "error", "message": "failed to create request"})
			return
		}

		client := &http.Client{Timeout: 15 * time.Second}
		resp, err := client.Do(req)
		if err != nil {
			helpers.Response(w, http.StatusBadGateway, map[string]any{"status": "error", "message": "mailer request failed"})
			return
		}
		defer resp.Body.Close()

		if resp.StatusCode >= 400 {
			relayMailerError(w, resp)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		io.Copy(w, resp.Body)
	}
}

/** GET /emails/{id} — admin only. Returns a single email with full components via mailer service. */
func GetEmail(adminMySQL *sql.DB, config *db.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if adminMySQL == nil {
			helpers.Response(w, http.StatusServiceUnavailable, map[string]any{"status": "error", "message": "database not configured"})
			return
		}
		if helpers.RequireAdmin(w, r, adminMySQL) == nil {
			return
		}
		if config.MailerURL == "" {
			helpers.Response(w, http.StatusServiceUnavailable, map[string]any{"status": "error", "message": "mailer not configured"})
			return
		}

		id := r.PathValue("id")
		if id == "" {
			helpers.Response(w, http.StatusBadRequest, map[string]any{"status": "error", "message": "missing id"})
			return
		}

		url := fmt.Sprintf("%s/emails/%s", config.MailerURL, id)
		req, err := http.NewRequest(http.MethodGet, url, nil)
		if err != nil {
			helpers.Response(w, http.StatusInternalServerError, map[string]any{"status": "error", "message": "failed to create request"})
			return
		}

		client := &http.Client{Timeout: 15 * time.Second}
		resp, err := client.Do(req)
		if err != nil {
			helpers.Response(w, http.StatusBadGateway, map[string]any{"status": "error", "message": "mailer request failed"})
			return
		}
		defer resp.Body.Close()

		if resp.StatusCode >= 400 {
			relayMailerError(w, resp)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		io.Copy(w, resp.Body)
	}
}

/** GET /emails/{id}/render — admin only. Returns rendered HTML via mailer service. */
func RenderEmail(config *db.Config, adminMySQL *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if adminMySQL == nil {
			helpers.Response(w, http.StatusServiceUnavailable, map[string]any{"status": "error", "message": "database not configured"})
			return
		}
		if helpers.RequireAdmin(w, r, adminMySQL) == nil {
			return
		}
		if config.MailerURL == "" {
			helpers.Response(w, http.StatusServiceUnavailable, map[string]any{"status": "error", "message": "mailer not configured"})
			return
		}
		id := r.PathValue("id")
		if id == "" {
			helpers.Response(w, http.StatusBadRequest, map[string]any{"status": "error", "message": "missing id"})
			return
		}

		url := fmt.Sprintf("%s/emails/%s/render", config.MailerURL, id)
		req, err := http.NewRequest(http.MethodGet, url, nil)
		if err != nil {
			helpers.Response(w, http.StatusInternalServerError, map[string]any{"status": "error", "message": "failed to create request"})
			return
		}

		client := &http.Client{Timeout: 15 * time.Second}
		resp, err := client.Do(req)
		if err != nil {
			helpers.Response(w, http.StatusBadGateway, map[string]any{"status": "error", "message": "mailer request failed"})
			return
		}
		defer resp.Body.Close()

		if resp.StatusCode >= 400 {
			relayMailerError(w, resp)
			return
		}

		body, err := io.ReadAll(resp.Body)
		if err != nil {
			helpers.Response(w, http.StatusBadGateway, map[string]any{"status": "error", "message": "failed to read mailer response"})
			return
		}

		html := string(body)
		html = strings.ReplaceAll(html, "https://objectstorage.eu-frankfurt-1.oraclecloud.com/n/frmllrv9y0qh/b/assets/o/operations_logo.png", "")

		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		_, _ = w.Write([]byte(html))
	}
}

func relayMailerError(w http.ResponseWriter, resp *http.Response) {
	body, _ := io.ReadAll(resp.Body)

	var payload map[string]any
	if err := json.Unmarshal(body, &payload); err == nil {
		if _, ok := payload["status"]; !ok {
			payload["status"] = "error"
		}
		helpers.Response(w, resp.StatusCode, payload)
		return
	}

	helpers.Response(w, resp.StatusCode, map[string]any{"status": "error", "message": string(body)})
}
