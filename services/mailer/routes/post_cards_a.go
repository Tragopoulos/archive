package routes

/** Example curl:
curl -X POST http://localhost:8701/cards_a -H "Content-Type: application/json" -d @- << 'EOF'
{
  "from": "support@syncroinspect.com",
    "to": "tragopoulos@icloud.com",
    "subject": "Lorem Ipsum Update",
    "template": "cards_a",
    "components": [
        {
            "component": "logo",
            "logo": "https://cdn.worldvectorlogo.com/logos/lorem-lorem.svg"
        },
        {
            "component": "hero",
            "hero_image": "https://picsum.photos/600/300",
            "hero_logo": "https://cdn.worldvectorlogo.com/logos/lorem-lorem.svg"
        },
        {
            "component": "cta",
            "title": "Lorem Ipsum Dolor Sit Amet",
            "text_before": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Please click the button below to complete your registration.",
            "text_after": "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris. If you have any questions simply reply to this email.",
            "button": "Complete Registration",
            "link": "https://example.com/verify"
        },
        {
            "component": "invoice",
            "invoice_title": "Order Summary",
            "invoice_rows": "<tr><td style=\"width:60%;padding-top:10px;font-weight:400;word-break:normal;\">Lorem ipsum dolor sit amet</td><td style=\"width:20%;text-align:right;font-weight:400;word-break:normal;padding-top:10px;\">2</td><td style=\"width:20%;text-align:right;font-weight:400;word-break:normal;padding-top:10px;\">&euro;19.00</td></tr><tr><td style=\"font-weight:400;word-break:normal;\">Consectetur adipiscing elit</td><td style=\"text-align:right;font-weight:400;word-break:normal;\">1</td><td style=\"text-align:right;font-weight:400;word-break:normal;\">&euro;10.02</td></tr><tr><td style=\"font-weight:400;word-break:normal;padding-bottom:10px;\">Sed do eiusmod tempor</td><td style=\"text-align:right;font-weight:400;word-break:normal;padding-bottom:10px;\">3</td><td style=\"text-align:right;font-weight:400;word-break:normal;padding-bottom:10px;\">&euro;5.50</td></tr>",
            "invoice_tax_label": "VAT",
            "invoice_tax": "&euro;0.00",
            "invoice_total_label": "Total",
            "invoice_total": "&euro;64.52"
        },
        {
            "component": "warning",
            "warning_label": "WARNING",
            "warning_title": "Lorem Ipsum Dolor",
            "warning_text": "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
            "warning_link": "https://example.com/warning",
            "warning_button": "More Details"
        },
        {
            "component": "alert",
            "alert_label": "ALERT",
            "alert_title": "Excepteur Sint Occaecat",
            "alert_text": "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
            "alert_link": "https://example.com/alert",
            "alert_button": "View Details"
        },
        {
            "component": "success",
            "success_label": "SUCCESS",
            "success_title": "Nemo Enim Ipsam",
            "success_text": "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores.",
            "success_link": "https://example.com/success",
            "success_button": "Continue"
        },
        {
            "component": "info",
            "info_label": "INFO",
            "info_title": "Quis Autem Vel",
            "info_text": "Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur.",
            "info_link": "https://example.com/info",
            "info_button": "Learn More"
        },
        {
            "component": "footer",
            "copyright": "2026 Lorem Ipsum Inc."
        },
        {
            "component": "footer_extended",
            "twitter_link": "https://twitter.com/example",
            "twitter_icon": "https://placehold.co/24x24/1da1f2/ffffff?text=t",
            "facebook_link": "https://facebook.com/example",
            "facebook_icon": "https://placehold.co/24x24/3b5998/ffffff?text=f",
            "instagram_link": "https://instagram.com/example",
            "instagram_icon": "https://placehold.co/24x24/c13584/ffffff?text=in",
            "youtube_link": "https://youtube.com/example",
            "youtube_icon": "https://placehold.co/24x24/ff0000/ffffff?text=yt",
            "copyright": "2026 Lorem Ipsum Inc.",
            "preferences_link": "https://example.com/preferences",
            "unsubscribe_link": "https://example.com/unsubscribe"
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

func PostCardsA(htmlTemplates *template.Template, config *db.Config, hostname string, mysql *sql.DB, osClient *objectstorage.ObjectStorageClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		mail, err := helpers.DecodeMail(r)
		if err != nil {
			helpers.RenderError(w, http.StatusBadRequest, err.Error())
			return
		}

		mappedComponents := make(map[string]any, len(mail.Components))
		for _, comp := range mail.Components {
			if name, ok := comp["component"].(string); ok && name != "" {
				if name == "invoice" {
					if rowsStr, ok := comp["invoice_rows"].(string); ok {
						comp["invoice_rows"] = template.HTML(rowsStr)
					}
					if taxStr, ok := comp["invoice_tax"].(string); ok {
						comp["invoice_tax"] = template.HTML(taxStr)
					}
					if totalStr, ok := comp["invoice_total"].(string); ok {
						comp["invoice_total"] = template.HTML(totalStr)
					}
				}
				mappedComponents[name] = comp
			}
		}

		data := map[string]any{
			"Subject":    mail.Subject,
			"Components": mappedComponents,
		}

		var buf bytes.Buffer
		err = htmlTemplates.ExecuteTemplate(&buf, "cards_a.html", data)
		if err != nil {
			log.Printf("Error executing template cards_a.html: %v", err)
			helpers.RenderError(w, http.StatusUnprocessableEntity, "failed to render template")
			return
		}

		msg := helpers.BuildSMTPMessage(mail, buf.String())
		storageStatus, extraFields, err := helpers.StoreAndSendEmail(config, hostname, mysql, osClient, mail, "cards_a", msg)
		if err != nil {
			helpers.RenderError(w, http.StatusInternalServerError, err.Error()+", storage: "+storageStatus)
			return
		}

		helpers.RenderSuccess(w, storageStatus, extraFields)
	}
}
