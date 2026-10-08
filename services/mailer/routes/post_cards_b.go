package routes

/** Example curl:
curl -X POST http://localhost:8701/cards_b -H "Content-Type: application/json" -d @- << 'EOF'
{
  "from": "support@syncrosocial.com",
  "to": "tragopoulos@icloud.com",
  "subject": "Confirm your email address",
  "template": "cards_b",
  "components": [
    {
      "component": "theme",
      "bg_color": "#f9f9f9",
      "card_bg_color": "#ffffff",
      "card_border_color": "#dddddd",
      "text_color": "#555555",
      "button_color": "#348eda",
      "heading_color": "#000000",
      "link_color": "#348eda",
      "total_border_color": "#333333"
    },
    {
      "component": "action",
      "action_body_1": "Please confirm your email address by clicking the link below.",
      "action_body_2": "We may need to send you critical information about our service and it is important that we have an accurate email address.",
      "action_button_link": "https://example.com/confirm",
      "action_button_text": "Confirm email address",
      "action_signature": "&mdash; The Lorem Ipsum Team"
    },
    {
      "component": "alert",
      "alert_color": "#FF9F00",
      "alert_text": "Warning: You're approaching your limit. Please upgrade.",
      "alert_body_1": "You have <strong>1 free report</strong> remaining.",
      "alert_body_2": "Add your credit card now to upgrade your account to a premium plan to ensure you don't miss out on any reports.",
      "alert_button_link": "https://example.com/upgrade",
      "alert_button_text": "Upgrade my account",
      "alert_signature": "Thanks for choosing Acme Inc."
    },
    {
      "component": "billing",
      "billing_amount_heading": "$33.98 Paid",
      "billing_subheading": "Thanks for using Acme Inc.",
      "billing_invoice_info": "Lee Munroe<br>Invoice #12345<br>June 01 2026",
      "billing_invoice_rows": "<tr><td style=\"font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;color:#555555;border-top:1px solid #eeeeee;padding:5px 0;\">Pro Plan (Monthly)</td><td align=\"right\" style=\"font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;color:#555555;border-top:1px solid #eeeeee;padding:5px 0;\">$ 19.99</td></tr><tr><td style=\"font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;color:#555555;border-top:1px solid #eeeeee;padding:5px 0;\">Extra storage (10 GB)</td><td align=\"right\" style=\"font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;color:#555555;border-top:1px solid #eeeeee;padding:5px 0;\">$ 9.99</td></tr><tr><td style=\"font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;color:#555555;border-top:1px solid #eeeeee;padding:5px 0;\">SMS notifications</td><td align=\"right\" style=\"font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;color:#555555;border-top:1px solid #eeeeee;padding:5px 0;\">$ 4.00</td></tr>",
      "billing_invoice_total": "$ 33.98",
      "billing_browser_link": "https://example.com/invoice/12345",
      "company_address": "Acme Inc. 123 Van Ness, San Francisco 94102"
    },
    {
      "component": "footer",
      "footer": "<a href=\"https://example.com/unsubscribe\" style=\"color:#999;\">Unsubscribe</a> from these emails."
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

func PostCardsB(htmlTemplates *template.Template, config *db.Config, hostname string, mysql *sql.DB, osClient *objectstorage.ObjectStorageClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		mail, err := helpers.DecodeMail(r)
		if err != nil {
			helpers.RenderError(w, http.StatusBadRequest, err.Error())
			return
		}

		mappedComponents := make(map[string]any, len(mail.Components))
		for _, comp := range mail.Components {
			if name, ok := comp["component"].(string); ok && name != "" {
				if name == "billing" {
					if rowsStr, ok := comp["billing_invoice_rows"].(string); ok {
						comp["billing_invoice_rows"] = template.HTML(rowsStr)
					}
					if infoStr, ok := comp["billing_invoice_info"].(string); ok {
						comp["billing_invoice_info"] = template.HTML(infoStr)
					}
					if footerStr, ok := comp["billing_invoice_total"].(string); ok {
						comp["billing_invoice_total"] = template.HTML(footerStr)
					}
				}
				if name == "action" {
					if sigStr, ok := comp["action_signature"].(string); ok {
						comp["action_signature"] = template.HTML(sigStr)
					}
				}
				if name == "alert" {
					if body1Str, ok := comp["alert_body_1"].(string); ok {
						comp["alert_body_1"] = template.HTML(body1Str)
					}
					if body2Str, ok := comp["alert_body_2"].(string); ok {
						comp["alert_body_2"] = template.HTML(body2Str)
					}
				}
				if name == "footer" {
					if footerStr, ok := comp["footer"].(string); ok {
						comp["footer"] = template.HTML(footerStr)
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
		err = htmlTemplates.ExecuteTemplate(&buf, "cards_b.html", data)
		if err != nil {
			log.Printf("Error executing template cards_b.html: %v", err)
			helpers.RenderError(w, http.StatusUnprocessableEntity, "failed to render template")
			return
		}

		msg := helpers.BuildSMTPMessage(mail, buf.String())
		storageStatus, extraFields, err := helpers.StoreAndSendEmail(config, hostname, mysql, osClient, mail, "cards_b", msg)
		if err != nil {
			helpers.RenderError(w, http.StatusInternalServerError, err.Error()+", storage: "+storageStatus)
			return
		}

		helpers.RenderSuccess(w, storageStatus, extraFields)
	}
}
