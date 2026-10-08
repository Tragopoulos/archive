resource "oci_identity_policy" "administrator_policies" {
  compartment_id = var.tenancy_ocid
  name           = "ADMINISTRATOR_POLICIES"
  description    = "Includes all policies for Administrators in the tenancy"
  statements = [
    # Peering
    "Allow group Administrators to manage local-peering-gateways in tenancy",
    "Allow group Administrators to manage vcns in tenancy",
  ]
}

resource "oci_identity_policy" "acceptor_peering_policy" {
  compartment_id = var.tenancy_ocid
  name           = "PEERING_POLICIES"
  description    = "Allows Production tenancy to receive local VCN peering from Operations tenancy"

  statements = [
    "Define tenancy Requestor as ocid1.tenancy.oc1..aaaaaaaach72xgoy4wvmtqocilatpjnanfor4uewmikekc3byc2cas6smsla",
    "Define group Administrators as ocid1.group.oc1..aaaaaaaanrfo75362dey7crif6vqo4uxhrtlu7y7gq6glyaktjsnoe2qnqeq",
    "Define compartment PRODUCTION as ${oci_identity_compartment.env_compartment.id}",
    "Admit group Administrators of tenancy Requestor to manage local-peering-to in compartment PRODUCTION",
    "Admit group Administrators of tenancy Requestor to associate local-peering-gateways in tenancy Requestor with local-peering-gateways in compartment PRODUCTION",
  ]
}
