resource "oci_logging_log_group" "log_group" {
  compartment_id = oci_identity_compartment.env_compartment.id
  display_name   = "OPS_LOG_GROUP"
  description    = "Operations Loggers"
}

resource "oci_logging_log" "fn_application_log" {
  display_name       = "OPS_FAAS_LOGS"
  log_group_id       = oci_logging_log_group.log_group.id
  log_type           = "SERVICE"
  retention_duration = 30

  configuration {
    source {
      category    = "invoke"
      resource    = oci_functions_application.fn_application.id
      service     = "functions"
      source_type = "OCISERVICE"
    }
    compartment_id = oci_identity_compartment.env_compartment.id
  }
  is_enabled = "true"
}
