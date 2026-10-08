package routes

/** Example curl:
curl -X POST http://localhost:8701/marketing_e -H "Content-Type: application/json" -d @- << 'EOF'
{
  "from": "support@syncrosocial.com",
  "to": "tragopoulos@icloud.com",
  "subject": "Marketing Email E",
  "template": "marketing_e",
  "components": [
    {
      "component": "content",
      "nav_facebook_link": "http://example.com",
      "nav_facebook_image": "https://placehold.co/15x15/333333/ffffff?text=f",
      "nav_twitter_link": "http://example.com",
      "nav_twitter_image": "https://placehold.co/16x14/333333/ffffff?text=t",
      "nav_google_link": "http://example.com",
      "nav_google_image": "https://placehold.co/22x15/333333/ffffff?text=g",
      "nav_instagram_link": "http://example.com",
      "nav_instagram_image": "https://placehold.co/16x15/333333/ffffff?text=in",
      "nav_logo_link": "http://example.com",
      "nav_logo_image": "https://placehold.co/130x22/ffffff/1B1B1B?text=LOGO",
      "hero_background_image": "https://picsum.photos/seed/editorial/620/300",
      "hero_heading": "Editor pick's.",
      "hero_seeall_link": "http://example.com",
      "hero_seeall_text": "See all",
      "hero_date": "12 November 2017",
      "hero_title_link": "http://example.com",
      "hero_title": "Party Jokes Startling But Unnecessary.",
      "hero_subtitle_link": "http://example.com",
      "hero_subtitle": "Living in today's metropolitan world of cellular phones, mobile computers and other.",
      "topstories_heading": "Top Stories.",
      "topstories_seeall_link": "http://example.com",
      "topstories_seeall_text": "See all",
      "story1_image_link": "http://example.com",
      "story1_image": "https://picsum.photos/seed/mountain/240/200",
      "story1_date": "12 November 2017",
      "story1_title_link": "http://example.com",
      "story1_title": "Go tell it to the mountain.",
      "story1_text_link": "http://example.com",
      "story1_text": "We offer the best in family holidays, perfect for kids looking for adventure.",
      "story2_image_link": "http://example.com",
      "story2_image": "https://picsum.photos/seed/coastal/240/200",
      "story2_date": "7 November 2017",
      "story2_title_link": "http://example.com",
      "story2_title": "Five other great coastal spots for kids.",
      "story2_text_link": "http://example.com",
      "story2_text": "Join Liz Bird as she scales some of the world's elevated escapes, from whitewater...",
      "post1_image_link": "http://example.com",
      "post1_image": "https://picsum.photos/seed/travel1/240/200",
      "post1_date": "7 November 2017",
      "post1_title_link": "http://example.com",
      "post1_title": "Go tell it to the mountain.",
      "post1_text_link": "http://example.com",
      "post1_text": "Join Liz Bird as she scales some of the world's elevated escapes, from whitewater...",
      "post2_date": "3 November 2017",
      "post2_title_link": "http://example.com",
      "post2_title": "Five other great coastal spots for kids.",
      "post2_text_link": "http://example.com",
      "post2_text": "We offer the best in family holidays, perfect for kids looking for adventure.",
      "post2_image_link": "http://example.com",
      "post2_image": "https://picsum.photos/seed/travel2/240/200",
      "post3_image_link": "http://example.com",
      "post3_image": "https://picsum.photos/seed/travel3/240/200",
      "post3_date": "7 November 2017",
      "post3_title_link": "http://example.com",
      "post3_title": "Go tell it to the mountain.",
      "post3_text_link": "http://example.com",
      "post3_text": "Join Liz Bird as she scales some of the world's elevated escapes, from whitewater...",
      "post4_date": "3 November 2017",
      "post4_title_link": "http://example.com",
      "post4_title": "Five other great coastal spots for kids.",
      "post4_text_link": "http://example.com",
      "post4_text": "We offer the best in family holidays, perfect for kids looking for adventure.",
      "post4_image_link": "http://example.com",
      "post4_image": "https://picsum.photos/seed/travel4/240/200",
      "cta_heading": "Follow Us.",
      "cta_text": "Co-ordinate campaigns and product launches, <br>with improved overall communication.",
      "cta_facebook_link": "http://example.com",
      "cta_facebook_image": "https://placehold.co/15x15/427BDC/ffffff?text=f",
      "cta_facebook_text": "Like us on Facebook",
      "cta_twitter_link": "http://example.com",
      "cta_twitter_image": "https://placehold.co/15x15/36B0FF/ffffff?text=t",
      "cta_twitter_text": "Follow us on Twitter",
      "footer_followus_heading": "Follow Us.",
      "footer_followus_text": "We are always looking for new exciting projects and collaborations. Feel free to contact us.",
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
      "footer_phone_link": "tel:749-977-3440",
      "footer_phone": "749-977-3440",
      "footer_email_link": "mailto:bo.grady@nathen.biz",
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

func PostMarketingE(htmlTemplates *template.Template, config *db.Config, hostname string, mysql *sql.DB, osClient *objectstorage.ObjectStorageClient) http.HandlerFunc {
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
		err = htmlTemplates.ExecuteTemplate(&buf, "marketing_e.html", data)
		if err != nil {
			log.Printf("Error executing template marketing_e.html: %v", err)
			helpers.RenderError(w, http.StatusUnprocessableEntity, "failed to render template")
			return
		}

		msg := helpers.BuildSMTPMessage(mail, buf.String())
		storageStatus, extraFields, err := helpers.StoreAndSendEmail(config, hostname, mysql, osClient, mail, "marketing_e", msg)
		if err != nil {
			helpers.RenderError(w, http.StatusInternalServerError, err.Error()+", storage: "+storageStatus)
			return
		}

		helpers.RenderSuccess(w, storageStatus, extraFields)
	}
}
