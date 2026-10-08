package routes

import (
	"database/sql"
	"html/template"
	"log"
	"mailer/db"
	"net/http"
	"strconv"
	"strings"
)

func GetEmails(htmlTemplates *template.Template, mysql *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if mysql == nil {
			http.Error(w, "database not configured", http.StatusServiceUnavailable)
			return
		}
		idStr := r.PathValue("id")
		if idStr == "" {
			http.Error(w, "missing id", http.StatusBadRequest)
			return
		}

		id, err := strconv.ParseUint(idStr, 10, 64)
		if err != nil {
			http.Error(w, "invalid id", http.StatusBadRequest)
			return
		}

		email, err := db.ReadEmailByID(mysql, id)
		if err != nil {
			log.Printf("Error reading email: %v", err)
			http.Error(w, "database error", http.StatusInternalServerError)
			return
		}
		if email == nil {
			http.Error(w, "email not found", http.StatusNotFound)
			return
		}

		mappedComponents := make(map[string]any, len(email.Components))
		for _, comp := range email.Components {
			if name, ok := comp["component"].(string); ok && name != "" {
				switch name {
				case "invoice":
					if rowsStr, ok := comp["invoice_rows"].(string); ok {
						comp["invoice_rows"] = template.HTML(rowsStr)
					}
					if taxStr, ok := comp["invoice_tax"].(string); ok {
						comp["invoice_tax"] = template.HTML(taxStr)
					}
					if totalStr, ok := comp["invoice_total"].(string); ok {
						comp["invoice_total"] = template.HTML(totalStr)
					}
				case "billing":
					if rowsStr, ok := comp["billing_invoice_rows"].(string); ok {
						comp["billing_invoice_rows"] = template.HTML(rowsStr)
					}
					if infoStr, ok := comp["billing_invoice_info"].(string); ok {
						comp["billing_invoice_info"] = template.HTML(infoStr)
					}
				case "welcome", "confirm_email", "trial_expired", "cancelled", "action", "alert", "reset_password", "footer":
					for key, val := range comp {
						if s, ok := val.(string); ok {
							comp[key] = template.HTML(s)
						}
					}
				}
				mappedComponents[name] = comp
			}
		}

		data := map[string]any{
			"Subject":    email.Subject,
			"Components": mappedComponents,
		}

		templateName := email.Template + ".html"
		var buf strings.Builder
		if err := htmlTemplates.ExecuteTemplate(&buf, templateName, data); err != nil {
			log.Printf("Error executing template %s: %v", templateName, err)
			http.Error(w, "failed to render template", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		w.Write([]byte(buf.String()))
	}
}
