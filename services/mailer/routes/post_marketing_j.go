package routes

/** Example curl:
curl -X POST http://localhost:8701/marketing_j -H "Content-Type: application/json" -d @- << 'EOF'
{
  "from": "support@syncrosocial.com",
  "to": "tragopoulos@icloud.com",
  "subject": "Marketing Email J",
  "template": "marketing_j",
  "components": [
    {
      "component": "content",
      "preheader": "Available for download now. Highly compatible. Designer friendly. More than 50% of total email opens occurred on a mobile device a mobile-friendly design is a must for email campaigns.",
      "logo_image": "https://placehold.co/100x30/F0F0F0/000000?text=LOGO",
      "heading": "Discover our latest features",
      "subheading": "Available for download now",
      "hero_image": "https://picsum.photos/seed/emailwide/560/220",
      "body": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
      "button_link": "#",
      "button_text": "Get started",
      "item1_icon": "https://placehold.co/50x50/127DB3/ffffff?text=H",
      "item1_title": "Fast delivery",
      "item1_text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor.",
      "item2_icon": "https://placehold.co/50x50/E9703E/ffffff?text=D",
      "item2_title": "Easy setup",
      "item2_text": "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque.",
      "contact_email": "support@example.com",
      "social_facebook_link": "#",
      "social_facebook_image": "https://placehold.co/44x44/3b5998/ffffff?text=f",
      "social_twitter_link": "#",
      "social_twitter_image": "https://placehold.co/44x44/1da1f2/ffffff?text=t",
      "social_google_link": "#",
      "social_google_image": "https://placehold.co/44x44/dd4b39/ffffff?text=g",
      "social_instagram_link": "#",
      "social_instagram_image": "https://placehold.co/44x44/c13584/ffffff?text=in",
      "footer_text": "You are receiving this because you subscribed to our updates. You could change your",
      "footer_settings_link": "#"
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

func PostMarketingJ(htmlTemplates *template.Template, config *db.Config, hostname string, mysql *sql.DB, osClient *objectstorage.ObjectStorageClient) http.HandlerFunc {
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
		err = htmlTemplates.ExecuteTemplate(&buf, "marketing_j.html", data)
		if err != nil {
			log.Printf("Error executing template marketing_j.html: %v", err)
			helpers.RenderError(w, http.StatusUnprocessableEntity, "failed to render template")
			return
		}

		msg := helpers.BuildSMTPMessage(mail, buf.String())
		storageStatus, extraFields, err := helpers.StoreAndSendEmail(config, hostname, mysql, osClient, mail, "marketing_j", msg)
		if err != nil {
			helpers.RenderError(w, http.StatusInternalServerError, err.Error()+", storage: "+storageStatus)
			return
		}

		helpers.RenderSuccess(w, storageStatus, extraFields)
	}
}
