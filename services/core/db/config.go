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
}

/** LoadConfig reads configuration from file */
func LoadConfig() (*Config, error) {
	data, err := os.ReadFile("/etc/core/config.json")
	if err != nil {
		return nil, err
	}

	var config Config
	if err := json.Unmarshal(data, &config); err != nil {
		return nil, err
	}

	return &config, nil
}
