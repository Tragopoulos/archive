package helpers

import (
	"bytes"
	"crypto/tls"
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"mailer/db"
	"net"
	"net/http"
	"net/smtp"
	"os"
	"path/filepath"
	"time"

	"github.com/oracle/oci-go-sdk/v65/objectstorage"
)

type Mail struct {
	To         string           `json:"to"`
	From       string           `json:"from"`
	Subject    string           `json:"subject"`
	Components []map[string]any `json:"components"`
}

func DecodeMail(r *http.Request) (*Mail, error) {
	var mail Mail
	decoder := json.NewDecoder(io.LimitReader(r.Body, 1<<20))
	if err := decoder.Decode(&mail); err != nil {
		return nil, err
	}
	return &mail, nil
}

func ValidateMail(mail *Mail) bool {
	return mail.To != "" && mail.From != "" && mail.Subject != "" && len(mail.Components) > 0
}

func BuildSMTPMessage(mail *Mail, html string) []byte {
	var msg bytes.Buffer
	msg.WriteString("From: ")
	msg.WriteString(mail.From)
	msg.WriteString("\r\n")
	msg.WriteString("To: ")
	msg.WriteString(mail.To)
	msg.WriteString("\r\n")
	msg.WriteString("Subject: ")
	msg.WriteString(mail.Subject)
	msg.WriteString("\r\n")
	msg.WriteString("MIME-Version: 1.0\r\n")
	msg.WriteString("Content-Type: text/html; charset=\"UTF-8\"\r\n")
	msg.WriteString("\r\n")
	msg.WriteString(html)
	return msg.Bytes()
}

func StoreEmail(config *db.Config, mysql *sql.DB, osClient *objectstorage.ObjectStorageClient, hostname string, mail *Mail, templateName, emailStatus string) (int64, string, map[string]any, error) {
	timestamp := time.Now().UTC()
	record := &db.Email{
		CreatedAt:  timestamp,
		Hostname:   hostname,
		Status:     emailStatus,
		From:       mail.From,
		To:         mail.To,
		Subject:    mail.Subject,
		Template:   templateName,
		Components: mail.Components,
	}

	if hostname == "" {
		record.Hostname = "UNKNOWN"
	}

	var storageStatus string
	var extraFields map[string]any
	var recordID int64

	if mysql != nil {
		id, err := db.InsertEmail(mysql, record)
		if err != nil {
			fmt.Printf("store db error: %v\n", err)
		} else {
			recordID = id
			storageStatus = "stored"
			extraFields = map[string]any{"storage": "mysql", "id": id, "email_status": emailStatus}
		}
	}

	if storageStatus == "" {
		raw, err := json.Marshal(record)
		if err != nil {
			fmt.Printf("store marshal error: %v\n", err)
			return 0, "dropped", map[string]any{"storage": "none", "timestamp": timestamp.Format(time.RFC3339), "email_status": emailStatus}, fmt.Errorf("failed to marshal email record: %w", err)
		}

		fileName := timestamp.Format("20060102T150405Z") + ".json"
		emailsDir := config.EmailDirectory
		if emailsDir == "" {
			emailsDir = "/home/opc/mailer"
		}
		filePath := filepath.Join(emailsDir, fileName)
		os.MkdirAll(emailsDir, 0755)
		if err := os.WriteFile(filePath, raw, 0644); err != nil {
			fmt.Printf("store file write error: %v\n", err)
			return 0, "dropped", map[string]any{"storage": "none", "timestamp": timestamp.Format(time.RFC3339), "email_status": emailStatus}, fmt.Errorf("failed to persist email record: %w", err)
		}

		if osClient != nil && config.ObjectStorageNamespace != "" && config.ObjectStorageBucket != "" {
			err := db.UploadPendingEmails(osClient, config)
			if err != nil {
				fmt.Printf("store object storage error: %v\n", err)
			}

			if _, err := os.Stat(filePath); os.IsNotExist(err) {
				storageStatus = "fallback"
				extraFields = map[string]any{"storage": "object_storage", "email_status": emailStatus}
			}
		}

		if storageStatus == "" {
			storageStatus = "fallback"
			extraFields = map[string]any{"storage": "filesystem", "file": filePath, "email_status": emailStatus}
		}
	}

	if storageStatus == "" {
		return 0, "dropped", map[string]any{"storage": "none", "timestamp": timestamp.Format(time.RFC3339), "email_status": emailStatus}, fmt.Errorf("failed to persist email record")
	}

	return recordID, storageStatus, extraFields, nil
}

