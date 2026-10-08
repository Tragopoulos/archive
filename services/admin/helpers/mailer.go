package helpers

import (
	"admin/db"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

const (
	mailerTemplate = "cards_a"
	mailerFrom     = "support@syncrosocial.com"
)

/** SendLoginEmail asks the local mailer service to deliver a magic-link email
 *  using the cards_a template.
 *
 *  Components rendered:
 *    - logo: brand logo at the top
 *    - cta : title, intro, "Sign in" button → magic link, follow-up text
 *    - footer: copyright */
func SendLoginEmail(config *db.Config, to, link string) error {
	if config.MailerURL == "" {
		return fmt.Errorf("mailer_url is not configured")
	}

	year := time.Now().UTC().Year()

	payload := map[string]any{
		"from":    mailerFrom,
		"to":      to,
		"subject": "Sign in to Operations",
		"components": []map[string]any{
			{
				"component":   "cta",
				"title":       "Sign in to Operations",
				"text_before": "Click the button below to sign in. This link is valid for a single use and will expire shortly. If you did not request this email, you can safely ignore it.",
				"button":      "Sign in",
				"link":        link,
				"text_after":  "If the button does not work, copy and paste this URL into your browser: " + link,
			},
			{
				"component": "footer",
				"copyright": fmt.Sprintf("%d Operations", year),
			},
		},
	}

	raw, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	url := strings.TrimRight(config.MailerURL, "/") + "/" + mailerTemplate
	req, err := http.NewRequest(http.MethodPost, url, bytes.NewReader(raw))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 15 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("mailer returned %d: %s", resp.StatusCode, string(body))
	}
	return nil
}
