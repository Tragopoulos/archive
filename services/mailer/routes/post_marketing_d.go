package routes

/** Example curl:
curl -X POST http://localhost:8701/marketing_d -H "Content-Type: application/json" -d @- << 'EOF'
{
  "from": "support@syncrosocial.com",
  "to": "tragopoulos@icloud.com",
  "subject": "Marketing Email D",
  "template": "marketing_d",
  "components": [
    {
      "component": "content",
      "nav_logo_link": "http://example.com",
      "nav_logo_image": "https://placehold.co/130x22/1B1B1B/ffffff?text=LOGO",
      "nav_link1_url": "http://example.com",
      "nav_link1_text": "World",
      "nav_link2_url": "http://example.com",
      "nav_link2_text": "Lifestyle",
      "nav_link3_url": "http://example.com",
      "nav_link3_text": "Travel",
      "nav_link4_url": "http://example.com",
      "nav_link4_text": "Technology",
      "cta_label": "Introducing",
      "cta_heading": "Fixie tote bag ethnic <br>keytar. Neutra.",
      "cta_image_link": "http://example.com",
      "cta_image": "https://picsum.photos/seed/product5/341/157",
      "cta_description": "Co-ordinate campaigns and product launches, <br>with improved overall communication.",
      "cta_button_link": "http://example.com",
      "cta_button_text": "Download manual",
      "product1_image": "https://picsum.photos/seed/backpack/230/240",
      "product1_brand": "Lorem Brand",
      "product1_name": "Canvas Backpack",
      "product1_description": "Synth polaroid bitters chillwave pickled. Vegan disrupt tousled, Portland keffiyeh aesthetic food truck.",
      "product1_button_link": "http://example.com",
      "product1_button_text": "Shop now",
      "product1_price": "1,491",
      "product2_brand": "Ipsum Brand",
      "product2_name": "Woven Tote Bag",
      "product2_description": "Synth polaroid bitters chillwave pickled. Vegan disrupt tousled, Portland keffiyeh aesthetic food truck.",
      "product2_button_link": "http://example.com",
      "product2_button_text": "Shop now",
      "product2_price": "1,491",
      "product2_image": "https://picsum.photos/seed/velvetbag/230/240",
      "voucher_heading": "Only till Monday!",
      "voucher_label": "Voucher code:",
      "voucher_code": "GMRW",
      "voucher_button_link": "http://example.com",
      "voucher_button_text": "Sale away",
      "voucher_note": "No minimum order value",
      "footer_social_heading": "Follow Us.",
      "footer_social_description": "We are always looking for new exciting projects and collaborations. Feel free to contact us.",
      "footer_facebook_link": "http://example.com",
      "footer_facebook_image": "https://placehold.co/20x20/555555/ffffff?text=f",
      "footer_twitter_link": "http://example.com",
      "footer_twitter_image": "https://placehold.co/21x18/555555/ffffff?text=t",
      "footer_instagram_link": "http://example.com",
      "footer_instagram_image": "https://placehold.co/21x20/555555/ffffff?text=in",
      "footer_pinterest_link": "http://example.com",
      "footer_pinterest_image": "https://placehold.co/20x20/555555/ffffff?text=p",
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

func PostMarketingD(htmlTemplates *template.Template, config *db.Config, hostname string, mysql *sql.DB, osClient *objectstorage.ObjectStorageClient) http.HandlerFunc {
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
		err = htmlTemplates.ExecuteTemplate(&buf, "marketing_d.html", data)
		if err != nil {
			log.Printf("Error executing template marketing_d.html: %v", err)
			helpers.RenderError(w, http.StatusUnprocessableEntity, "failed to render template")
			return
		}

		msg := helpers.BuildSMTPMessage(mail, buf.String())
		storageStatus, extraFields, err := helpers.StoreAndSendEmail(config, hostname, mysql, osClient, mail, "marketing_d", msg)
		if err != nil {
			helpers.RenderError(w, http.StatusInternalServerError, err.Error()+", storage: "+storageStatus)
			return
		}

		helpers.RenderSuccess(w, storageStatus, extraFields)
	}
}
