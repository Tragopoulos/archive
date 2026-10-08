package routes

import (
	"database/sql"
	"errors"
	"mailer/db"
	"mailer/helpers"
	"net/http"
	"strconv"
	mysqlDriver "github.com/go-sql-driver/mysql"
)

/** GET /emails — Returns all stored emails. */
func Emails(mysql *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if mysql == nil {
			helpers.RenderError(w, http.StatusServiceUnavailable, "database not configured")
			return
		}
		emails, err := db.ReadEmails(mysql)
		if err != nil {
			if isMissingEmailStore(err) {
				helpers.Response(w, http.StatusOK, map[string]any{"status": "ok", "emails": []db.Email{}})
				return
			}
			helpers.RenderError(w, http.StatusInternalServerError, "failed to read emails")
			return
		}
		helpers.Response(w, http.StatusOK, map[string]any{"status": "ok", "emails": emails})
	}
}

/** GET /emails/{id} — Returns a single email. */
func Email(mysql *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if mysql == nil {
			helpers.RenderError(w, http.StatusServiceUnavailable, "database not configured")
			return
		}
		idStr := r.PathValue("id")
		if idStr == "" {
			helpers.RenderError(w, http.StatusBadRequest, "missing id")
			return
		}

		id, err := strconv.ParseUint(idStr, 10, 64)
		if err != nil {
			helpers.RenderError(w, http.StatusBadRequest, "invalid id")
			return
		}

		email, err := db.ReadEmailByID(mysql, id)
		if err != nil {
			if isMissingEmailStore(err) {
				helpers.RenderError(w, http.StatusNotFound, "email not found")
				return
			}
			helpers.RenderError(w, http.StatusInternalServerError, "failed to read email")
			return
		}
		if email == nil {
			helpers.RenderError(w, http.StatusNotFound, "email not found")
			return
		}
		helpers.Response(w, http.StatusOK, map[string]any{"status": "ok", "email": email})
	}
}

func isMissingEmailStore(err error) bool {
	var mysqlErr *mysqlDriver.MySQLError
	if !errors.As(err, &mysqlErr) {
		return false
	}

	switch mysqlErr.Number {
	case 1049, 1146:
		return true
	default:
		return false
	}
}