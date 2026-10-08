package db

import (
	"encoding/json"
	"os"
)

type Config struct {
	/** MySQL Configuration */
	MySQL_USERNAME string `json:"mysql_username"`
	MySQL_PASSWORD string `json:"mysql_password"`
	MySQL_IP       string `json:"mysql_ip"`

	/** SMTP Configuration */
	SMTPHost     string `json:"email_smtp_host"`
	SMTPAddr     string `json:"email_smtp_addr"`
	SMTPUsername string `json:"email_smtp_username"`
	SMTPPassword string `json:"email_smtp_password"`

	/** Object Storage Configuration */
	ObjectStorageNamespace string `json:"application_object_storage_namespace"`
	ObjectStorageBucket    string `json:"application_object_storage_bucket"`

	/** Email directory for fallback storage */
	EmailDirectory string `json:"application_email_directory"`
}

/** LoadConfig reads configuration from file */
func LoadConfig() (*Config, error) {
	data, err := os.ReadFile("/etc/mailer/config.json")
	if err != nil {
		return nil, err
	}

	var config Config
	if err := json.Unmarshal(data, &config); err != nil {
		return nil, err
	}

	return &config, nil
}
