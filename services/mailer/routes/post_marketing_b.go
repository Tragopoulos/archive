package routes

/** Example curl:
curl -X POST http://localhost:8701/marketing_b -H "Content-Type: application/json" -d @- << 'EOF'
{
  "from": "support@syncrosocial.com",
  "to": "tragopoulos@icloud.com",
  "subject": "New Collection Launch - Summer 2026",
  "template": "marketing_b",
  "components": [
    {
      "component": "content",
      "logo_image": "https://placehold.co/136x60?text=Logo",
      "nav_link_1": "http://www.example.com",
      "nav_label_1": "NEW PRODUCTS",
      "nav_label_2": "SALES",
      "nav_link_3": "http://www.example.com",
      "nav_label_3": "ABOUT",
      "nav_link_4": "http://www.example.com",
      "nav_label_4": "CONTACTS",
      "banner_image": "https://picsum.photos/seed/cosmetics/680/300",
      "hero_heading": "New Collection Launch",
      "hero_subheading": "SUMMER 2026",
      "hero_description": "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat.",
      "promo_message": "GET <strong>5% OFF</strong> USING THE CODE",
      "promo_code": "LOREM26",
      "hero_button_link": "www.example.com",
      "hero_button_text": "SHOP NOW",
      "hashtag": "#LoremIpsum",
      "story_1_image": "https://picsum.photos/seed/story01/340/340",
      "story_1_title": "Story #01",
      "story_1_description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      "story_1_price": "Start from $ 68.00",
      "story_1_button_link": "http://www.example.com",
      "story_1_button_text": "SHOP NOW",
      "story_2_image": "https://picsum.photos/seed/story02/340/340",
      "story_2_title": "Story #02",
      "story_2_description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      "story_2_price": "Start from $ 68.00",
      "story_2_button_link": "http://www.example.com",
      "story_2_button_text": "SHOP NOW",
      "story_3_image": "https://picsum.photos/seed/story03/340/340",
      "story_3_title": "Story #03",
      "story_3_description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      "story_3_price": "Start from $ 68.00",
      "story_3_button_link": "http://www.example.com",
      "story_3_button_text": "SHOP NOW",
      "product_1_image": "https://picsum.photos/seed/product1/227/227",
      "product_1_name": "Love Bite",
      "product_1_price": "CAD $68/12 Pack",
      "product_1_link": "http://www.example.com",
      "product_1_button_text": "Shop Now",
      "product_2_image": "https://picsum.photos/seed/product2/227/227",
      "product_2_name": "Woven Tote Bag",
      "product_2_price": "CAD $68/12 Pack",
      "product_2_link": "http://www.example.com",
      "product_2_button_text": "Shop Now",
      "product_3_image": "https://picsum.photos/seed/product3/227/227",
      "product_3_name": "Wild Card",
      "product_3_price": "CAD $68/12 Pack",
      "product_3_link": "http://www.example.com",
      "product_3_button_text": "Shop Now",
      "footer_logo_image": "https://placehold.co/102x42?text=Logo",
      "facebook_link": "https://www.facebook.com/",
      "facebook_icon_image": "https://placehold.co/32x32/1877f2/ffffff?text=f",
      "twitter_link": "https://www.twitter.com/",
      "twitter_icon_image": "https://placehold.co/32x32/3b5998/ffffff?text=t",
      "instagram_link": "https://www.instagram.com/",
      "instagram_icon_image": "https://placehold.co/32x32/c13584/ffffff?text=in",
      "footer_address": "Acme Inc. 123 Van Ness, San Francisco 94102",
      "footer_nav_link_1": "www.example.com",
      "footer_nav_label_1": "NEW PRODUCTS",
      "footer_nav_link_2": "www.example.com",
      "footer_nav_label_2": "SALES",
      "footer_nav_link_3": "www.example.com",
      "footer_nav_label_3": "ABOUT",
      "footer_nav_link_4": "www.example.com",
      "footer_nav_label_4": "CONTACTS",
      "footer_nav_link_5": "www.example.com",
      "footer_nav_label_5": "FAQ",
      "footer_terms_heading": "Terms and conditions",
      "footer_terms_text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      "unsubscribe_link": "http://www.example.com",
      "unsubscribe_text": "Unsubscribe",
      "manage_preferences_link": "http://www.example.com",
      "manage_preferences_text": "Manage Preferences"
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

func PostMarketingB(htmlTemplates *template.Template, config *db.Config, hostname string, mysql *sql.DB, osClient *objectstorage.ObjectStorageClient) http.HandlerFunc {
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
		err = htmlTemplates.ExecuteTemplate(&buf, "marketing_b.html", data)
		if err != nil {
			log.Printf("Error executing template marketing_b.html: %v", err)
			helpers.RenderError(w, http.StatusUnprocessableEntity, "failed to render template")
			return
		}

		msg := helpers.BuildSMTPMessage(mail, buf.String())
		storageStatus, extraFields, err := helpers.StoreAndSendEmail(config, hostname, mysql, osClient, mail, "marketing_b", msg)
		if err != nil {
			helpers.RenderError(w, http.StatusInternalServerError, err.Error()+", storage: "+storageStatus)
			return
		}

		helpers.RenderSuccess(w, storageStatus, extraFields)
	}
}
