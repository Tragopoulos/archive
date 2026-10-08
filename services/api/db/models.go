package db

/** accounts table — PRIMARY KEY (account_id) */
type Account struct {
	AccountID   string       `json:"account_id"`
	CreatedAt   string       `json:"created_at"`
	UpdatedAt   string       `json:"updated_at"`
	Profile     Profile      `json:"profile"`
	AuthMethods []AuthMethod `json:"auth_methods"`
}

type Profile struct {
	Name     string `json:"name"`
	Picture  string `json:"picture"`
	IsActive bool   `json:"is_active"`
}

type AuthMethod struct {
	Provider    string `json:"provider"`
	FirebaseUID string `json:"firebase_uid"`
	Audience    string `json:"audience"`
	Issuer      string `json:"issuer"`
	Email       string `json:"email"`
	IsVerified  bool   `json:"is_verified"`
	CreatedAt   string `json:"created_at"`
	UpdatedAt   string `json:"updated_at"`
}

/** organizations table — PRIMARY KEY (organization_id) */
type Organization struct {
	OrganizationID string               `json:"organization_id"`
	CreatedAt      string               `json:"created_at"`
	UpdatedAt      string               `json:"updated_at"`
	Profile        OrganizationProfile  `json:"profile"`
	Members        []OrganizationMember `json:"members"`
}

type OrganizationProfile struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Logo        string `json:"logo"`
	IsActive    bool   `json:"is_active"`
}

type OrganizationMember struct {
	AccountID string `json:"account_id"`
	Role      string `json:"role"`
	IsActive  bool   `json:"is_active"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}

/** devices table — PRIMARY KEY (device_id) */
type Device struct {
	DeviceID  string          `json:"device_id"`
	CreatedAt string          `json:"created_at"`
	UpdatedAt string          `json:"updated_at"`
	Signature DeviceSignature `json:"signature"`
	Settings  DeviceSettings  `json:"settings"`
}

type DeviceSignature struct {
	AccountID        string   `json:"account_id"`
	DeviceType       string   `json:"device_type"`
	Manufacturer     string   `json:"manufacturer"`
	Brand            string   `json:"brand"`
	ModelName        string   `json:"model_name"`
	IsPhysicalDevice bool     `json:"is_physical_device"`
	CPUArchitectures []string `json:"cpu_architectures"`
	IOSModelID       string   `json:"ios_model_id,omitempty"`
	TotalMemory      uint64   `json:"total_memory"`
	DeviceYearClass  *int     `json:"device_year_class,omitempty"`
}

type DeviceSettings struct {
	OSName                    string `json:"os_name"`
	OSVersion                 string `json:"os_version"`
	DeviceName                string `json:"device_name"`
	OSBuildID                 string `json:"os_build_id"`
	AndroidDesignName         string `json:"android_design_name,omitempty"`
	AndroidOSBuildFingerprint string `json:"android_os_build_fingerprint,omitempty"`
	AndroidPlatformAPILevel   *int   `json:"android_platform_api_level,omitempty"`
	AndroidProductName        string `json:"android_product_name,omitempty"`
	LastRestartAt             string `json:"last_restart_at"`
	CalendarType              string `json:"calendar_type"`
	FirstWeekday              string `json:"first_weekday"`
	Uses24Hour                bool   `json:"uses_24_hour"`
	CurrencyCode              string `json:"currency_code"`
	CurrencySymbol            string `json:"currency_symbol"`
	DecimalSeparator          string `json:"decimal_separator"`
	DigitGroupingSeparator    string `json:"digit_grouping_separator"`
	TemperatureUnit           string `json:"temperature_unit"`
	TextDirection             string `json:"text_direction"`
	Timezone                  string `json:"timezone"`
	LanguageTag               string `json:"language_tag"`
	RegionCode                string `json:"region_code"`
	AcceptLanguage            string `json:"accept_language"`
}

/** mfa_challenges table — PRIMARY KEY (challenge_id), TTL 1 HOURS */
type MFAChallenge struct {
	ChallengeID string    `json:"challenge_id"`
	CreatedAt   string    `json:"created_at"`
	ExpiresAt   string    `json:"expires_at"`
	Challenge   Challenge `json:"challenge"`
}

type Challenge struct {
	FirebaseUID string `json:"firebase_uid"`
	Code        string `json:"code"`
	Attempts    int    `json:"attempts"`
	IsUsed      bool   `json:"is_used"`
}
