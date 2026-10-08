package routes

/** Example curl:
curl -X POST http://localhost:8701/marketing_f -H "Content-Type: application/json" -d @- << 'EOF'
{
  "from": "support@syncrosocial.com",
  "to": "tragopoulos@icloud.com",
  "subject": "Marketing Email F",
  "template": "marketing_f",
  "components": [
    {
      "component": "content",
      "header_background_image": "https://picsum.photos/seed/newsletter/620/300",
      "header_logo_link": "http://example.com",
      "header_logo_image": "https://placehold.co/50x50/1B1B1B/ffffff?text=L",
      "header_nav1_link": "http://example.com",
      "header_nav1_text": "Instagram",
      "header_nav2_link": "http://example.com",
      "header_nav2_text": "Dribbble",
      "header_nav3_link": "http://example.com",
      "header_nav3_text": "Website",
      "header_date": "February 17th, 2019",
      "header_title": "Weekly newsletter.",
      "article_heading": "New this week:",
      "article_browse_link": "http://example.com",
      "article_browse_text": "Browse the blog",
      "article_image_link": "http://example.com",
      "article_image": "https://picsum.photos/seed/clients/520/218",
      "article_title_link": "http://example.com",
      "article_title": "Where do I find my ideal clients?",
      "article_body": "Struggling to find new leads and clients is a horrible feeling. It doesn't matter if you're starting out or struggling by; it's still stressful.<br><br>People are everywhere. It's knowing the best place to show up and get them to be interested and to convert. That's the overwhelming part, isn't it? I get that.<br><br>Let's go over the plan to figure out how to know exactly where to show up and how to grab your target audience's attention.",
      "article_readmore_link": "http://example.com",
      "article_readmore_text": "Read the full blog",
      "resource_heading": "Featured in this week's post",
      "resource_description": "A free 7-page PDF which asks you a series of vital questions to get clear on how to best show up in front of your target audience.",
      "resource_background_image": "https://picsum.photos/seed/resources/520/160",
      "resource_icon_image": "https://placehold.co/24x24/1B1B1B/ffffff?text=+",
      "resource_title": "Brand visibility checklist",
      "resource_body": "Gain tremendous clarity in decision making, sticking to a consistent message and improved customer targeting.",
      "resource_link": "http://example.com",
      "resource_link_text": "View resource",
      "quote_text": "If you don't know where to find your ideal clients, start by focusing on WHO that ideal client is!",
      "quote_author_image": "https://placehold.co/40x40/cccccc/333333?text=C",
      "quote_author": "Jane Doe",
      "quote_company": "Lorem Consulting",
      "cta_heading": "What are you waiting for?",
      "cta_button_link": "http://example.com",
      "cta_button_text": "Read the newest post",
      "footer_greeting": "Say hello & #128075;",
      "footer_description": "We are always looking for new exciting projects and collaborations. Feel free to contact us.",
      "footer_social1_link": "http://example.com",
      "footer_social1_image": "https://placehold.co/20x20/333333/ffffff?text=f",
      "footer_social2_link": "http://example.com",
      "footer_social2_image": "https://placehold.co/18x18/333333/ffffff?text=d",
      "footer_social3_link": "http://example.com",
      "footer_social3_image": "https://placehold.co/20x20/333333/ffffff?text=ig",
      "footer_address": "King street, 2901 Marmara road, Newyork, WA 98122-1090",
      "footer_email": "hello@example.com"
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

func PostMarketingF(htmlTemplates *template.Template, config *db.Config, hostname string, mysql *sql.DB, osClient *objectstorage.ObjectStorageClient) http.HandlerFunc {
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
		err = htmlTemplates.ExecuteTemplate(&buf, "marketing_f.html", data)
		if err != nil {
			log.Printf("Error executing template marketing_f.html: %v", err)
			helpers.RenderError(w, http.StatusUnprocessableEntity, "failed to render template")
			return
		}

		msg := helpers.BuildSMTPMessage(mail, buf.String())
		storageStatus, extraFields, err := helpers.StoreAndSendEmail(config, hostname, mysql, osClient, mail, "marketing_f", msg)
		if err != nil {
			helpers.RenderError(w, http.StatusInternalServerError, err.Error()+", storage: "+storageStatus)
			return
		}

		helpers.RenderSuccess(w, storageStatus, extraFields)
	}
}
