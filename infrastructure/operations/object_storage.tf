resource "oci_objectstorage_bucket" "terraform" {
  compartment_id        = oci_identity_compartment.env_compartment.id
  name                  = "terraform"
  namespace             = data.oci_objectstorage_namespace.os_namespace.namespace
  access_type           = "NoPublicAccess"
  auto_tiering          = "Disabled"
  object_events_enabled = false
  storage_tier          = "Standard"
  versioning            = "Disabled"
}

resource "oci_objectstorage_bucket" "logger" {
  compartment_id        = oci_identity_compartment.env_compartment.id
  name                  = "logger"
  namespace             = data.oci_objectstorage_namespace.os_namespace.namespace
  access_type           = "NoPublicAccess"
  auto_tiering          = "Disabled"
  object_events_enabled = false
  storage_tier          = "Standard"
  versioning            = "Disabled"
}

resource "oci_objectstorage_bucket" "mailer" {
  compartment_id        = oci_identity_compartment.env_compartment.id
  name                  = "mailer"
  namespace             = data.oci_objectstorage_namespace.os_namespace.namespace
  access_type           = "NoPublicAccess"
  auto_tiering          = "Disabled"
  object_events_enabled = false
  storage_tier          = "Standard"
  versioning            = "Disabled"
}
