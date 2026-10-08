package routes

/** Example curl:
curl -X POST http://localhost:8701/marketing_a -H "Content-Type: application/json" -d @- << 'EOF'
{
  "from": "support@syncrosocial.com",
  "to": "tragopoulos@icloud.com",
  "subject": "Your Weekly Update from Acme",
  "template": "marketing_a",
  "components": [
    {
      "component": "logo",
      "logo_image": "https://placehold.co/60x60/1B9EDA/ffffff?text=Logo",
      "logo_alt": "Acme Inc."
    },
    {
      "component": "hero",
      "view_online_link": "https://example.com/view-online",
      "view_online_text": "View online",
      "banner_image": "https://picsum.photos/seed/banner1/600/300",
      "banner_alt": "Banner"
    },
    {
      "component": "primary",
      "primary_greeting": "Dear [[FirstName]],",
      "primary_body_paragraph1": "Personalize the message where possible. This helps grab the readers' attention, and drives better engagement.",
      "primary_body_paragraph2": "Place important information at the beginning. Give the reader the opportunity to take action straight away with a clear call-to-action. In this example, there are multiple calls-to-action, so we need to follow a hierarchy.",
      "primary_cta_link": "https://example.com/primary-action",
      "primary_cta_text": "PRIMARY CALL TO ACTION",
      "primary_body_paragraph3": "Keep paragraphs and sentences short. For example, no more than 20 words per sentence, or five sentences per paragraph. Use direct, succinct and practical language with no hype or jargon. Communicate in a way that is easy to understand. Be friendly, clear, and concise.",
      "primary_heading": "Use sub-headings to break up content into sections",
      "primary_list_intro": "Use lists instead of long paragraphs to further simplify the message. Simple language drives content that is:",
      "primary_list_item1": "scannable",
      "primary_list_item2": "accessible to a wider audience",
      "primary_list_item3": "easier to understand",
      "primary_ordered_list_intro": "Use numbered lists when the list items are in a required order. For example:",
      "primary_ordered_item1": "This list item happens first.",
      "primary_ordered_item2": "This list item happens next."
    },
    {
      "component": "secondary",
      "secondary_heading": "Secondary content heading",
      "secondary_body": "Use the secondary content section to draw attention to a separate piece of content. If you are using a secondary call-to-action button, avoid using an image to reduce visual clutter.",
      "secondary_cta_link": "https://example.com/secondary-action",
      "secondary_cta_text": "SECONDARY CALL TO ACTION"
    },
    {
      "component": "tertiary",
      "tertiary_col1_image": "https://picsum.photos/seed/col1/260/200",
      "tertiary_col1_heading": "Tertiary content heading",
      "tertiary_col1_body": "Tertiary content with images should contain short sentences and text link",
      "tertiary_col1_link": "https://example.com/tertiary1",
      "tertiary_col1_link_text": "tertiary\u00a0call-to-action",
      "tertiary_col2_image": "https://picsum.photos/seed/col2/260/200",
      "tertiary_col2_heading": "Tertiary content heading",
      "tertiary_col2_body": "Tertiary content with images should contain short sentences and text link",
      "tertiary_col2_link": "https://example.com/tertiary2",
      "tertiary_col2_link_text": "tertiary\u00a0call-to-action",
      "tertiary_btn_col1_body": "Tertiary content should not contain images if you are using the tertiary call-to-action\u00a0buttons.",
      "tertiary_btn_col1_link": "https://example.com/tertiary-btn1",
      "tertiary_btn_col1_text": "TERTIARY CALL TO ACTION",
      "tertiary_btn_col2_body": "Tertiary content should not contain images if you are using the tertiary call-to-action\u00a0buttons.",
      "tertiary_btn_col2_link": "https://example.com/tertiary-btn2",
      "tertiary_btn_col2_text": "TERTIARY CALL TO ACTION"
    },
    {
      "component": "social",
      "social_facebook_link": "https://facebook.com/example",
      "social_instagram_link": "https://instagram.com/example",
      "social_linkedin_link": "https://linkedin.com/company/example",
      "social_twitter_link": "https://twitter.com/example",
      "social_youtube_link": "https://youtube.com/example"
    },
    {
      "component": "footer",
      "footer_legal_heading": "Legal disclaimers.",
      "footer_legal_body": "The footer block normally contains all relevant legal disclaimers, and any appropriate",
      "footer_links_link": "https://example.com/terms",
      "footer_links_text": "text links",
      "footer_unsubscribe_text": "The option to \"Unsubscribe\", and the relevant",
      "footer_privacy_link": "https://example.com/privacy",
      "footer_privacy_text": "Privacy policy"
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

func PostMarketingA(htmlTemplates *template.Template, config *db.Config, hostname string, mysql *sql.DB, osClient *objectstorage.ObjectStorageClient) http.HandlerFunc {
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
		err = htmlTemplates.ExecuteTemplate(&buf, "marketing_a.html", data)
		if err != nil {
			log.Printf("Error executing template marketing_a.html: %v", err)
			helpers.RenderError(w, http.StatusUnprocessableEntity, "failed to render template")
			return
		}

		msg := helpers.BuildSMTPMessage(mail, buf.String())
		storageStatus, extraFields, err := helpers.StoreAndSendEmail(config, hostname, mysql, osClient, mail, "marketing_a", msg)
		if err != nil {
			helpers.RenderError(w, http.StatusInternalServerError, err.Error()+", storage: "+storageStatus)
			return
		}

		helpers.RenderSuccess(w, storageStatus, extraFields)
	}
}
