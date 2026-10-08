package db

import (
	"encoding/json"
	"os"
)

type MFAEmailConfig struct {
	From        string           `json:"from"`
	Subject     string           `json:"subject"`
	Template    string           `json:"template"`
	Components  []map[string]any `json:"components"`
	MaxAttempts int              `json:"max_attempts"`
}

type Config struct {
	/** Service Configuration */
	ServicePort              int    `json:"service_port"`
	ServiceName              string `json:"service_name"`
	ServiceReadTimeout       int    `json:"service_read_timeout"`
	ServiceWriteTimeout      int    `json:"service_write_timeout"`
	ServiceIdleTimeout       int    `json:"service_idle_timeout"`
	ServiceReadHeaderTimeout int    `json:"service_read_header_timeout"`

	/** NoSQL Configuration */
	NoSQLRegion        string `json:"nosql_region"`
	NoSQLCompartmentID string `json:"nosql_compartment_id"`

	/** GeoLite Database Paths */
	GeoLiteCityPath string `json:"geolite_city_path"`
	GeoLiteASNPath  string `json:"geolite_asn_path"`

	/** Security Tokens */
	NginxToken string `json:"service_nginx_token"`

	/** Internal Services */
	LoggerURL string `json:"service_logger_url"`
	MailerURL string `json:"service_mailer_url"`

	/** MFA Email */
	MFAEmail MFAEmailConfig `json:"mfa_email"`

	/** MFA Device Email */
	MFADeviceEmail MFAEmailConfig `json:"mfa_device_email"`

	/** Policy Data - Geo/Network */
	AllowedCountries []string `json:"application_allowed_countries"`
	BlockedASN       []int    `json:"application_blocked_asn"`

	/** Policy Data - Application */
	AllowedMethods   []string `json:"application_allowed_methods"`
	AllowedRoutes    []string `json:"application_allowed_routes"`
	AllowedProviders []string `json:"application_allowed_providers"`

	/** Policy Data - Security */
	ToolClients       []string `json:"application_tool_clients"`
	BlockedViolations []string `json:"application_blocked_violations"`
}

/** LoadConfig reads configuration from file */
func LoadConfig() (*Config, error) {
	data, err := os.ReadFile("/etc/api/api_config.json")
	if err != nil {
		return nil, err
	}

	var config Config
	if err := json.Unmarshal(data, &config); err != nil {
		return nil, err
	}

	return &config, nil
}
