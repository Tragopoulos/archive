resource "oci_apigateway_gateway" "api_gw_public" {
  compartment_id             = oci_identity_compartment.env_compartment.id
  display_name               = "OPERATIONS"
  endpoint_type              = "PUBLIC"
  subnet_id                  = oci_core_subnet.public_subnet.id
  network_security_group_ids = [oci_core_network_security_group.api_gw_nsg.id]
}
