package routes

import (
	"admin/db"
	"admin/helpers"
	"admin/operations"
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"
	"net/mail"
	"strconv"
	"strings"
	"time"

	gomysql "github.com/go-sql-driver/mysql"
)

/** Permitted roles for the users.role column. Mirrors the SQL ENUM. */
var allowedRoles = map[string]bool{"admin": true, "support": true}

/** normalizeEmail trims, lowercases, and RFC-5322-validates the address. */
func normalizeEmail(s string) (string, error) {
	addr, err := mail.ParseAddress(strings.TrimSpace(strings.ToLower(s)))
	if err != nil {
		return "", err
	}
	return strings.ToLower(addr.Address), nil
}

/** userView is the JSON projection of a user row sent to clients. */
func userView(u operations.User) map[string]any {
	return map[string]any{
		"id":         u.ID,
		"email":      u.Email,
		"name":       u.Name,
		"role":       u.Role,
		"created_at": u.CreatedAt.UTC().Format(time.RFC3339),
	}
}

/** countAdmins returns how many admin users currently exist. Used to prevent
 *  removing or demoting the last admin and locking everyone out. */
func countAdmins(pool *sql.DB) (int, error) {
	all, err := operations.ReadUser(pool)
	if err != nil {
		return 0, err
	}
	n := 0
	for _, u := range all {
		if u.Role == "admin" {
			n++
		}
	}
	return n, nil
}

/** GET /users — list all users. Admin only. */
func GetUsers(config *db.Config, mysql *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if helpers.RequireAdmin(w, r, mysql) == nil {
			return
		}
		users, err := operations.ReadUser(mysql)
		if err != nil {
			helpers.Response(w, http.StatusInternalServerError, map[string]any{"status": "error", "message": "failed to read users"})
			return
		}
		out := make([]map[string]any, 0, len(users))
		for _, u := range users {
			out = append(out, userView(u))
		}
		helpers.Response(w, http.StatusOK, map[string]any{"status": "ok", "users": out})
	}
}

/** POST /users — body: {"email": "...", "name": "...", "role": "admin|support"}.
 *  Admin only. name is optional and defaults to empty. */
func PostUsers(config *db.Config, mysql *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if helpers.RequireAdmin(w, r, mysql) == nil {
			return
		}

		var body struct {
			Email string `json:"email"`
			Name  string `json:"name"`
			Role  string `json:"role"`
		}
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			helpers.Response(w, http.StatusBadRequest, map[string]any{"status": "error", "message": "invalid body"})
			return
		}

		email, err := normalizeEmail(body.Email)
		if err != nil {
			helpers.Response(w, http.StatusBadRequest, map[string]any{"status": "error", "message": "invalid email"})
			return
		}
		role := strings.ToLower(strings.TrimSpace(body.Role))
		if !allowedRoles[role] {
			helpers.Response(w, http.StatusBadRequest, map[string]any{"status": "error", "message": "invalid role"})
			return
		}
		name := strings.TrimSpace(body.Name)

		if err := operations.CreateUser(mysql, email, name, role); err != nil {
			var mErr *gomysql.MySQLError
			if errors.As(err, &mErr) && mErr.Number == 1062 {
				helpers.Response(w, http.StatusConflict, map[string]any{"status": "error", "message": "duplicate email"})
				return
			}
			helpers.Response(w, http.StatusInternalServerError, map[string]any{"status": "error", "message": "failed to create user"})
			return
		}

		users, err := operations.ReadUser(mysql, email)
		if err != nil || len(users) == 0 {
			helpers.Response(w, http.StatusCreated, map[string]any{"status": "ok"})
			return
		}
		helpers.Response(w, http.StatusCreated, map[string]any{"status": "ok", "user": userView(users[0])})
	}
}

/** PATCH /users/{id} — body: {"email"?: "...", "name"?: "...", "role"?: "admin|support"}.
 *  Admin only. Refuses to demote the last admin to non-admin. */
