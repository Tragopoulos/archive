resource "oci_functions_application" "fn_application" {
  compartment_id             = oci_identity_compartment.env_compartment.id
  display_name               = "OPERATIONS"
  subnet_ids                 = [oci_core_subnet.private_subnet.id]
  network_security_group_ids = [oci_core_network_security_group.faas_nsg.id]
}
