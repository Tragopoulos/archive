# # OCI NoSQL Tables

# resource "oci_nosql_table" "table_accounts" {
#   compartment_id      = oci_identity_compartment.env_compartment.id
#   name                = "accounts"
#   is_auto_reclaimable = false

#   ddl_statement = "CREATE TABLE IF NOT EXISTS accounts (account_id STRING, created_at TIMESTAMP(0), updated_at TIMESTAMP(0), profile JSON, auth_methods JSON, PRIMARY KEY (account_id))"

#   table_limits {
#     max_read_units     = 1
#     max_storage_in_gbs = 1
#     max_write_units    = 1
#     capacity_mode      = "PROVISIONED"
#   }
# }

# resource "oci_nosql_table" "table_organizations" {
#   compartment_id      = oci_identity_compartment.env_compartment.id
#   name                = "organizations"
#   is_auto_reclaimable = false

#   ddl_statement = "CREATE TABLE IF NOT EXISTS organizations (organization_id STRING, created_at TIMESTAMP(0), updated_at TIMESTAMP(0), profile JSON, members JSON, PRIMARY KEY (organization_id))"

#   table_limits {
#     max_read_units     = 1
#     max_storage_in_gbs = 1
#     max_write_units    = 1
#     capacity_mode      = "PROVISIONED"
#   }
# }

# resource "oci_nosql_table" "table_devices" {
#   compartment_id      = oci_identity_compartment.env_compartment.id
#   name                = "devices"
#   is_auto_reclaimable = false

#   ddl_statement = "CREATE TABLE IF NOT EXISTS devices (device_id STRING, created_at TIMESTAMP(0), updated_at TIMESTAMP(0), signature JSON, settings JSON, PRIMARY KEY (device_id))"

#   table_limits {
#     max_read_units     = 1
#     max_storage_in_gbs = 1
#     max_write_units    = 1
#     capacity_mode      = "PROVISIONED"
#   }
# }

# resource "oci_nosql_table" "table_mfa_challenges" {
#   compartment_id      = oci_identity_compartment.env_compartment.id
#   name                = "mfa_challenges"
#   is_auto_reclaimable = false

#   ddl_statement = "CREATE TABLE IF NOT EXISTS mfa_challenges (challenge_id STRING, created_at TIMESTAMP(0), expires_at TIMESTAMP(0), challenge JSON, PRIMARY KEY (challenge_id)) USING TTL 1 HOURS"

#   table_limits {
#     max_read_units     = 1
#     max_storage_in_gbs = 1
#     max_write_units    = 1
#     capacity_mode      = "PROVISIONED"
#   }
# }

# # OCI NoSQL Indexes

# resource "oci_nosql_index" "idx_accounts_auth" {
#   table_name_or_id = oci_nosql_table.table_accounts.id
#   name             = "idx_accounts_auth"
#   compartment_id   = oci_identity_compartment.env_compartment.id

#   keys {
#     column_name     = "auth_methods"
#     json_path       = "auth_methods[].provider"
#     json_field_type = "STRING"
#   }

#   keys {
#     column_name     = "auth_methods"
#     json_path       = "auth_methods[].firebase_uid"
#     json_field_type = "STRING"
#   }
# }

# resource "oci_nosql_index" "idx_org_members" {
#   table_name_or_id = oci_nosql_table.table_organizations.id
#   name             = "idx_org_members"
#   compartment_id   = oci_identity_compartment.env_compartment.id

#   keys {
#     column_name     = "members"
#     json_path       = "members[].account_id"
#     json_field_type = "STRING"
#   }
# }

# resource "oci_nosql_index" "idx_devices_account" {
#   table_name_or_id = oci_nosql_table.table_devices.id
#   name             = "idx_devices_account"
#   compartment_id   = oci_identity_compartment.env_compartment.id

#   keys {
#     column_name     = "signature"
#     json_path       = "signature.account_id"
#     json_field_type = "STRING"
#   }
# }

# resource "oci_nosql_index" "idx_mfa_uid" {
#   table_name_or_id = oci_nosql_table.table_mfa_challenges.id
#   name             = "idx_mfa_uid"
#   compartment_id   = oci_identity_compartment.env_compartment.id

#   keys {
#     column_name     = "challenge"
#     json_path       = "challenge.firebase_uid"
#     json_field_type = "STRING"
#   }
# }
