package helpers

import (
	"admin/db"
	"encoding/json"
	"net/http"
	"strings"
)

/** Response writes a JSON response */
func Response(w http.ResponseWriter, status int, body any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(body)
}

/** RedirectInvalid sends the user back to the SPA root with an error flag */
func RedirectInvalid(w http.ResponseWriter, r *http.Request, config *db.Config) {
	base := strings.TrimRight(config.PublicBaseURL, "/")
	http.Redirect(w, r, base+"/?error=invalid_token", http.StatusFound)
}
