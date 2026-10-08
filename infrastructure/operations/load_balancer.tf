# Network Load Balancer
resource "oci_network_load_balancer_network_load_balancer" "nlb" {
  compartment_id             = oci_identity_compartment.env_compartment.id
  display_name               = "OPS_NLB"
  subnet_id                  = oci_core_subnet.private_subnet.id
  is_private                 = true
  network_security_group_ids = [oci_core_network_security_group.nlb_nsg.id]
}

# Listener
resource "oci_network_load_balancer_listener" "nlb_listener" {
  network_load_balancer_id = oci_network_load_balancer_network_load_balancer.nlb.id
  name                     = "OPS_NLB_LISTENER"
  default_backend_set_name = oci_network_load_balancer_network_load_balancers_backend_sets_unified.nlb_backend_set.name
  protocol                 = "TCP"
  port                     = 8700
}

# Backend Set
resource "oci_network_load_balancer_network_load_balancers_backend_sets_unified" "nlb_backend_set" {
  network_load_balancer_id = oci_network_load_balancer_network_load_balancer.nlb.id
  name                     = "OPS_NLB_BE_SET"
  policy                   = "FIVE_TUPLE"
  is_preserve_source       = false

  backends {
    port      = 8700
    target_id = oci_core_instance.area_52.id
    weight    = 1
  }

  # NOTE: ip_address backends below are Production tenancy instances (area_53, area_54).
  # Cross-tenancy — no remote state link. If their private_ip changes in Production's
  # virtual_machines.tf, update here manually.

  backends {
    port       = 8700
    ip_address = "10.1.128.53"
    weight     = 1
  }

  backends {
    port       = 8700
    ip_address = "10.1.128.54"
    weight     = 1
  }

  health_checker {
    protocol           = "TCP"
    port               = 8700
    interval_in_millis = 30000
    timeout_in_millis  = 5000
    retries            = 3
  }
}
