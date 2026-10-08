package policies

import (
	"api/db"
	"api/request"
	"net"
	"regexp"
	"slices"
	"strings"
)

func networkPolicies(data *request.Data, config *db.Config, add func(string)) {
	/** Client IP must be public */
	if !isValidPublicIP(data.ClientIP) {
		add(InvalidClientIP)
	}

	/** Load Balancer IP must be RFC1918 */
	if data.LoadBalancerIP == "" || !isRFC1918IP(data.LoadBalancerIP) {
		add(InfrastructureBypass)
	}

	/** API Gateway IP must be RFC1918 */
	if data.ApiGatewayIP == "" || !isRFC1918IP(data.ApiGatewayIP) {
		add(InfrastructureBypass)
	}

	/** IP relationship consistency */
	if (data.ClientIP != "" && data.ClientIP == data.LoadBalancerIP) ||
		(data.ClientIP != "" && data.ClientIP == data.ApiGatewayIP) ||
		(data.LoadBalancerIP != "" && data.LoadBalancerIP == data.ApiGatewayIP) {
		add(HeaderSpoofing)
	}

	/** API Gateway Request ID */
	if data.RequestID == "" || !requestIDPattern.MatchString(data.RequestID) {
		add(InvalidRequestID)
	}

	/** Geo lookup sanity */
	if data.CountryISO == "" {
		add(GeoLookupFailed)
		return
	}

	/** Country allowlist */
	allowed := slices.Contains(config.AllowedCountries, data.CountryISO)
	if !allowed {
		add(CountryNotAllowed)
	}

	/** ASN blocklist */
	if data.ASN != 0 {
		if slices.Contains(config.BlockedASN, data.ASN) {
			add(ASNBlocked)
		}
	}

	/** Anonymous Proxy */
	if data.IsAnonymousProxy {
		add(AnonymousProxy)
	}

	/** Satellite Provider */
	if data.IsSatelliteProvider {
		add(SatelliteProvider)
	}

	/** Content-Length vs body consistency */
	if data.ContentLength > 0 && data.ReqBody == nil {
		add(ContentLengthMismatch)
	}

	/** Body size */
	if data.ContentLength > (1 << 20) {
		add(BodySizeExceeded)
	}

	/** Method validation */
	if data.Method == "" {
		add(MissingMethod)
	} else {
		method := strings.ToUpper(data.Method)
		allowed := slices.Contains(config.AllowedMethods, method)
		if !allowed {
			add(InvalidMethod)
		}
	}

	/** Origin domain validation */
	if data.Origin != "" {
		if !strings.HasPrefix(data.Origin, "https://syncroinspect.com") {
			add(InvalidOrigin)
		}
	}
}

/** Precompiled pattern */
var requestIDPattern = regexp.MustCompile(`^/[A-Fa-f0-9]{32}$`)

func isValidPublicIP(ip string) bool {
	parsed := net.ParseIP(ip)
	if parsed == nil {
		return false
	}
	if parsed.IsLoopback() || parsed.IsPrivate() || parsed.IsUnspecified() || parsed.IsLinkLocalUnicast() || parsed.IsLinkLocalMulticast() {
		return false
	}
	return true
}

func isRFC1918IP(ip string) bool {
	host := ip
	if h, _, err := net.SplitHostPort(ip); err == nil {
		host = h
	}
	parsed := net.ParseIP(host)
	if parsed == nil {
		return false
	}
	return parsed.IsPrivate()
}
