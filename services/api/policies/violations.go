package policies

/** Network Policy Violations */
const (
	InvalidClientIP       = "INVALID_CLIENT_IP"
	InfrastructureBypass  = "INFRASTRUCTURE_BYPASS_ATTEMPT"
	HeaderSpoofing        = "HEADER_SPOOFING_DETECTED"
	InvalidRequestID      = "INVALID_REQUEST_ID"
	GeoLookupFailed       = "GEO_LOOKUP_FAILED"
	CountryNotAllowed     = "COUNTRY_NOT_ALLOWED"
	ASNBlocked            = "ASN_NOT_IN_ALLOWED_LIST"
	AnonymousProxy        = "ANONYMOUS_PROXY"
	SatelliteProvider     = "SATELLITE_PROVIDER"
	ContentLengthMismatch = "CONTENT_LENGTH_MISMATCH"
	BodySizeExceeded      = "BODY_SIZE_VIOLATION"
	MissingMethod         = "MISSING_METHOD"
	InvalidMethod         = "INVALID_METHOD"
	InvalidOrigin         = "INVALID_ORIGIN_DOMAIN"
)

/** Device Policy Violations */
const (
	MissingUserAgent       = "MISSING_USER_AGENT"
	NonBrowserClient       = "NON_BROWSER_CLIENT"
	UnknownDeviceType      = "UNKNOWN_DEVICE_TYPE"
	UnsupportedDeviceType  = "UNSUPPORTED_DEVICE_TYPE"
	MissingPlatform        = "MISSING_PLATFORM"
	UnsupportedPlatform    = "UNSUPPORTED_PLATFORM"
	MissingOSName          = "MISSING_OS_NAME"
	MissingOSVersion       = "MISSING_OS_VERSION"
	LowMemoryDevice        = "LOW_MEMORY_DEVICE"
	UnknownDeviceNature    = "UNKNOWN_DEVICE_NATURE"
	VirtualDevice          = "VIRTUAL_DEVICE_DETECTED"
	UnexpectedDeviceNature = "UNEXPECTED_DEVICE_NATURE"
)

/** Authentication Policy Violations */
const (
	IssuerAudience        = "ISSUER_AUDIENCE_VIOLATION"
	NginxToken            = "NGINX_TOKEN_VIOLATION"
	InvalidAuthTime       = "INVALID_AUTH_TIME"
	AuthTimeInFuture      = "AUTH_TIME_IN_FUTURE"
	AuthTimeTooOld        = "AUTH_TIME_TOO_OLD"
	InvalidIssuedAt       = "INVALID_ISSUED_AT"
	InvalidExpiresAt      = "INVALID_EXPIRES_AT"
	InvalidTokenLifetime  = "INVALID_TOKEN_LIFETIME"
	TokenExpired          = "TOKEN_EXPIRED"
	TokenLifetimeTooLong  = "TOKEN_LIFETIME_TOO_LONG"
	EmailMissing          = "EMAIL_MISSING"
	InvalidEmailFormat    = "INVALID_EMAIL_FORMAT"
	MissingSignInProvider = "MISSING_SIGN_IN_PROVIDER"
	InvalidSignInProvider = "INVALID_SIGN_IN_PROVIDER"
)

/** App Policy Violations */
const (
	MissingRoute = "MISSING_ROUTE"
	InvalidRoute = "INVALID_ROUTE"
)
