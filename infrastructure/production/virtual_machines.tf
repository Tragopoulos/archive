resource "oci_core_instance" "area_53" {
  compartment_id      = oci_identity_compartment.env_compartment.id
  display_name        = "AREA53"
  availability_domain = data.oci_identity_availability_domain.area_domain_3.name
  fault_domain        = "FAULT-DOMAIN-3"
  shape               = "VM.Standard.A1.Flex"
  shape_config {
    memory_in_gbs = 6
    ocpus         = 1
  }

  source_details {
    source_id               = "ocid1.image.oc1.eu-frankfurt-1.aaaaaaaarkrwgeh6qcofv65pyuskypkikx6snuitdixarz2zowcp6dniftrq"
    source_type             = "image"
    boot_volume_size_in_gbs = 100
    boot_volume_vpus_per_gb = 120
  }
  create_vnic_details {
    subnet_id        = oci_core_subnet.private_subnet.id
    display_name     = "AREA53"
    assign_public_ip = false
    private_ip       = "10.1.128.53"
    nsg_ids          = [oci_core_network_security_group.vm_nsg.id]
  }

  preserve_boot_volume = true

  lifecycle {
    ignore_changes = [source_details]
  }

  metadata = {
    ssh_authorized_keys = var.oci_pub_ssh_key
  }
}

resource "oci_core_instance" "area_54" {
  compartment_id      = oci_identity_compartment.env_compartment.id
  display_name        = "AREA54"
  availability_domain = data.oci_identity_availability_domain.area_domain_1.name
  fault_domain        = "FAULT-DOMAIN-1"
  shape               = "VM.Standard.A1.Flex"
  shape_config {
    memory_in_gbs = 6
    ocpus         = 1
  }

  source_details {
    source_id               = "ocid1.image.oc1.eu-frankfurt-1.aaaaaaaarkrwgeh6qcofv65pyuskypkikx6snuitdixarz2zowcp6dniftrq"
    source_type             = "image"
    boot_volume_size_in_gbs = 100
    boot_volume_vpus_per_gb = 120
  }
  create_vnic_details {
    subnet_id        = oci_core_subnet.private_subnet.id
    display_name     = "AREA54"
    assign_public_ip = false
    private_ip       = "10.1.128.54"
    nsg_ids          = [oci_core_network_security_group.vm_nsg.id]
  }

  preserve_boot_volume = true

  lifecycle {
    ignore_changes = [source_details]
  }

  metadata = {
    ssh_authorized_keys = var.oci_pub_ssh_key
  }
}

