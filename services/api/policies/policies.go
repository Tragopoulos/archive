package policies

import (
	"api/db"
	"api/request"
	"fmt"
)

func ApplyPolicies(d *request.Data, config *db.Config) {
	d.Violations = nil

	add := func(code string) {
		d.Violations = append(d.Violations, code)
	}

	networkPolicies(d, config, add)
	devicePolicies(d, config, add)
	authNPolicies(d, config, add)
	appPolicies(d, config, add)
}

func BlockViolations(d *request.Data, config *db.Config) {
	/** Convert blocked violations to map for fast lookup */
	blockedMap := make(map[string]bool)
	for _, v := range config.BlockedViolations {
		blockedMap[v] = true
	}

	/** Check each violation and handle the first blocking one */
	for _, violation := range d.Violations {
		if !blockedMap[violation] {
			continue
		}

		switch violation {
		case InvalidMethod:
			d.Severity = request.ERROR
			d.HTTPStatus = 405
			d.HTTPStatusText = "Method Not Allowed"
			return

		case MissingMethod:
			d.Severity = request.ERROR
			d.Message = "Missing HTTP method in request"
			d.HTTPStatus = 400
			d.HTTPStatusText = "Bad Request"
			return

		case InvalidRoute:
			d.Severity = request.ERROR
			d.Message = "Invalid route attempted"
			d.HTTPStatus = 404
			d.HTTPStatusText = "Not Found"
			return

		case MissingRoute:
			d.Severity = request.ERROR
			d.Message = "Missing route in request"
			d.HTTPStatus = 400
			d.HTTPStatusText = "Bad Request"
			return

		case CountryNotAllowed:
			d.Severity = request.CRITICAL
			d.Message = "Geographic restriction violation"
			d.HTTPStatus = 403
			d.HTTPStatusText = "Forbidden"
			return

		case ASNBlocked:
			d.Severity = request.CRITICAL
			d.Message = "Network provider blocked"
			d.HTTPStatus = 403
			d.HTTPStatusText = "Forbidden"
			return

		case AnonymousProxy:
			d.Severity = request.CRITICAL
			d.Message = "Anonymous proxy detected"
			d.HTTPStatus = 403
			d.HTTPStatusText = "Forbidden"
			return

		case InvalidClientIP:
			d.Severity = request.CRITICAL
			d.Message = "Invalid client IP address"
			d.HTTPStatus = 400
			d.HTTPStatusText = "Bad Request"
			return

		case InfrastructureBypass:
			d.Severity = request.ALERT
			d.Message = "Infrastructure bypass attempt detected"
			d.HTTPStatus = 403
			d.HTTPStatusText = "Forbidden"
			return

		case HeaderSpoofing:
			d.Severity = request.ALERT
			d.Message = "Header spoofing detected"
			d.HTTPStatus = 403
			d.HTTPStatusText = "Forbidden"
			return

		case TokenExpired:
			d.Severity = request.WARNING
			d.Message = "Authentication token expired"
			d.HTTPStatus = 401
			d.HTTPStatusText = "Unauthorized"
			return

		case NginxToken:
			d.Severity = request.CRITICAL
			d.Message = "Invalid or missing NGINX token"
			d.HTTPStatus = 401
			d.HTTPStatusText = "Unauthorized"
			return

		case NonBrowserClient:
			d.Severity = request.ERROR
			d.Message = "Non-browser client detected"
			d.HTTPStatus = 403
			d.HTTPStatusText = "Forbidden"
			return

		case VirtualDevice:
			d.Severity = request.ERROR
			d.Message = "Virtual device detected"
			d.HTTPStatus = 403
			d.HTTPStatusText = "Forbidden"
			return

		case InvalidEmailFormat:
			d.Severity = request.ERROR
			d.Message = "Invalid email format in token"
			d.HTTPStatus = 400
			d.HTTPStatusText = "Bad Request"
			return

		case EmailMissing:
			d.Severity = request.ERROR
			d.Message = "Email missing from authentication token"
			d.HTTPStatus = 400
			d.HTTPStatusText = "Bad Request"
			return

		case InvalidSignInProvider:
			d.Severity = request.ERROR
			d.Message = "Invalid sign-in provider"
			d.HTTPStatus = 400
			d.HTTPStatusText = "Bad Request"
			return

		default:
			d.Severity = request.CRITICAL
			d.Message = fmt.Sprintf("Policy violation: %s", violation)
			d.HTTPStatus = 403
			d.HTTPStatusText = "Forbidden"
			return
		}
	}

	/** Non-blocking violations - log but allow */
	d.Severity = request.WARNING
	d.Message = fmt.Sprintf("Non-blocking violations detected: %v", d.Violations)
	d.HTTPStatus = 200
	d.HTTPStatusText = "OK"
}
