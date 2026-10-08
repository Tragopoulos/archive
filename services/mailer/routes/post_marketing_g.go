package routes

/** Example curl:
curl -X POST http://localhost:8701/marketing_g -H "Content-Type: application/json" -d @- << 'EOF'
{
  "from": "support@syncrosocial.com",
  "to": "tragopoulos@icloud.com",
  "subject": "Marketing Email G",
  "template": "marketing_g",
  "components": [
    {
      "component": "content",
      "header_logo_link": "http://example.com",
      "header_logo_image": "https://placehold.co/130x22/ffffff/1B1B1B?text=LOGO",
      "intro_label": "Introducing",
      "intro_heading": "Tousled food truck <br>polaroid, salvia.",
      "intro_image": "https://picsum.photos/seed/product4/346/277",
      "intro_description": "Co-ordinate campaigns and product launches, <br>with improved overall communication.",
      "intro_button_link": "http://example.com",
      "intro_button": "Download manual",
      "features_heading": "Features.",
      "features_description": "Co-ordinate campaigns and product launches, <br>with improved overall communication.",
      "feature1_icon": "https://placehold.co/74x74/eeeeee/333333?text=1",
      "feature1_title": "Online",
      "feature1_text": "Bushwick meh Blue Bottle pork belly mustache sk.",
      "feature2_icon": "https://placehold.co/74x74/eeeeee/333333?text=2",
      "feature2_title": "Diverse",
      "feature2_text": "Keytar McSweeney's Williamsburg, readymade legg.",
      "feature3_icon": "https://placehold.co/74x74/eeeeee/333333?text=3",
      "feature3_title": "Interactive",
      "feature3_text": "Hella narwhal Cosby sweater McSweeney's, salvia.",
      "features_button_link": "http://example.com",
      "features_button": "Learn More",
      "clients_heading": "Our clients.",
      "clients_description": "Co-ordinate campaigns and product launches.",
      "client_logo_1": "https://placehold.co/67x19/cccccc/333333?text=Client",
      "client_logo_1_alt": "",
      "client_logo_2": "https://placehold.co/86x29/cccccc/333333?text=Client",
      "client_logo_2_alt": "",
      "client_logo_3": "https://placehold.co/32x38/cccccc/333333?text=C",
      "client_logo_3_alt": "",
      "client_logo_4": "https://placehold.co/93x20/cccccc/333333?text=Client",
      "client_logo_4_alt": "",
      "client_logo_5": "https://placehold.co/94x18/cccccc/333333?text=Client",
      "client_logo_5_alt": "",
      "client_logo_6": "https://placehold.co/64x40/cccccc/333333?text=Client",
      "client_logo_6_alt": "",
      "client_logo_7": "https://placehold.co/39x46/cccccc/333333?text=C",
      "client_logo_7_alt": "",
      "client_logo_8": "https://placehold.co/100x22/cccccc/333333?text=Client",
      "client_logo_8_alt": "",
      "app_icon": "https://placehold.co/72x72/1595E7/ffffff?text=App",
      "app_heading": "App is available for iOS and Android.",
      "app_description": "Co-ordinate campaigns and product launches, <br>with improved overall communication.",
      "appstore_link": "http://example.com",
      "appstore_image": "https://placehold.co/127x52/1B1B1B/ffffff?text=App+Store",
      "appstore_alt": "App Store",
      "playstore_link": "http://example.com",
      "playstore_image": "https://placehold.co/136x52/1B1B1B/ffffff?text=Google+Play",
      "playstore_alt": "Google Play",
      "footer_address": "King street, 2901 Marmara road,<br>Newyork, WA 98122-1090",
      "footer_facebook_link": "http://example.com",
      "footer_facebook_image": "https://placehold.co/15x15/333333/ffffff?text=f",
      "footer_facebook_alt": "Facebook",
      "footer_twitter_link": "http://example.com",
      "footer_twitter_image": "https://placehold.co/16x14/333333/ffffff?text=t",
      "footer_twitter_alt": "Twitter",
      "footer_googleplus_link": "http://example.com",
      "footer_googleplus_image": "https://placehold.co/22x15/333333/ffffff?text=g+",
      "footer_googleplus_alt": "Google+",
      "footer_instagram_link": "http://example.com",
      "footer_instagram_image": "https://placehold.co/16x15/333333/ffffff?text=in",
      "footer_instagram_alt": "Instagram",
      "footer_manage_link": "http://example.com",
      "footer_manage_text": "Manage Preferences",
      "footer_unsubscribe_link": "http://example.com",
      "footer_unsubscribe_text": "Unsubscribe"
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

func PostMarketingG(htmlTemplates *template.Template, config *db.Config, hostname string, mysql *sql.DB, osClient *objectstorage.ObjectStorageClient) http.HandlerFunc {
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
		err = htmlTemplates.ExecuteTemplate(&buf, "marketing_g.html", data)
		if err != nil {
			log.Printf("Error executing template marketing_g.html: %v", err)
			helpers.RenderError(w, http.StatusUnprocessableEntity, "failed to render template")
			return
		}

		msg := helpers.BuildSMTPMessage(mail, buf.String())
		storageStatus, extraFields, err := helpers.StoreAndSendEmail(config, hostname, mysql, osClient, mail, "marketing_g", msg)
		if err != nil {
			helpers.RenderError(w, http.StatusInternalServerError, err.Error()+", storage: "+storageStatus)
			return
		}

		helpers.RenderSuccess(w, storageStatus, extraFields)
	}
}
