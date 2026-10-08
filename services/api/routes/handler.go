package routes

import (
	"api/db"
	"api/policies"
	"api/request"
	"api/response"
	"net/http"

	"github.com/oschwald/geoip2-golang"
)

/** Handler is a route handler that receives pre-processed request data */
type Handler func(w http.ResponseWriter, r *http.Request, data *request.Data)

/** Protect wraps a Handler with policy enforcement and data extraction */
func Protect(config *db.Config, hostname string, geolite, geoASN *geoip2.Reader, h Handler) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		data := request.GetData(r, geolite, geoASN)
		data.Hostname = hostname

		/** Apply policies */
		policies.ApplyPolicies(&data, config)
		if len(data.Violations) > 0 {
			policies.BlockViolations(&data, config)
			if data.HTTPStatus != 200 {
				response.Send(w, &data, config)
				return
			}
		}

		h(w, r, &data)
	}
}
