package routes

/** Example curl:
curl -X POST http://localhost:8701/cards_c -H "Content-Type: application/json" -d @- << 'EOF'
{
  "from": "support@syncrosocial.com",
  "to": "tragopoulos@icloud.com",
  "subject": "Lorem Ipsum Notification",
  "template": "cards_c",
  "components": [
    {
      "component": "theme",
      "accent_color": "#333957",
      "logo_url": "https://cdn.worldvectorlogo.com/logos/lorem-lorem.svg"
    },
    {
      "component": "welcome",
      "welcome_heading": "Welcome to Lorem Ipsum",
      "welcome_body": "Hello John!<br>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Click the link below to login to your account:",
      "welcome_button_link": "https://example.com/login",
      "welcome_button": "Login to Your Account",
      "welcome_signature": "Best regards,<br><br>Jane Doe<br>Lorem Ipsum Inc., CEO"
    },
    {
      "component": "confirm_email",
      "confirm_heading": "Please confirm your email",
      "confirm_body": "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Please validate your email to get started.",
      "confirm_button_link": "https://example.com/confirm/abc123",
      "confirm_button": "Confirm Your Email",
      "confirm_help_heading": "Need Help?",
      "confirm_help_text": "Please send any feedback or bug info to <a href=\"mailto:support@example.com\" style=\"color:#2F67F6;\">support@example.com</a>"
    },
    {
      "component": "reset_password",
      "reset_heading": "Oops!",
      "reset_subheading": "It seems that you've forgotten your password.",
      "reset_button_link": "https://example.com/reset-password/xyz789",
      "reset_button": "Reset Password",
      "reset_notice": "If you did not make this request, just ignore this email. Otherwise please click the button above to reset your password."
    },
    {
      "component": "trial_expired",
      "trial_heading": "Uh-oh! Your free trial just ended!",
      "trial_body": "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. To give you some time to enter your payment info we'll still collect all your data for the next 30 days.",
      "trial_benefits": "- Consectetur adipiscing elit<br>- Sed do eiusmod tempor incididunt<br>- Ut labore et dolore magna aliqua",
      "trial_button_link": "https://example.com/billing",
      "trial_button": "Update Your Billing Info",
      "trial_secondary_link": "https://example.com/extend-trial",
      "trial_secondary_button": "Get A Trial Extension",
      "trial_signature": "Best regards,<br><br>Jane Doe<br>Lorem Ipsum Inc., CEO"
    },
    {
      "component": "invoice",
      "invoice_heading": "Thank you for your order",
      "invoice_body": "<p style=\"display:block;margin:13px 0;\">Hi John,</p><p style=\"display:block;margin:13px 0;\">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam volutpat ut est ac dignissim. Donec pulvinar ligula metus, sed imperdiet quam pretium at. Cras finibus hendrerit magna nec euismod.</p>",
      "invoice_rows": "<tr><td style=\"padding:5px 15px 5px 0;\">Lorem ipsum dolor sit</td><td style=\"padding:0 15px;\">1</td><td style=\"padding:0 0 0 15px;\" align=\"right\">$100.00</td></tr><tr><td style=\"padding:0 15px 5px 0;\">Consectetur adipiscing</td><td style=\"padding:0 15px;\">2</td><td style=\"padding:0 0 0 15px;\" align=\"right\">$25.00</td></tr><tr><td style=\"padding:0 15px 5px 0;\">Shipping + Handling</td><td style=\"padding:0 15px;\">1</td><td style=\"padding:0 0 0 15px;\" align=\"right\">$10.00</td></tr>",
      "invoice_total": "$160.00",
      "invoice_disclaimer": "<p style=\"display:block;margin:13px 0;\">Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam.</p>",
      "invoice_button_link": "https://example.com/shipping-status",
      "invoice_button": "Check Shipping Status",
      "invoice_signature": "Best regards,<br><br>Jane Doe<br>Lorem Ipsum Inc., CEO"
    },
    {
      "component": "cancelled",
      "cancelled_heading": "Please help us improve",
      "cancelled_body": "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. There could be various reasons for leaving and we hope you can help us learn and improve.",
      "cancelled_button_link": "https://example.com/feedback",
      "cancelled_button": "Share Your Feedback",
      "cancelled_signature": "Best regards,<br><br>Jane Doe<br>Lorem Ipsum Inc., CEO"
    },
    {
      "component": "footer",
      "company_address": "Lorem Ipsum Inc., 42 Dolor Street, Amet City 10115, US",
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

func PostCardsC(htmlTemplates *template.Template, config *db.Config, hostname string, mysql *sql.DB, osClient *objectstorage.ObjectStorageClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		mail, err := helpers.DecodeMail(r)
		if err != nil {
			helpers.RenderError(w, http.StatusBadRequest, err.Error())
			return
		}

		mappedComponents := make(map[string]any, len(mail.Components))
		for _, comp := range mail.Components {
			if name, ok := comp["component"].(string); ok && name != "" {
				if name == "welcome" {
					if bodyStr, ok := comp["welcome_body"].(string); ok {
						comp["welcome_body"] = template.HTML(bodyStr)
					}
					if sigStr, ok := comp["welcome_signature"].(string); ok {
						comp["welcome_signature"] = template.HTML(sigStr)
					}
				}
				if name == "confirm_email" {
					if helpStr, ok := comp["confirm_help_text"].(string); ok {
						comp["confirm_help_text"] = template.HTML(helpStr)
					}
				}
				if name == "trial_expired" {
					if bodyStr, ok := comp["trial_body"].(string); ok {
						comp["trial_body"] = template.HTML(bodyStr)
					}
					if benefitsStr, ok := comp["trial_benefits"].(string); ok {
						comp["trial_benefits"] = template.HTML(benefitsStr)
					}
					if sigStr, ok := comp["trial_signature"].(string); ok {
						comp["trial_signature"] = template.HTML(sigStr)
					}
				}
				if name == "invoice" {
					if bodyStr, ok := comp["invoice_body"].(string); ok {
						comp["invoice_body"] = template.HTML(bodyStr)
					}
					if rowsStr, ok := comp["invoice_rows"].(string); ok {
						comp["invoice_rows"] = template.HTML(rowsStr)
					}
					if disclaimerStr, ok := comp["invoice_disclaimer"].(string); ok {
						comp["invoice_disclaimer"] = template.HTML(disclaimerStr)
					}
					if sigStr, ok := comp["invoice_signature"].(string); ok {
						comp["invoice_signature"] = template.HTML(sigStr)
					}
				}
				if name == "cancelled" {
					if sigStr, ok := comp["cancelled_signature"].(string); ok {
						comp["cancelled_signature"] = template.HTML(sigStr)
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
		err = htmlTemplates.ExecuteTemplate(&buf, "cards_c.html", data)
		if err != nil {
			log.Printf("Error executing template cards_c.html: %v", err)
			helpers.RenderError(w, http.StatusUnprocessableEntity, "failed to render template")
			return
		}

		msg := helpers.BuildSMTPMessage(mail, buf.String())
		storageStatus, extraFields, err := helpers.StoreAndSendEmail(config, hostname, mysql, osClient, mail, "cards_c", msg)
		if err != nil {
			helpers.RenderError(w, http.StatusInternalServerError, err.Error()+", storage: "+storageStatus)
			return
		}

		helpers.RenderSuccess(w, storageStatus, extraFields)
	}
}
