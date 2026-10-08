package routes

import (
	"admin/db"
	"admin/helpers"
	"admin/operations"
	"crypto/rand"
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"net/http"
	"net/mail"
	"net/url"
	"strings"
	"time"
)

/** POST /auth/request — body: {"email": "..."}
 *  Issues a single-use magic link and emails it to the user.
 *  Responds 200 even for unknown emails to prevent account enumeration. */
func Request(config *db.Config, mysql *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		/** Parse the JSON body into {email: "..."} */
		var body struct {
			Email string `json:"email"`
		}
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			helpers.Response(w, http.StatusBadRequest, map[string]any{"status": "error", "message": "invalid body"})
			return
		}

		/** Lowercase, trim, and RFC-5322-validate the email */
		addr, err := mail.ParseAddress(strings.TrimSpace(strings.ToLower(body.Email)))
		if err != nil {
			helpers.Response(w, http.StatusBadRequest, map[string]any{"status": "error", "message": "invalid email"})
			return
		}
		email := strings.ToLower(addr.Address)

		/** Refuse to proceed without a database; magic links must be persisted */
		if mysql == nil {
			helpers.Response(w, http.StatusServiceUnavailable, map[string]any{"status": "error", "message": "database unavailable"})
			return
		}

		/** Authorization gate: only registered users get a link. Strangers receive the same 200 as legitimate users so an attacker cannot probe which emails are in our users table. */
		users, err := operations.ReadUser(mysql, email)
		if err != nil || len(users) == 0 {
			helpers.Response(w, http.StatusOK, map[string]any{"status": "ok"})
			return
		}

		/** Resolve the link lifetime (config in minutes, default 10). */
		ttl := time.Duration(config.MagicLinkTTLMins) * time.Minute
		if ttl <= 0 {
			ttl = 10 * time.Minute
		}

		/** Generate a 256-bit random token; only its SHA-256 hash is stored. */
		buf := make([]byte, 32)
		if _, err := rand.Read(buf); err != nil {
			helpers.Response(w, http.StatusInternalServerError, map[string]any{"status": "error", "message": "failed to generate magic link"})
			return
		}
		token := hex.EncodeToString(buf)
		sum := sha256.Sum256([]byte(token))
		hash := hex.EncodeToString(sum[:])

		/** Persist the hash + email + expiry so /auth/verify can consume it. */
		if err := operations.CreateMagicLink(mysql, hash, email, ttl); err != nil {
			helpers.Response(w, http.StatusInternalServerError, map[string]any{"status": "error", "message": "failed to persist magic link"})
			return
		}

		/** Build the public verification URL the user will click. */
		base := strings.TrimRight(config.PublicBaseURL, "/")
		link := base + "/api/auth/verify?token=" + url.QueryEscape(token)

		/** Hand off to the mailer service to deliver the link by email. */
		if err := helpers.SendLoginEmail(config, email, link); err != nil {
			helpers.Response(w, http.StatusBadGateway, map[string]any{"status": "error", "message": "failed to send email"})
			return
		}

		/** Generic success response. */
		helpers.Response(w, http.StatusOK, map[string]any{"status": "ok"})
	}
}
