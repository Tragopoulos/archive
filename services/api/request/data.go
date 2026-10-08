package request

import (
	"net/http"
	"strconv"

	"github.com/google/uuid"
	"github.com/itlightning/dateparse"
	"github.com/oschwald/geoip2-golang"
)

func GetData(r *http.Request, cityDB *geoip2.Reader, asnDB *geoip2.Reader) Data {
	data := Data{}
	data.LogID = uuid.New().String()
	extractHeaders(r, &data, cityDB, asnDB)
	extractBody(r, &data)
	return data
}

/** ConvertAnyToUnixMs converts any incoming timestamp value to UnixMs (milliseconds UTC).
 *  Handles:
 *    - Numeric types (int, int32, int64, float32, float64): seconds if < 1e11, else milliseconds
 *    - String types: ISO 8601, RFC3339, JS date strings, and raw Unix timestamp strings
 *  Returns 0 for zero, negative, unparseable, or unsupported input.
 */
func ConvertAnyToUnixMs(v any) UnixMs {
	var n int64

	switch val := v.(type) {
	case int:
		n = int64(val)
	case int32:
		n = int64(val)
	case int64:
		n = val
	case float32:
		n = int64(val)
	case float64:
		n = int64(val)
	case string:
		if t, err := dateparse.ParseAny(val); err == nil {
			return UnixMs(t.UTC().UnixMilli())
		}
		parsed, err := strconv.ParseInt(val, 10, 64)
		if err != nil {
			return 0
		}
		n = parsed
	default:
		return 0
	}

	if n <= 0 {
		return 0
	}
	if n < 100_000_000_000 {
		return UnixMs(n * 1000)
	}
	return UnixMs(n)
}
