# Provider Backend
terraform {
  required_providers {
    oci = {
      source = "oracle/oci"
    }
  }
  backend "s3" {
    bucket = "terraform"
    key    = "api_gw_test/terraform.tfstate"
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
variable "user_ocid" { type = string }
variable "fingerprint" { type = string }
variable "private_key" { type = string }
variable "api_gw_secret" { type = string }
