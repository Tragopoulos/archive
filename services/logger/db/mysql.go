package db

import (
	"context" // Added context
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"time"

	_ "github.com/go-sql-driver/mysql"
)

/** Returns a MySQL connection pool */
func CreateMySQL(config *Config) (*sql.DB, error) {
	if config.MySQL_USERNAME == "" || config.MySQL_IP == "" {
		return nil, fmt.Errorf("mysql database configuration is missing required fields")
	}

	dsn := fmt.Sprintf("%s:%s@tcp(%s)/logger?parseTime=true&loc=UTC",
		config.MySQL_USERNAME,
		config.MySQL_PASSWORD,
		config.MySQL_IP,
	)

	dbConn, err := sql.Open("mysql", dsn)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	dbConn.SetMaxOpenConns(50)
	dbConn.SetMaxIdleConns(50)
	dbConn.SetConnMaxLifetime(5 * time.Minute)

	if err := dbConn.Ping(); err != nil {
		dbConn.Close()
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	return dbConn, nil
}

/** Log is the strict contract that callers must respect */
type Log struct {
	Severity            string           `json:"severity"`
	Message             *string          `json:"message"`
	Violations          *json.RawMessage `json:"violations"`
	Method              string           `json:"method"`
	Route               string           `json:"route"`
	Hostname            *string          `json:"hostname"`
	ClientIP            *string          `json:"client_ip"`
	LoadBalancerIP      *string          `json:"load_balancer_ip"`
	ApiGatewayIP        *string          `json:"api_gateway_ip"`
	OciRequestID        *string          `json:"oci_request_id"`
	AcceptEncoding      *string          `json:"accept_encoding"`
	ContentType         *string          `json:"content_type"`
	ContentLength       *int             `json:"content_length"`
	AccountID           *string          `json:"account_id"`
	DeviceID            *string          `json:"device_id"`
	AuthTime            *time.Time       `json:"auth_time"`
	AuthExpiresAt       *time.Time       `json:"auth_expires_at"`
	Platform            *string          `json:"platform"`
	UARaw               *string          `json:"ua_raw"`
	UADeviceFamily      *string          `json:"ua_device_family"`
	UADeviceBrand       *string          `json:"ua_device_brand"`
	UADeviceModel       *string          `json:"ua_device_model"`
	UAOS                *string          `json:"ua_os"`
	UAOSVersion         *string          `json:"ua_os_version"`
	UA                  *string          `json:"ua"`
	UAVersion           *string          `json:"ua_version"`
	City                *string          `json:"city"`
	Country             *string          `json:"country"`
	CountryISO          *string          `json:"country_iso"`
	AccuracyRadius      *int16           `json:"accuracy_radius"`
	Latitude            *float64         `json:"latitude"`
	Longitude           *float64         `json:"longitude"`
	MetroCode           *int16           `json:"metro_code"`
	TimeZone            *string          `json:"time_zone"`
	PostalCode          *string          `json:"postal_code"`
	IsAnonymousProxy    bool             `json:"is_anonymous_proxy"`
	IsAnycast           bool             `json:"is_anycast"`
	IsSatelliteProvider bool             `json:"is_satellite_provider"`
	ASN                 *int             `json:"asn"`
	ASNOrg              *string          `json:"asn_org"`
	Origin              *string          `json:"origin"`
	ResHTTPStatus       *int16           `json:"res_http_status"`
	ResHTTPText         *string          `json:"res_http_text"`
	ResBody             *json.RawMessage `json:"res_body"`
	ReqBody             *json.RawMessage `json:"req_body"`
}

/** InsertLog writes a log entry to MySQL */
func InsertLog(pool *sql.DB, entry *Log, createdAt time.Time, hostname string) (int64, error) {
	/** Use hostname from payload if available, otherwise use local hostname */
	logHostname := hostname
	if entry.Hostname != nil && *entry.Hostname != "" {
		logHostname = *entry.Hostname
	}

	/** Decode device_id from hex to binary */
	var deviceID []byte
	if entry.DeviceID != nil {
		b, err := hex.DecodeString(*entry.DeviceID)
		if err != nil {
			return 0, fmt.Errorf("invalid device_id hex: %w", err)
		}
		deviceID = b
	}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	result, err := pool.ExecContext(ctx,
		`INSERT INTO logs (
            created_at, severity, message, violations, method, route, hostname,
            client_ip, load_balancer_ip, api_gateway_ip, oci_request_id,
            accept_encoding, content_type, content_length,
            account_id, device_id, auth_time, auth_expires_at,
            platform, ua_raw, ua_device_family, ua_device_brand, ua_device_model,
            ua_os, ua_os_version, ua, ua_version,
            city, country, country_iso, accuracy_radius, latitude, longitude,
            metro_code, time_zone, postal_code,
            is_anonymous_proxy, is_anycast, is_satellite_provider,
            asn, asn_org, origin, res_http_status, res_http_text, res_body, req_body
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		createdAt, entry.Severity, entry.Message, rawBytes(entry.Violations), entry.Method, entry.Route, logHostname,
		entry.ClientIP, entry.LoadBalancerIP, entry.ApiGatewayIP, entry.OciRequestID,
		entry.AcceptEncoding, entry.ContentType, entry.ContentLength,
		entry.AccountID, deviceID, entry.AuthTime, entry.AuthExpiresAt,
		entry.Platform, entry.UARaw, entry.UADeviceFamily, entry.UADeviceBrand, entry.UADeviceModel,
		entry.UAOS, entry.UAOSVersion, entry.UA, entry.UAVersion,
		entry.City, entry.Country, entry.CountryISO, entry.AccuracyRadius, entry.Latitude, entry.Longitude,
		entry.MetroCode, entry.TimeZone, entry.PostalCode,
		entry.IsAnonymousProxy, entry.IsAnycast, entry.IsSatelliteProvider,
		entry.ASN, entry.ASNOrg, entry.Origin, entry.ResHTTPStatus, entry.ResHTTPText, rawBytes(entry.ResBody), rawBytes(entry.ReqBody),
	)

	if err != nil {
		return 0, err
	}

	return result.LastInsertId()
}

func rawBytes(r *json.RawMessage) []byte {
	if r == nil {
		return nil
	}
	return []byte(*r)
}
