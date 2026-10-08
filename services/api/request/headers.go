package request

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net"
	"net/http"
	"strconv"
	"strings"

	"github.com/oschwald/geoip2-golang"
	"github.com/ua-parser/uap-go/uaparser"
)

func extractHeaders(r *http.Request, data *Data, cityDB *geoip2.Reader, asnDB *geoip2.Reader) {
	/** App Data */
	/** Tracing Secret */
	data.TracingSecret = r.Header.Get("X-Api-Gateway-Secret")

	/** Request Data */
	/** Method */
	data.Method = strings.ToUpper(r.Method)
	/** Route */
	data.Route = r.Header.Get("Route")
	/** Client IP */
	xff := r.Header.Get("X-Forwarded-For")
	data.ClientIP = ""
	if xff != "" {
		data.ClientIP = strings.TrimSpace(strings.Split(xff, ",")[0])
	}
	/** Load Balancer IP */
	data.LoadBalancerIP = r.Host
	/** API Gateway IP */
	data.ApiGatewayIP = r.Header.Get("X-Real-Ip")
	/** Request ID */
	data.RequestID = r.Header.Get("Opc-Request-Id")
	/** Accept Encoding */
	data.AcceptEncoding = r.Header.Get("Accept-Encoding")
	/** Content Type */
	data.ContentType = r.Header.Get("Content-Type")
	/** Content Length */
	if cl := r.Header.Get("Content-Length"); cl != "" {
		if v, err := strconv.ParseInt(cl, 10, 64); err == nil {
			data.ContentLength = v
		} else {
			data.ContentLength = 0
			fmt.Printf("Warning: invalid Content-Length: %v\n", err)
		}
	}
	/** Accept Language */
	data.AcceptLanguage = r.Header.Get("Accept-Language")
	/** Origin */
	data.Origin = r.Header.Get("Origin")
	/** Platform */
	data.Platform = r.Header.Get("x-client-platform")

	/** Device Data */
	signature := r.Header.Get("X-Device-Signature")
	if signature != "" {
		if raw, err := base64.StdEncoding.DecodeString(signature); err == nil {
			var deviceSig map[string]any
			if err := json.Unmarshal(raw, &deviceSig); err == nil {
				if locale, ok := deviceSig["locale"].(map[string]any); ok {
					if v, ok := locale["languageTag"].(string); ok {
						data.LocaleLanguageTag = v
					}
					if v, ok := locale["regionCode"].(string); ok {
						data.LocaleRegionCode = v
					}
					if v, ok := locale["currencyCode"].(string); ok {
						data.LocaleCurrencyCode = v
					}
					if v, ok := locale["currencySymbol"].(string); ok {
						data.LocaleCurrencySymbol = v
					}
					if v, ok := locale["decimalSeparator"].(string); ok {
						data.LocaleDecimalSeparator = v
					}
					if v, ok := locale["digitGroupingSeparator"].(string); ok {
						data.LocaleDigitGroupingSeparator = v
					}
					if v, ok := locale["temperatureUnit"].(string); ok {
						data.LocaleTemperatureUnit = v
					}
					if v, ok := locale["textDirection"].(string); ok {
						data.LocaleTextDirection = v
					}
				}
				if calendar, ok := deviceSig["calendar"].(map[string]any); ok {
					if v, ok := calendar["calendarType"].(string); ok {
						data.CalendarType = v
					}
					if v, ok := calendar["firstWeekdayName"].(string); ok {
						data.CalendarFirstWeekday = v
					}
					if v, ok := calendar["timezone"].(string); ok {
						data.CalendarTimezone = v
					}
					if v, ok := calendar["uses24hourClock"].(bool); ok {
						data.CalendarUses24Hour = v
					}
				}
				if v, ok := deviceSig["device_type"].(string); ok {
					data.DeviceType = v
				}
				if v, ok := deviceSig["manufacturer"].(string); ok {
					data.DeviceManufacturer = v
				}
				if v, ok := deviceSig["brand"].(string); ok {
					data.DeviceBrand = v
				}
				if v, ok := deviceSig["model_name"].(string); ok {
					data.DeviceModelName = v
				}
				if v, ok := deviceSig["device_name"].(string); ok {
					data.DeviceName = v
				}
				if v, ok := deviceSig["is_physical_device"].(bool); ok {
					data.DeviceIsPhysical = v
				}
				if v, ok := deviceSig["cpu_architectures"].([]any); ok {
					cpuArch := make([]string, 0, len(v))
					for _, arch := range v {
						if a, ok := arch.(string); ok {
							cpuArch = append(cpuArch, a)
						}
					}
					data.DeviceCPUArchitectures = cpuArch
				}
				if v, ok := deviceSig["total_memory"].(float64); ok {
					data.DeviceTotalMemory = uint64(v)
				}
				if v, ok := deviceSig["year_class"].(float64); ok {
					v2 := int(v)
					data.DeviceYearClass = &v2
				}
				if v, ok := deviceSig["os_name"].(string); ok {
					data.DeviceOSName = v
				}
				if v, ok := deviceSig["os_version"].(string); ok {
					data.DeviceOSVersion = v
				}
				if v, ok := deviceSig["os_build_id"].(string); ok {
					data.DeviceOSBuildID = v
				}
				if v, ok := deviceSig["last_restart_at"].(float64); ok {
					data.DeviceLastRestartAt = ConvertAnyToUnixMs(v)
				}
				if v, ok := deviceSig["ios_model_id"].(string); ok {
					data.DeviceIOSModelID = v
				}
				if v, ok := deviceSig["android_design_name"].(string); ok {
					data.DeviceAndroidDesignName = v
				}
				if v, ok := deviceSig["android_os_build_fingerprint"].(string); ok {
					data.DeviceAndroidOSBuildFingerprint = v
				}
				if v, ok := deviceSig["android_platform_api_level"].(float64); ok {
					v2 := int(v)
					data.DeviceAndroidPlatformAPILevel = &v2
				}
				if v, ok := deviceSig["android_product_name"].(string); ok {
					data.DeviceAndroidProductName = v
				}
			}
		}
	}

	/** JWT Data */
	token := r.Header.Get("Authorization")
	jwt, ok := decryptJWT(token)
	if ok {
		if v, ok := jwt["iss"].(string); ok {
			data.JWTIssuer = v
		}
		if v, ok := jwt["aud"].(string); ok {
			data.JWTAudience = v
		}
		if v, ok := jwt["auth_time"].(float64); ok {
			data.JWTAuthTime = ConvertAnyToUnixMs(v)
		}
		if v, ok := jwt["user_id"].(string); ok {
			data.JWTFirebaseUID = v
		}
		if v, ok := jwt["sub"].(string); ok {
			data.JWTSubject = v
		}
		if v, ok := jwt["iat"].(float64); ok {
			data.JWTIssuedAt = ConvertAnyToUnixMs(v)
		}
		if v, ok := jwt["exp"].(float64); ok {
			data.JWTExpiresAt = ConvertAnyToUnixMs(v)
		}
		if v, ok := jwt["name"].(string); ok {
			data.JWTName = v
		}
		if v, ok := jwt["picture"].(string); ok {
			data.JWTPicture = v
		}
		if v, ok := jwt["email"].(string); ok && v != "" {
			data.JWTEmail = v
		} else {
			data.JWTEmail = ""
		}
		if v, ok := jwt["email_verified"].(bool); ok {
			data.JWTEmailVerified = v
		}
		if firebase, ok := jwt["firebase"].(map[string]any); ok {
			if v, ok := firebase["sign_in_provider"].(string); ok {
				switch v {
				case "google.com":
					data.JWTSignInProvider = ProviderGoogle
				case "microsoft.com":
					data.JWTSignInProvider = ProviderMicrosoft
				case "apple.com":
					data.JWTSignInProvider = ProviderApple
				case "facebook.com":
					data.JWTSignInProvider = ProviderFacebook
				case "github.com":
					data.JWTSignInProvider = ProviderGithub
				case "twitter.com":
					data.JWTSignInProvider = ProviderX
				default:
					data.JWTSignInProvider = v
				}
			}
		}
	}

	/** User Agent Data */
	uaString := r.UserAgent()
	parser := uaparser.NewFromSaved()
	ua := parser.Parse(uaString)

	add := func(s string) string {
		if s == "" {
			return "0"
		}
		return s
	}

	data.UARaw = uaString
	data.UADeviceFamily = ua.Device.Family
	data.UADeviceBrand = ua.Device.Brand
	data.UADeviceModel = ua.Device.Model
	data.UAOS = ua.Os.Family
	data.UAOSVersion = add(ua.Os.Major) + "." + add(ua.Os.Minor) + "." + add(ua.Os.Patch) + "." + add(ua.Os.PatchMinor)
	data.UA = ua.UserAgent.Family
	data.UAVersion = add(ua.UserAgent.Major) + "." + add(ua.UserAgent.Minor) + "." + add(ua.UserAgent.Patch)

	/** Location Data */
	parsed := net.ParseIP(data.ClientIP)
	if parsed != nil {
		record, err := cityDB.City(parsed)
		if err == nil {
			asnRecord, err := asnDB.ASN(parsed)
			if err != nil {
				asnRecord = nil
			}

			if name, ok := record.City.Names["en"]; ok {
				data.City = name
			}
			if name, ok := record.Country.Names["en"]; ok {
				data.Country = name
			}
			data.CountryISO = record.Country.IsoCode
			data.AccuracyRadius = record.Location.AccuracyRadius
			data.Latitude = record.Location.Latitude
			data.Longitude = record.Location.Longitude
			data.MetroCode = record.Location.MetroCode
			data.TimeZone = record.Location.TimeZone
			data.PostalCode = record.Postal.Code
			data.IsAnonymousProxy = record.Traits.IsAnonymousProxy
			data.IsAnycast = record.Traits.IsAnycast
			data.IsSatelliteProvider = record.Traits.IsSatelliteProvider

			if asnRecord != nil {
				data.ASN = int(asnRecord.AutonomousSystemNumber)
				data.ASNOrg = asnRecord.AutonomousSystemOrganization
			}
		}
	}
}

/** decryptJWT decodes the payload section of a Firebase JWT (no signature verification — gateway handles that) */
func decryptJWT(token string) (map[string]any, bool) {
	if token == "" {
		return nil, false
	}

	parts := strings.SplitN(token, ".", 3)
	if len(parts) != 3 {
		return nil, false
	}

	payload := parts[1]
	if m := len(payload) % 4; m != 0 {
		payload += strings.Repeat("=", 4-m)
	}

	decoded, err := base64.URLEncoding.DecodeString(payload)
	if err != nil {
		return nil, false
	}

	var claims map[string]any
	if err := json.Unmarshal(decoded, &claims); err != nil {
		return nil, false
	}

	return claims, true
}

/** isValidPublicIP checks that an IP is a valid public (non-private, non-loopback) address */
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

/** isRFC1918IP checks that an IP is in the RFC1918 private address space */
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