func PatchUsers(config *db.Config, mysql *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		caller := helpers.RequireAdmin(w, r, mysql)
		if caller == nil {
			return
		}

		id, err := strconv.ParseUint(r.PathValue("id"), 10, 64)
		if err != nil {
			helpers.Response(w, http.StatusBadRequest, map[string]any{"status": "error", "message": "invalid id"})
			return
		}

		var body struct {
			Email *string `json:"email"`
			Name  *string `json:"name"`
			Role  *string `json:"role"`
		}
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			helpers.Response(w, http.StatusBadRequest, map[string]any{"status": "error", "message": "invalid body"})
			return
		}

		existing, err := operations.ReadUserByID(mysql, id)
		if err != nil {
			helpers.Response(w, http.StatusInternalServerError, map[string]any{"status": "error", "message": "failed to read user"})
			return
		}
		if len(existing) == 0 {
			helpers.Response(w, http.StatusNotFound, map[string]any{"status": "error", "message": "user not found"})
			return
		}
		current := existing[0]

		patch := operations.User{}
		if body.Email != nil {
			email, err := normalizeEmail(*body.Email)
			if err != nil {
				helpers.Response(w, http.StatusBadRequest, map[string]any{"status": "error", "message": "invalid email"})
				return
			}
			patch.Email = email
		}
		if body.Name != nil {
			patch.Name = strings.TrimSpace(*body.Name)
		}
		if body.Role != nil {
			role := strings.ToLower(strings.TrimSpace(*body.Role))
			if !allowedRoles[role] {
				helpers.Response(w, http.StatusBadRequest, map[string]any{"status": "error", "message": "invalid role"})
				return
			}
			patch.Role = role
		}
		if patch.Email == "" && patch.Name == "" && patch.Role == "" {
			helpers.Response(w, http.StatusBadRequest, map[string]any{"status": "error", "message": "no changes"})
			return
		}

		/** Prevent demoting the last admin. */
		if current.Role == "admin" && patch.Role != "" && patch.Role != "admin" {
			n, err := countAdmins(mysql)
			if err != nil {
				helpers.Response(w, http.StatusInternalServerError, map[string]any{"status": "error", "message": "failed to update user"})
				return
			}
			if n <= 1 {
				helpers.Response(w, http.StatusConflict, map[string]any{"status": "error", "code": "last_admin", "message": "cannot demote the last admin"})
				return
			}
		}

		if err := operations.UpdateUser(mysql, current.Email, patch); err != nil {
			var mErr *gomysql.MySQLError
			if errors.As(err, &mErr) && mErr.Number == 1062 {
				helpers.Response(w, http.StatusConflict, map[string]any{"status": "error", "message": "duplicate email"})
				return
			}
			helpers.Response(w, http.StatusInternalServerError, map[string]any{"status": "error", "message": "failed to update user"})
			return
		}

		/** If the email changed, the user's existing sessions reference the
		 *  old email and would be orphaned by the cleanup job. Migrate them. */
		if patch.Email != "" && patch.Email != current.Email {
			if _, err := mysql.Exec("UPDATE sessions SET email = ? WHERE email = ?", patch.Email, current.Email); err != nil {
				/** Non-fatal: the row update succeeded, sessions just need a
				 *  re-login. Log to stderr would go here if we had a logger. */
				_ = err
			}
		}

		users, _ := operations.ReadUserByID(mysql, id)
		if len(users) > 0 {
			helpers.Response(w, http.StatusOK, map[string]any{"status": "ok", "user": userView(users[0])})
			return
		}
		helpers.Response(w, http.StatusOK, map[string]any{"status": "ok"})
	}
}

/** DELETE /users/{id} — admin only. Refuses to delete the calling user
 *  or the last remaining admin. Active sessions for the deleted user are
 *  revoked immediately so they are signed out on the next request. */
func DeleteUsers(config *db.Config, mysql *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		caller := helpers.RequireAdmin(w, r, mysql)
		if caller == nil {
			return
		}

		id, err := strconv.ParseUint(r.PathValue("id"), 10, 64)
		if err != nil {
			helpers.Response(w, http.StatusBadRequest, map[string]any{"status": "error", "message": "invalid id"})
			return
		}

		existing, err := operations.ReadUserByID(mysql, id)
		if err != nil {
			helpers.Response(w, http.StatusInternalServerError, map[string]any{"status": "error", "message": "failed to read user"})
			return
		}
		if len(existing) == 0 {
			helpers.Response(w, http.StatusNotFound, map[string]any{"status": "error", "message": "user not found"})
			return
		}
		target := existing[0]

		if target.Email == caller.Email {
			helpers.Response(w, http.StatusBadRequest, map[string]any{"status": "error", "code": "self_delete", "message": "cannot delete yourself"})
			return
		}

		if target.Role == "admin" {
			n, err := countAdmins(mysql)
			if err != nil {
				helpers.Response(w, http.StatusInternalServerError, map[string]any{"status": "error", "message": "failed to delete user"})
				return
			}
			if n <= 1 {
				helpers.Response(w, http.StatusConflict, map[string]any{"status": "error", "code": "last_admin", "message": "cannot delete the last admin"})
				return
			}
		}

		if err := operations.DeleteUser(mysql, target.Email); err != nil {
			helpers.Response(w, http.StatusInternalServerError, map[string]any{"status": "error", "message": "failed to delete user"})
			return
		}

		/** Revoke active sessions immediately so the deleted user is signed
		 *  out on their next request rather than waiting for the 30-minute
		 *  purge cycle. */
		if _, err := mysql.Exec(
			"UPDATE sessions SET revoked_at = UTC_TIMESTAMP(6) WHERE email = ? AND revoked_at IS NULL",
			target.Email,
		); err != nil {
			_ = err
		}

		helpers.Response(w, http.StatusOK, map[string]any{"status": "ok"})
	}
}
