package policies

import (
	"api/db"
	"api/request"
	"regexp"
	"strings"
	"time"
)

func authNPolicies(data *request.Data, config *db.Config, add func(string)) {
	now := time.Now().UnixMilli()
	day := int64(24 * 60 * 60 * 1000)

	/** Token issuer & audience */
	if data.JWTIssuer != "https://securetoken.google.com/syncrosocialprod" ||
		data.JWTAudience != "syncrosocialprod" {
		add(IssuerAudience)
	}

	/** Nginx header */
	if data.TracingSecret != config.NginxToken {
		add(NginxToken)
	}

	/** AuthN time */
	if data.JWTAuthTime <= 0 {
		add(InvalidAuthTime)
	} else if int64(data.JWTAuthTime) > now {
		add(AuthTimeInFuture)
	} else if now-int64(data.JWTAuthTime) > day {
		add(AuthTimeTooOld)
	}

	/** issued_at validation */
	if data.JWTIssuedAt <= 0 {
		add(InvalidIssuedAt)
	}

	/** expires_at validation */
	if data.JWTExpiresAt <= 0 {
		add(InvalidExpiresAt)
	} else {
		if data.JWTExpiresAt <= data.JWTIssuedAt {
			add(InvalidTokenLifetime)
		}
		if int64(data.JWTExpiresAt) < now {
			add(TokenExpired)
		}
		if int64(data.JWTExpiresAt-data.JWTIssuedAt) > day {
			add(TokenLifetimeTooLong)
		}
	}

	/** Email presence */
	if strings.TrimSpace(data.JWTEmail) == "" {
		add(EmailMissing)
		return
	}

	/** Email format */
	email := strings.ToLower(strings.TrimSpace(data.JWTEmail))
	if !emailPattern.MatchString(email) {
		add(InvalidEmailFormat)
	}

	/** Sign In provider presence */
	if data.JWTSignInProvider == "" {
		add(MissingSignInProvider)
		return
	}

	/** Sign In provider validation */
	provider := strings.ToUpper(data.JWTSignInProvider)
	allowed := false
	for _, p := range config.AllowedProviders {
		if strings.ToUpper(p) == provider {
			allowed = true
			break
		}
	}
	if !allowed {
		add(InvalidSignInProvider)
	}
}

/** Precompiled pattern */
var emailPattern = regexp.MustCompile(`^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$`)