func StoreAndSendEmail(config *db.Config, hostname string, mysql *sql.DB, osClient *objectstorage.ObjectStorageClient, mail *Mail, templateName string, msg []byte) (string, map[string]any, error) {
	recordID, storageStatus, extraFields, err := StoreEmail(config, mysql, osClient, hostname, mail, templateName, "failed")
	if err != nil {
		return storageStatus, extraFields, err
	}
	if storageStatus != "stored" || recordID == 0 {
		return storageStatus, extraFields, fmt.Errorf("email must be stored in mysql before send")
	}

	if err := SendSMTP(config, msg, mail); err != nil {
		return storageStatus, extraFields, err
	}

	if mysql != nil && recordID > 0 {
		if err := db.UpdateEmailStatus(mysql, recordID, "sent"); err != nil {
			return storageStatus, extraFields, fmt.Errorf("email sent but failed to update sent status: %w", err)
		}
	}

	if extraFields == nil {
		extraFields = map[string]any{}
	}
	extraFields["email_status"] = "sent"
	return storageStatus, extraFields, nil
}

func SendSMTP(config *db.Config, msg []byte, mail *Mail) error {
	smtpAuth := smtp.PlainAuth("", config.SMTPUsername, config.SMTPPassword, config.SMTPHost)
	client, err := net.DialTimeout("tcp", config.SMTPAddr, 10*time.Second)
	if err != nil {
		return fmt.Errorf("smtp dial failed: %w", err)
	}
	defer client.Close()

	smtpDeadline := time.Now().Add(60 * time.Second)
	client.SetDeadline(smtpDeadline)

	smtpClient, err := smtp.NewClient(client, config.SMTPHost)
	if err != nil {
		return fmt.Errorf("smtp handshake failed: %w", err)
	}
	defer smtpClient.Close()

	if ok, _ := smtpClient.Extension("STARTTLS"); ok {
		tlsConfig := &tls.Config{ServerName: config.SMTPHost}
		if err := smtpClient.StartTLS(tlsConfig); err != nil {
			return fmt.Errorf("smtp starttls failed: %w", err)
		}
	}

	if err := smtpClient.Auth(smtpAuth); err != nil {
		return fmt.Errorf("smtp auth failed: %w", err)
	}

	if err := smtpClient.Mail(mail.From); err != nil {
		return fmt.Errorf("smtp MAIL FROM failed: %w", err)
	}

	if err := smtpClient.Rcpt(mail.To); err != nil {
		return fmt.Errorf("smtp RCPT TO failed: %w", err)
	}

	wc, err := smtpClient.Data()
	if err != nil {
		return fmt.Errorf("smtp DATA failed: %w", err)
	}

	if _, err := wc.Write(msg); err != nil {
		wc.Close()
		return fmt.Errorf("smtp write failed: %w", err)
	}

	if err := wc.Close(); err != nil {
		return fmt.Errorf("smtp finalize failed: %w", err)
	}

	client.SetDeadline(time.Time{})
	return nil
}

func RenderError(w http.ResponseWriter, status int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(map[string]any{"status": "error", "message": message})
}

func RenderSuccess(w http.ResponseWriter, storageStatus string, extraFields map[string]any) {
	response := map[string]any{
		"status":    storageStatus,
		"timestamp": time.Now().UTC().Format(time.RFC3339),
	}
	for k, v := range extraFields {
		response[k] = v
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

func Response(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}
