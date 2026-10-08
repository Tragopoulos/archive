package routes

import (
	"admin/db"
	"admin/helpers"
	"database/sql"
	"errors"
	"net/http"
)

func DeleteGiteaLogs(config *db.Config, mysql *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if helpers.RequireAdmin(w, r, mysql) == nil {
			return
		}

		deletedCount, err := helpers.GiteaDeleteWorkflowRuns(config)
		if err != nil {
			if errors.Is(err, helpers.ErrGiteaNotConfigured) {
				helpers.Response(w, http.StatusServiceUnavailable, map[string]any{"status": "error", "code": "gitea_not_configured", "message": "gitea is not configured"})
				return
			}
			helpers.Response(w, http.StatusBadGateway, map[string]any{"status": "error", "message": "failed to delete gitea workflow runs"})
			return
		}

		helpers.Response(w, http.StatusOK, map[string]any{"status": "ok", "deleted": deletedCount})
	}
}
