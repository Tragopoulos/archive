package policies

import (
	"api/db"
	"api/request"
	"strings"
)

func appPolicies(data *request.Data, config *db.Config, add func(string)) {
	/** Route validation */
	if data.Route == "" {
		add(MissingRoute)
	} else {
		route := strings.ToUpper(data.Route)
		allowed := false
		for _, r := range config.AllowedRoutes {
			if strings.ToUpper(r) == route {
				allowed = true
				break
			}
		}
		if !allowed {
			add(InvalidRoute)
		}
	}
}
