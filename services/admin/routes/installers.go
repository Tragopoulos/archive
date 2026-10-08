package routes

import (
	"admin/db"
	"admin/helpers"
	"admin/operations"
	"database/sql"
	"encoding/json"
	"net/http"
	"strings"
)

/** GET /installers/{name}/status — admin only. Returns the latest state for one installer. */
func GetInstallerStatus(config *db.Config, mysql *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if helpers.RequireAdmin(w, r, mysql) == nil {
			return
		}

		name := r.PathValue("name")
		if strings.TrimSpace(name) == "" {
			helpers.Response(w, http.StatusBadRequest, map[string]any{"status": "error", "message": "missing installer name"})
			return
		}

		installer, err := operations.GetInstallerState(name)
		if err != nil {
			helpers.Response(w, http.StatusNotFound, map[string]any{"status": "error", "message": err.Error()})
			return
		}

		helpers.Response(w, http.StatusOK, map[string]any{"status": "ok", "installer": installer})
	}
}

/** POST /installers/{name}/trigger — admin only. Starts an installation. */
func TriggerInstaller(config *db.Config, mysql *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if helpers.RequireAdmin(w, r, mysql) == nil {
			return
		}

		name := r.PathValue("name")
		if strings.TrimSpace(name) == "" {
			helpers.Response(w, http.StatusBadRequest, map[string]any{"status": "error", "message": "missing installer name"})
			return
		}

		var body map[string]any
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			helpers.Response(w, http.StatusBadRequest, map[string]any{"status": "error", "message": "invalid body"})
			return
		}

		inputs := make(map[string]string)
		if body != nil {
			if m, ok := body["inputs"].(map[string]any); ok {
				for k, v := range m {
					if s, ok := v.(string); ok {
						inputs[k] = s
					}
				}
			}
		}

		rec, err := operations.TriggerInstall(name, inputs)
		if err != nil {
			helpers.Response(w, http.StatusNotFound, map[string]any{"status": "error", "message": err.Error()})
			return
		}

		installer, err := operations.GetInstallerState(name)
		if err != nil {
			helpers.Response(w, http.StatusNotFound, map[string]any{"status": "error", "message": err.Error()})
			return
		}

		helpers.Response(w, http.StatusOK, map[string]any{
			"status":    "ok",
			"message":   "Triggered " + name,
			"installer": installer,
			"run_id":    "run-" + rec.StartedAt.Format("20060102150405"),
		})
	}
}
