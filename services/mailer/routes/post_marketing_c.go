package routes

/** Example curl:
curl -X POST http://localhost:8701/marketing_c -H "Content-Type: application/json" -d @- << 'EOF'
{
  "from": "support@syncrosocial.com",
  "to": "tragopoulos@icloud.com",
  "subject": "Marketing Email C",
  "template": "marketing_c",
  "components": [
    {
      "component": "content",
      "header_background_image": "https://picsum.photos/seed/techbg/620/550",
      "header_logo_link": "http://example.com",
      "header_logo_image": "https://placehold.co/130x22/1B1B1B/ffffff?text=LOGO",
      "header_nav1_link": "http://example.com",
      "header_nav1_text": "Features",
      "header_nav2_link": "http://example.com",
      "header_nav2_text": "Pricing",
      "header_nav3_link": "http://example.com",
      "header_nav3_text": "Blog",
      "hero_app_icon_image": "https://placehold.co/60x60/ffffff/1B1B1B?text=App",
      "hero_heading": "Your best app <br>is here.",
      "hero_subheading": "Co-ordinate campaigns and product <br>launches with ease.",
      "hero_appstore_link": "http://example.com",
      "hero_appstore_image": "https://placehold.co/127x40/ffffff/1B1B1B?text=App+Store",
      "hero_appstore_alt": "App Store",
      "hero_googleplay_link": "http://example.com",
      "hero_googleplay_image": "https://placehold.co/136x40/ffffff/1B1B1B?text=Google+Play",
      "hero_googleplay_alt": "Google Play",
      "hero_phone_image": "https://placehold.co/186x369/333333/ffffff?text=Phone",
      "features_heading": "Features.",
      "features_subheading": "Co-ordinate campaigns and product launches, <br>with improved overall communication.",
      "features_item1_image": "https://placehold.co/48x48/1B1B1B/ffffff?text=1",
      "features_item1_title": "Responsive",
      "features_item1_description": "Bushwick meh Blue Bottle pork belly mustache sk.",
      "features_item2_image": "https://placehold.co/48x48/1B1B1B/ffffff?text=2",
      "features_item2_title": "Diverse",
      "features_item2_description": "Keytar McSweeney's Williamsburg, readymade legg.",
      "features_item3_image": "https://placehold.co/48x48/1B1B1B/ffffff?text=3",
      "features_item3_title": "Interactive",
      "features_item3_description": "Hella narwhal Cosby sweater McSweeney's, salvia.",
      "clients_heading": "Our clients.",
      "clients_subheading": "Co-ordinate campaigns and product launches.",
      "client_logo_1": "https://placehold.co/67x19/cccccc/333333?text=Client",
      "client_logo_2": "https://placehold.co/86x29/cccccc/333333?text=Client",
      "client_logo_3": "https://placehold.co/32x38/cccccc/333333?text=C",
      "client_logo_4": "https://placehold.co/93x20/cccccc/333333?text=Client",
      "client_logo_5": "https://placehold.co/94x18/cccccc/333333?text=Client",
      "client_logo_6": "https://placehold.co/64x40/cccccc/333333?text=Client",
      "client_logo_7": "https://placehold.co/39x46/cccccc/333333?text=C",
      "client_logo_8": "https://placehold.co/100x22/cccccc/333333?text=Client",
      "cta_background_image": "https://picsum.photos/seed/ctabg/620/364",
      "cta_app_icon_image": "https://placehold.co/100x100/ffffff/1B1B1B?text=App",
      "cta_heading": "App is available for <br>iOS and Android.",
      "cta_appstore_link": "http://example.com",
      "cta_appstore_image": "https://placehold.co/127x52/1B1B1B/ffffff?text=App+Store",
      "cta_appstore_alt": "App Store",
      "cta_googleplay_link": "http://example.com",
      "cta_googleplay_image": "https://placehold.co/136x52/1B1B1B/ffffff?text=Google+Play",
      "cta_googleplay_alt": "Google Play",
      "footer_social_heading": "Follow Us.",
      "footer_social_description": "We are always looking for new exciting projects and collaborations. Feel free to contact us.",
      "footer_facebook_link": "http://example.com",
      "footer_facebook_image": "https://placehold.co/20x20/555555/ffffff?text=f",
      "footer_facebook_alt": "Facebook",
      "footer_twitter_link": "http://example.com",
      "footer_twitter_image": "https://placehold.co/21x18/555555/ffffff?text=t",
      "footer_twitter_alt": "Twitter",
      "footer_instagram_link": "http://example.com",
      "footer_instagram_image": "https://placehold.co/21x20/555555/ffffff?text=in",
      "footer_instagram_alt": "Instagram",
      "footer_pinterest_link": "http://example.com",
      "footer_pinterest_image": "https://placehold.co/20x20/555555/ffffff?text=p",
      "footer_pinterest_alt": "Pinterest",
      "footer_contact_heading": "Contact us.",
      "footer_address": "King street, 2901 Marmara road, Newyork, WA 98122-1090",
      "footer_phone": "749-977-3440",
      "footer_email": "bo.grady@nathen.biz"
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

func PostMarketingC(htmlTemplates *template.Template, config *db.Config, hostname string, mysql *sql.DB, osClient *objectstorage.ObjectStorageClient) http.HandlerFunc {
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
		err = htmlTemplates.ExecuteTemplate(&buf, "marketing_c.html", data)
		if err != nil {
			log.Printf("Error executing template marketing_c.html: %v", err)
			helpers.RenderError(w, http.StatusUnprocessableEntity, "failed to render template")
			return
		}

		msg := helpers.BuildSMTPMessage(mail, buf.String())
		storageStatus, extraFields, err := helpers.StoreAndSendEmail(config, hostname, mysql, osClient, mail, "marketing_c", msg)
		if err != nil {
			helpers.RenderError(w, http.StatusInternalServerError, err.Error()+", storage: "+storageStatus)
			return
		}

		helpers.RenderSuccess(w, storageStatus, extraFields)
	}
}
