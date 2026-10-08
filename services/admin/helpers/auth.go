package helpers

import (
	"admin/operations"
	"database/sql"
	"net/http"
	"time"
)

/** RequireSession resolves the active user from the session cookie. On any
 *  failure it writes the appropriate HTTP response and returns nil; callers
 *  MUST stop on nil. The returned pointer is the row from the users table. */
func RequireSession(w http.ResponseWriter, r *http.Request, mysql *sql.DB) *operations.User {
	c, err := r.Cookie(SessionCookieName)
	if err != nil || c.Value == "" {
		Response(w, http.StatusUnauthorized, map[string]any{"status": "unauthenticated"})
		return nil
	}
	if mysql == nil {
		Response(w, http.StatusServiceUnavailable, map[string]any{"status": "error", "message": "database unavailable"})
		return nil
	}

	sessions, err := operations.ReadSession(mysql, operations.HashSessionID(c.Value))
	if err != nil || len(sessions) == 0 {
		ClearSessionCookie(w)
		Response(w, http.StatusUnauthorized, map[string]any{"status": "unauthenticated"})
		return nil
	}
	s := sessions[0]
	if s.RevokedAt.Valid || time.Now().UTC().After(s.ExpiresAt) {
		ClearSessionCookie(w)
		Response(w, http.StatusUnauthorized, map[string]any{"status": "unauthenticated"})
		return nil
	}

	users, err := operations.ReadUser(mysql, s.Email)
	if err != nil || len(users) == 0 {
		ClearSessionCookie(w)
		Response(w, http.StatusUnauthorized, map[string]any{"status": "unauthenticated"})
		return nil
	}
	return &users[0]
}

/** RequireAdmin builds on RequireSession and additionally enforces role=admin.
 *  Returns nil after writing a 403 if the caller is authenticated but not an admin. */
func RequireAdmin(w http.ResponseWriter, r *http.Request, mysql *sql.DB) *operations.User {
	u := RequireSession(w, r, mysql)
	if u == nil {
		return nil
	}
	if u.Role != "admin" {
		Response(w, http.StatusForbidden, map[string]any{"status": "error", "message": "forbidden"})
		return nil
	}
	return u
}
