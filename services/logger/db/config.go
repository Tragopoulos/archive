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

	/** Storage Configuration */
	LogDirectory string `json:"application_log_directory"`

	/** Object Storage Configuration */
	ObjectStorageNamespace string `json:"application_object_storage_namespace"`
	ObjectStorageBucket    string `json:"application_object_storage_bucket"`
}

/** LoadConfig reads configuration from file */
func LoadConfig() (*Config, error) {
	data, err := os.ReadFile("/etc/logger/config.json")
	if err != nil {
		return nil, err
	}

	var config Config
	if err := json.Unmarshal(data, &config); err != nil {
		return nil, err
	}

	return &config, nil
}
