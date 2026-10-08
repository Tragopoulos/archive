package routes

/** Example curl:
curl -X POST http://localhost:8701/marketing_h -H "Content-Type: application/json" -d @- << 'EOF'
{
  "from": "support@syncrosocial.com",
  "to": "tragopoulos@icloud.com",
  "subject": "Marketing Email H",
  "template": "marketing_h",
  "components": [
    {
      "component": "content",
      "preheader": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      "header_logo_image": "https://placehold.co/100x30/127DB3/ffffff?text=LOGO",
      "header_heading": "Explore our latest features",
      "header_subheading": "Available for download now",
      "header_hero_image": "https://picsum.photos/seed/emailhero/530/300",
      "header_body": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
      "header_button_link": "#",
      "header_button": "Get started",
      "grid_item1_link": "#",
      "grid_item1_image": "https://picsum.photos/seed/general1/250/142",
      "grid_item1_title": "Feature overview",
      "grid_item1_text": "Lorem ipsum dolor sit amet, consectetuer adipiscing elit.",
      "grid_item2_link": "#",
      "grid_item2_image": "https://picsum.photos/seed/transact1/250/142",
      "grid_item2_title": "Account notifications",
      "grid_item2_text": "Sed do eiusmod tempor incididunt ut labore et dolore.",
      "grid_item3_link": "#",
      "grid_item3_image": "https://picsum.photos/seed/promo1/250/142",
      "grid_item3_title": "Product announcements",
      "grid_item3_text": "Duis aute irure dolor in reprehenderit in voluptate.",
      "grid_item4_link": "#",
      "grid_item4_image": "https://picsum.photos/seed/explore1/250/142",
      "grid_item4_title": "Weekly digest",
      "grid_item4_text": "Duis aute irure dolor in reprehenderit in voluptate.",
      "grid_button_link": "#",
      "grid_button": "Learn more",
      "footer_facebook_link": "#",
      "footer_facebook_image": "https://placehold.co/44x44/3b5998/ffffff?text=f",
      "footer_twitter_link": "#",
      "footer_twitter_image": "https://placehold.co/44x44/1da1f2/ffffff?text=t",
      "footer_google_link": "#",
      "footer_google_image": "https://placehold.co/44x44/dd4b39/ffffff?text=g",
      "footer_instagram_link": "#",
      "footer_instagram_image": "https://placehold.co/44x44/c13584/ffffff?text=in",
      "footer_text": "You are receiving this because you subscribed to our updates. You could change your",
      "footer_settings_link": "#",
      "footer_settings_label": "subscription settings",
      "footer_text_suffix": "anytime."
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

func PostMarketingH(htmlTemplates *template.Template, config *db.Config, hostname string, mysql *sql.DB, osClient *objectstorage.ObjectStorageClient) http.HandlerFunc {
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
		err = htmlTemplates.ExecuteTemplate(&buf, "marketing_h.html", data)
		if err != nil {
			log.Printf("Error executing template marketing_h.html: %v", err)
			helpers.RenderError(w, http.StatusUnprocessableEntity, "failed to render template")
			return
		}

		msg := helpers.BuildSMTPMessage(mail, buf.String())
		storageStatus, extraFields, err := helpers.StoreAndSendEmail(config, hostname, mysql, osClient, mail, "marketing_h", msg)
		if err != nil {
			helpers.RenderError(w, http.StatusInternalServerError, err.Error()+", storage: "+storageStatus)
			return
		}

		helpers.RenderSuccess(w, storageStatus, extraFields)
	}
}
