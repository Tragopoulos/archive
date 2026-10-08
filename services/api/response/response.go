package response

import (
	"api/db"
	"api/request"
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"time"
)

/** Send writes the HTTP response and logs the request to the logger service */
func Send(w http.ResponseWriter, data *request.Data, config *db.Config) {
	/** Write status */
	statusCode := data.HTTPStatus
	if statusCode == 0 {
		statusCode = http.StatusInternalServerError
	}

	/** Build response body */
	now := time.Now()
	payload := map[string]any{}

	if data.ResBody != nil {
		payload = data.ResBody
	}

	responseBody := Response{
		ID:        data.LogID,
		TIMESTAMP: now.UnixMilli(),
		DATA:      payload,
	}

	/** Encode response body */
	encoded, err := json.Marshal(responseBody)
	if err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}

	/** Send response */
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	w.Write(encoded)

	/** Log to logger service (fire-and-forget goroutine) */
	if config.LoggerURL != "" {
		go dispatchLog(data, config)
	}
}

/** dispatchLog sends the transaction data to the logger service */
func dispatchLog(data *request.Data, config *db.Config) {
	var authTime, authExpiresAt *time.Time
	if data.JWTAuthTime > 0 {
		t := time.Unix(int64(data.JWTAuthTime), 0).UTC()
		authTime = &t
	}
	if data.JWTExpiresAt > 0 {
		t := time.Unix(int64(data.JWTExpiresAt), 0).UTC()
		authExpiresAt = &t
	}

	logPayload, err := json.Marshal(map[string]any{
		"severity":              data.Severity,
		"message":               data.Message,
		"violations":            data.Violations,
		"method":                data.Method,
		"route":                 data.Route,
		"hostname":              data.Hostname,
		"client_ip":             data.ClientIP,
		"load_balancer_ip":      data.LoadBalancerIP,
		"api_gateway_ip":        data.ApiGatewayIP,
		"oci_request_id":        data.RequestID,
		"accept_encoding":       data.AcceptEncoding,
		"content_type":          data.ContentType,
		"content_length":        data.ContentLength,
		"account_id":            data.AccountID,
		"device_id":             data.DeviceID,
		"auth_time":             authTime,
		"auth_expires_at":       authExpiresAt,
		"platform":              data.Platform,
		"ua_raw":                data.UARaw,
		"ua_device_family":      data.UADeviceFamily,
		"ua_device_brand":       data.UADeviceBrand,
		"ua_device_model":       data.UADeviceModel,
		"ua_os":                 data.UAOS,
		"ua_os_version":         data.UAOSVersion,
		"ua":                    data.UA,
		"ua_version":            data.UAVersion,
		"city":                  data.City,
		"country":               data.Country,
		"country_iso":           data.CountryISO,
		"accuracy_radius":       data.AccuracyRadius,
		"latitude":              data.Latitude,
		"longitude":             data.Longitude,
		"metro_code":            data.MetroCode,
		"time_zone":             data.TimeZone,
		"postal_code":           data.PostalCode,
		"is_anonymous_proxy":    data.IsAnonymousProxy,
		"is_anycast":            data.IsAnycast,
		"is_satellite_provider": data.IsSatelliteProvider,
		"asn":                   data.ASN,
		"asn_org":               data.ASNOrg,
		"origin":                data.Origin,
		"res_http_status":       data.HTTPStatus,
		"res_http_text":         data.HTTPStatusText,
		"res_body":              data.ResBody,
		"req_body":              data.ReqBody,
	})
	if err != nil {
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, "POST", config.LoggerURL, bytes.NewReader(logPayload))
	if err != nil {
		return
	}
	req.Header.Set("Content-Type", "application/json")
	http.DefaultClient.Do(req)
}
