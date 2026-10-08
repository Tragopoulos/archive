# Provider Backend
terraform {
  required_providers {
    oci = {
      source = "oracle/oci"
    }
  }
  backend "s3" {
    bucket = "terraform"
    key    = "operations/terraform.tfstate"
    region = "eu-frankfurt-1"
    endpoints = {
      s3 = "https://fruku0jw785h.compat.objectstorage.eu-frankfurt-1.oraclecloud.com"
    }
    skip_region_validation      = true
    skip_credentials_validation = true
    skip_metadata_api_check     = true
    skip_requesting_account_id  = true
    skip_s3_checksum            = true
    use_path_style              = true
  }
}

provider "oci" {}
variable "region" { type = string }
variable "tenancy_ocid" { type = string }
variable "oci_pub_ssh_key" { type = string }
variable "db_username" { type = string }
variable "db_password" { type = string }

# Namespace
data "oci_objectstorage_namespace" "os_namespace" { compartment_id = var.tenancy_ocid }

# Domains
data "oci_identity_availability_domain" "area_domain_1" {
  compartment_id = var.tenancy_ocid
  ad_number      = 1
}
data "oci_identity_availability_domain" "area_domain_2" {
  compartment_id = var.tenancy_ocid
  ad_number      = 2
}
data "oci_identity_availability_domain" "area_domain_3" {
  compartment_id = var.tenancy_ocid
  ad_number      = 3
}

resource "oci_identity_compartment" "env_compartment" {
  compartment_id = var.tenancy_ocid
  name           = "OPERATIONS"
  description    = "Operations Environment"
}

# Compartment
resource "oci_identity_dynamic_group" "faas_dynamic_group" {
  name           = "OPS_FAAS_GROUP"
  description    = "FaaS Dynamic Group"
  compartment_id = var.tenancy_ocid
  matching_rule  = "ALL {resource.type = 'fnfunc', resource.compartment.id = '${oci_identity_compartment.env_compartment.id}'}"
}
