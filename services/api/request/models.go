package request

/** UnixMs is a Unix timestamp in milliseconds (UTC).
 *  Use ConvertAnyToUnixMs() to convert any incoming value to this type.
 *  Use db.ConvertUnixMsToTimestamp() to convert to time.Time for DB writes.
 */
type UnixMs int64

const (
	DEBUG     = "debug"     // Debugging application issues.
	INFO      = "info"      // Operational messages that require no action.
	NOTICE    = "notice"    // Significant system events.
	WARNING   = "warning"   // Error will occur if action is not taken.
	ERROR     = "error"     // Non-fatal significant errors.
	CRITICAL  = "critical"  // Major application failures.
	ALERT     = "alert"     // Action must be taken immediately.
	EMERGENCY = "emergency" // Application is unusable. Panic condition.
)

const (
	WEB     = "web"
	ANDROID = "android"
	IOS     = "ios"
)

const (
	ProviderPassword  = "password"
	ProviderGoogle    = "google"
	ProviderMicrosoft = "microsoft"
	ProviderApple     = "apple"
	ProviderX         = "x"
	ProviderFacebook  = "facebook"
	ProviderGithub    = "github"
)

const (
	RoleOwner   = "owner"   // Full control over the organization, including billing and deletion.
	RoleAdmin   = "admin"   // Can manage settings, members, and resources but cannot delete the organization.
	RoleManager = "manager" // Can manage day-to-day operations and assign tasks to members.
	RoleMember  = "member"  // Standard participant with read/write access to assigned resources.
	RoleViewer  = "viewer"  // Read-only access to resources.
	RoleGuest   = "guest"   // Limited, temporary access with restricted visibility.
)

const (
	DevicePhone   = "phone"
	DeviceTablet  = "tablet"
	DeviceDesktop = "desktop"
	DeviceUnknown = "unknown"
)

type Data struct {
	/** App Data */
	Severity       string   `json:"severity"`
	Message        string   `json:"message"`
	HTTPStatus     int      `json:"http_status"`
	HTTPStatusText string   `json:"http_status_text"`
	Violations     []string `json:"violations,omitempty"`
	TracingSecret  string   `json:"tracing_secret"`
	LogID          string   `json:"log_id"`
	/** Request Data */
	Method         string `json:"method"`
	Route          string `json:"route"`
	ClientIP       string `json:"client_ip"`
	LoadBalancerIP string `json:"load_balancer_ip"`
	ApiGatewayIP   string `json:"api_gateway_ip"`
	RequestID      string `json:"opc_request_id"`
	AcceptEncoding string `json:"accept_encoding"`
	ContentType    string `json:"content_type"`
	ContentLength  int64  `json:"content_length"`
	AcceptLanguage string `json:"accept_language"`
	Origin         string `json:"origin"`
	Platform       string `json:"platform"`
	/** Locale Data */
	LocaleLanguageTag            string `json:"locale_language_tag"`
	LocaleRegionCode             string `json:"locale_region_code"`
	LocaleCurrencyCode           string `json:"locale_currency_code"`
	LocaleCurrencySymbol         string `json:"locale_currency_symbol"`
	LocaleDecimalSeparator       string `json:"locale_decimal_separator"`
	LocaleDigitGroupingSeparator string `json:"locale_digit_grouping_separator"`
	LocaleTemperatureUnit        string `json:"locale_temperature_unit"`
	LocaleTextDirection          string `json:"locale_text_direction"`
	/** Calendar Data */
	CalendarType         string `json:"calendar_type"`
	CalendarFirstWeekday string `json:"calendar_first_weekday"`
	CalendarTimezone     string `json:"calendar_timezone"`
	CalendarUses24Hour   bool   `json:"calendar_uses_24_hour"`
	/** Device Data */
	DeviceType                      string   `json:"device_type"`
	DeviceManufacturer              string   `json:"manufacturer"`
	DeviceBrand                     string   `json:"brand"`
	DeviceModelName                 string   `json:"model_name"`
	DeviceName                      string   `json:"device_name"`
	DeviceIsPhysical                bool     `json:"is_physical_device"`
	DeviceCPUArchitectures          []string `json:"cpu_architectures"`
	DeviceIOSModelID                string   `json:"ios_model_id"`
	DeviceTotalMemory               uint64   `json:"total_memory"`
	DeviceYearClass                 *int     `json:"year_class"`
	DeviceOSName                    string   `json:"os_name"`
	DeviceOSVersion                 string   `json:"os_version"`
	DeviceOSBuildID                 string   `json:"os_build_id"`
	DeviceAndroidDesignName         string   `json:"android_design_name"`
	DeviceAndroidOSBuildFingerprint string   `json:"android_os_build_fingerprint"`
	DeviceAndroidPlatformAPILevel   *int     `json:"android_platform_api_level"`
	DeviceAndroidProductName        string   `json:"android_product_name"`
	DeviceLastRestartAt             UnixMs   `json:"last_restart_at,omitempty"`
	/** JWT Data */
	JWTIssuer         string `json:"issuer"`
	JWTAudience       string `json:"audience"`
	JWTAuthTime       UnixMs `json:"auth_time"`
	JWTFirebaseUID    string `json:"firebase_uid"`
	JWTSubject        string `json:"subject"`
	JWTIssuedAt       UnixMs `json:"issued_at"`
	JWTExpiresAt      UnixMs `json:"expires_at"`
	JWTName           string `json:"name"`
	JWTPicture        string `json:"picture"`
	JWTEmail          string `json:"email"`
	JWTEmailVerified  bool   `json:"email_verified"`
	JWTSignInProvider string `json:"sign_in_provider"`
	/** User Agent Data */
	UARaw          string `json:"ua_raw"`
	UADeviceFamily string `json:"ua_device_family"`
	UADeviceBrand  string `json:"ua_device_brand"`
	UADeviceModel  string `json:"ua_device_model"`
	UAOS           string `json:"ua_os"`
	UAOSVersion    string `json:"ua_os_version"`
	UA             string `json:"ua"`
	UAVersion      string `json:"ua_version"`
	/** Location Data */
	City                string  `json:"city"`
	Country             string  `json:"country"`
	CountryISO          string  `json:"country_iso"`
	AccuracyRadius      uint16  `json:"accuracy_radius"`
	Latitude            float64 `json:"latitude"`
	Longitude           float64 `json:"longitude"`
	MetroCode           uint    `json:"metro_code"`
	TimeZone            string  `json:"time_zone"`
	PostalCode          string  `json:"postal_code"`
	IsAnonymousProxy    bool    `json:"is_anonymous_proxy"`
	IsAnycast           bool    `json:"is_anycast"`
	IsSatelliteProvider bool    `json:"is_satellite_provider"`
	ASN                 int     `json:"asn"`
	ASNOrg              string  `json:"asn_org"`
	/** Request Body */
	ReqBody  map[string]any `json:"req_body"`
	FileMeta map[string]any `json:"file_meta,omitempty"`
	File     []byte         `json:"file,omitempty"`
	/** Response Body */
	ResBody map[string]any `json:"res_body"`
	/** Resolved Data */
	AccountID      string `json:"account_id,omitempty"`
	OrganizationID string `json:"organization_id,omitempty"`
	AuthID         string `json:"auth_id,omitempty"`
	DeviceID       string `json:"device_id,omitempty"`
	Hostname       string `json:"hostname,omitempty"`
}
