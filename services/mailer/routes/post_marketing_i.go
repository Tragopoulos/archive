package routes

/** Example curl:
curl -X POST http://localhost:8701/marketing_i -H "Content-Type: application/json" -d @- << 'EOF'
{
  "from": "support@syncrosocial.com",
  "to": "tragopoulos@icloud.com",
  "subject": "Marketing Email I",
  "template": "marketing_i",
  "components": [
    {
      "component": "content",
      "preheader": "Available for download now. Highly compatible. Designer friendly. More than 50% of total email opens occurred on a mobile device a mobile-friendly design is a must for email campaigns.",
      "logo_image": "https://placehold.co/100x30/2D3445/ffffff?text=LOGO",
      "supheader": "INTRODUCING",
      "heading": "Introducing our new product",
      "hero_image": "https://picsum.photos/seed/darkapp/340/280",
      "body": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
      "button_link": "#",
      "button_text": "Get started",
      "footer_text": "You are receiving this because you subscribed to our updates. You could change your",
      "footer_settings_link": "#",
      "footer_text_end": " anytime."
    }
  ]
}
EOF
*/

import (
	"bytes"
	"database/sql"
	"html/template"
	"log"
	"mailer/db"
	"mailer/helpers"
	"net/http"

	"github.com/oracle/oci-go-sdk/v65/objectstorage"
)

func PostMarketingI(htmlTemplates *template.Template, config *db.Config, hostname string, mysql *sql.DB, osClient *objectstorage.ObjectStorageClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		mail, err := helpers.DecodeMail(r)
		if err != nil {
			helpers.RenderError(w, http.StatusBadRequest, err.Error())
			return
		}

		mappedComponents := make(map[string]any, len(mail.Components))
		for _, comp := range mail.Components {
			if name, ok := comp["component"].(string); ok && name != "" {
				mappedComponents[name] = comp
			}
		}

		data := map[string]any{
			"Subject":    mail.Subject,
			"Components": mappedComponents,
		}

		var buf bytes.Buffer
		err = htmlTemplates.ExecuteTemplate(&buf, "marketing_i.html", data)
		if err != nil {
			log.Printf("Error executing template marketing_i.html: %v", err)
			helpers.RenderError(w, http.StatusUnprocessableEntity, "failed to render template")
			return
		}

		msg := helpers.BuildSMTPMessage(mail, buf.String())
		storageStatus, extraFields, err := helpers.StoreAndSendEmail(config, hostname, mysql, osClient, mail, "marketing_i", msg)
		if err != nil {
			helpers.RenderError(w, http.StatusInternalServerError, err.Error()+", storage: "+storageStatus)
			return
		}

		helpers.RenderSuccess(w, storageStatus, extraFields)
	}
}
