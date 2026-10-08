package routes

import (
	"admin/db"
	"admin/helpers"
	"admin/operations"
	"database/sql"
	"net/http"
	"time"
)

/** POST /auth/logout — revokes the session and clears the cookie */
func Logout(config *db.Config, mysql *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if c, err := r.Cookie(helpers.SessionCookieName); err == nil && c.Value != "" && mysql != nil {
			/** Soft-delete by setting revoked_at; the hourly purge will remove the row. */
			_ = operations.UpdateSession(mysql, operations.HashSessionID(c.Value), operations.Session{
				RevokedAt: sql.NullTime{Time: time.Now().UTC(), Valid: true},
			})
		}
		helpers.ClearSessionCookie(w)
		helpers.Response(w, http.StatusOK, map[string]any{"status": "ok"})
	}
}
