resource "oci_apigateway_deployment" "test_deployment" {
  compartment_id = "ocid1.compartment.oc1..aaaaaaaa73iq4vq76amyi2uwd7fsd3p6iiwejte6dilgksir2x5jqqn3vy6a"
  gateway_id     = "ocid1.apigateway.oc1.eu-frankfurt-1.amaaaaaaqkfv6qia24gqzgdtwrvzwsvfs42oclofob7o6mevfllbxvsd3n5q"
  path_prefix    = "/t"
  display_name   = "TEST"

  specification {
    request_policies {
      rate_limiting {
        rate_key                    = "TOTAL"
        rate_in_requests_per_second = 5
      }

      cors {
        allowed_origins              = ["*"]
        allowed_methods              = ["GET", "POST", "PUT", "DELETE"]
        allowed_headers              = ["*"]
        exposed_headers              = ["*"]
        is_allow_credentials_enabled = false
        max_age_in_seconds           = 0
      }

      authentication {
        type                        = "TOKEN_AUTHENTICATION"
        token_header                = "Authorization"
        token_auth_scheme           = "Bearer"
        is_anonymous_access_allowed = true

        validation_policy {
          type                        = "REMOTE_JWKS"
          uri                         = "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"
          is_ssl_verify_disabled      = false
          max_cache_duration_in_hours = 1

          additional_validation_policy {
            issuers   = ["https://securetoken.google.com/syncroinspect"]
            audiences = ["syncroinspect"]
          }
        }
      }
    }

    routes {
      path    = "/account"
      methods = ["GET", "POST", "PUT", "DELETE"]

      backend {
        type = "HTTP_BACKEND"
        url  = "http://10.0.0.51:8700/account"
      }

      request_policies {
        header_transformations {
          set_headers {
            items {
              name      = "X-Api-Gateway-Secret"
              values    = [var.api_gw_secret]
              if_exists = "OVERWRITE"
            }
          }
        }
      }

      response_policies {
        header_transformations {
          set_headers {
            items {
              name      = "Content-Type"
              values    = ["application/json"]
              if_exists = "OVERWRITE"
            }
          }
        }
      }
    }
  }
}
