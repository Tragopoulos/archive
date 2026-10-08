package db

import "github.com/oschwald/geoip2-golang"

/** GeoLite opens the GeoLite2 City database */
func GeoLite(config *Config) (*geoip2.Reader, error) {
	return geoip2.Open(config.GeoLiteCityPath)
}

/** GeoLiteASN opens the GeoLite2 ASN database */
func GeoLiteASN(config *Config) (*geoip2.Reader, error) {
	return geoip2.Open(config.GeoLiteASNPath)
}
