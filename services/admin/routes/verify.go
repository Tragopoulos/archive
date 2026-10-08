package routes

import (
	"admin/db"
	"admin/helpers"
	"admin/operations"
	"crypto/rand"
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"net/http"
	"strings"
	"time"
)

/** GET /auth/verify?token=... — consumes a magic-link token, opens a session,
 *  sets the session cookie and redirects to the SPA root.
 *
 *  Flow:
 *    1. Hash the token and look up the magic link row.
 *    2. Delete the row immediately so the link is single-use.
 *    3. Reject if the link was already past its expiry.
 *    4. Mint a random session id, store its hash, set the cookie. */
func Verify(config *db.Config, mysql *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		/** Token arrives as a URL query param; trim whitespace defensively. */
		token := strings.TrimSpace(r.URL.Query().Get("token"))
		if token == "" {
			http.Error(w, "missing token", http.StatusBadRequest)
			return
		}

		if mysql == nil {
			http.Error(w, "database unavailable", http.StatusServiceUnavailable)
			return
		}

		/** Look up the magic link by SHA-256 of the token. The DB only stores
		 *  the hash, so a leaked dump cannot be used to forge sign-ins. */
		tokenSum := sha256.Sum256([]byte(token))
		hash := hex.EncodeToString(tokenSum[:])
		links, err := operations.ReadMagicLink(mysql, hash)
		if err != nil || len(links) == 0 {
			helpers.RedirectInvalid(w, r, config)
			return
		}
		link := links[0]

		/** Single-use: delete the row before issuing any session. A racing
		 *  second click that already passed ReadMagicLink will still mint a
		 *  session, but the window is microseconds and the worst outcome is
		 *  the legitimate user holding two sessions. */
		if err := operations.DeleteMagicLink(mysql, hash); err != nil {
			http.Error(w, "internal error", http.StatusInternalServerError)
			return
		}

		/** Expiry is enforced here, after the delete, so that even expired
		 *  links are consumed and can't be retried. */
		if time.Now().UTC().After(link.ExpiresAt) {
			helpers.RedirectInvalid(w, r, config)
			return
		}

		/** Session lifetime: config in days, default 30. */
		ttl := time.Duration(config.SessionTTLDays) * 24 * time.Hour
		if ttl <= 0 {
			ttl = 30 * 24 * time.Hour
		}

		/** Generate a 256-bit random session id; only its SHA-256 hash is
		 *  stored. The plaintext id lives only in the user's cookie. */
		buf := make([]byte, 32)
		if _, err := rand.Read(buf); err != nil {
			http.Error(w, "internal error", http.StatusInternalServerError)
			return
		}
		sessionID := hex.EncodeToString(buf)
		sum := sha256.Sum256([]byte(sessionID))
		sessionHash := hex.EncodeToString(sum[:])

		if err := operations.CreateSession(mysql, sessionHash, link.Email, ttl); err != nil {
			http.Error(w, "internal error", http.StatusInternalServerError)
			return
		}

		/** Cookie is HttpOnly+Secure+SameSite=Lax; see helpers.SetSessionCookie. */
		helpers.SetSessionCookie(w, sessionID, ttl)

		/** Land the user on the dashboard route; the SPA will route them
		 *  to the desktop or mobile variant based on the device. */
		base := strings.TrimRight(config.PublicBaseURL, "/")
		http.Redirect(w, r, base+"/dashboard", http.StatusFound)
	}
}
