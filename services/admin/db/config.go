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

	/** Mailer Configuration */
	MailerURL string `json:"application_mailer_url"`

	/** Auth Configuration */
	PublicBaseURL    string `json:"application_public_base_url"`
	MagicLinkTTLMins int    `json:"application_magic_link_ttl_minutes"`
	SessionTTLDays   int    `json:"application_session_ttl_days"`

	/** Gitea Configuration — used by the Applications page to read and write
	 *  configuration files in the monorepo via the Gitea contents API. */
	GiteaURL    string `json:"gitea_url"`
	GiteaToken  string `json:"gitea_token"`
	GiteaOwner  string `json:"gitea_owner"`
	GiteaRepo   string `json:"gitea_repo"`
	GiteaBranch string `json:"gitea_branch"`
}

/** LoadConfig reads configuration from file */
func LoadConfig() (*Config, error) {
	data, err := os.ReadFile("/etc/admin/config.json")
	if err != nil {
		return nil, err
	}

	var config Config
	if err := json.Unmarshal(data, &config); err != nil {
		return nil, err
	}

	return &config, nil
}
