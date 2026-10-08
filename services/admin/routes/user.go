package routes

import (
	"admin/db"
	"admin/helpers"
	"admin/operations"
	"database/sql"
	"net/http"
	"time"
)

/** GET /auth/user — returns {email, role} for the active session */
func User(config *db.Config, mysql *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		c, err := r.Cookie(helpers.SessionCookieName)
		if err != nil || c.Value == "" {
			helpers.Response(w, http.StatusUnauthorized, map[string]any{"status": "unauthenticated"})
			return
		}
		if mysql == nil {
			helpers.Response(w, http.StatusServiceUnavailable, map[string]any{"status": "error", "message": "database unavailable"})
			return
		}

		/** Look up the session by hashed cookie value. */
		sessions, err := operations.ReadSession(mysql, operations.HashSessionID(c.Value))
		if err != nil || len(sessions) == 0 {
			helpers.ClearSessionCookie(w)
			helpers.Response(w, http.StatusUnauthorized, map[string]any{"status": "unauthenticated"})
			return
		}
		s := sessions[0]

		/** Reject expired or revoked sessions. */
		if s.RevokedAt.Valid || time.Now().UTC().After(s.ExpiresAt) {
			helpers.ClearSessionCookie(w)
			helpers.Response(w, http.StatusUnauthorized, map[string]any{"status": "unauthenticated"})
			return
		}

		/** Confirm the user is still registered (could have been deleted). */
		users, err := operations.ReadUser(mysql, s.Email)
		if err != nil || len(users) == 0 {
			helpers.ClearSessionCookie(w)
			helpers.Response(w, http.StatusUnauthorized, map[string]any{"status": "unauthenticated"})
			return
		}
		u := users[0]

		helpers.Response(w, http.StatusOK, map[string]any{"status": "ok", "email": u.Email, "role": u.Role})
	}
}
