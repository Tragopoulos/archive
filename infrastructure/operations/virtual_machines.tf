# Public Compute Instance
resource "oci_core_instance" "area_51" {
  compartment_id      = oci_identity_compartment.env_compartment.id
  display_name        = "AREA51"
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
    subnet_id        = oci_core_subnet.public_subnet.id
    display_name     = "AREA51_VNIC"
    assign_public_ip = false
    private_ip       = "10.0.0.51"
    nsg_ids          = [oci_core_network_security_group.jump_box_nsg.id]
  }

  preserve_boot_volume = true

  lifecycle {
    ignore_changes = [source_details]
  }

  metadata = {
    ssh_authorized_keys = var.oci_pub_ssh_key
  }
}

# Get the VNIC attachment details for the instance
data "oci_core_vnic_attachments" "area_51_vnics" {
  compartment_id = oci_identity_compartment.env_compartment.id
  instance_id    = oci_core_instance.area_51.id
  depends_on     = [oci_core_instance.area_51]
}

# Get the Private IP details associated with the VNIC
data "oci_core_private_ips" "area_51_private_ips" {
  vnic_id = data.oci_core_vnic_attachments.area_51_vnics.vnic_attachments[0].vnic_id
}

# Reserved Public IP Attachment
resource "oci_core_public_ip" "area_51_public_ip" {
  compartment_id = oci_identity_compartment.env_compartment.id
  lifetime       = "RESERVED"
  display_name   = "AREA51_PUBLIC_IP"
  private_ip_id  = data.oci_core_private_ips.area_51_private_ips.private_ips[0].id
}

# Private Compute Instance
resource "oci_core_instance" "area_52" {
  compartment_id      = oci_identity_compartment.env_compartment.id
  display_name        = "AREA52"
  availability_domain = data.oci_identity_availability_domain.area_domain_2.name
  fault_domain        = "FAULT-DOMAIN-2"
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
    display_name     = "AREA52"
    assign_public_ip = false
    private_ip       = "10.0.128.52"
    nsg_ids          = [oci_core_network_security_group.private_vm_nsg.id]
  }

  preserve_boot_volume = true

  lifecycle {
    ignore_changes = [source_details]
  }

  metadata = {
    ssh_authorized_keys = var.oci_pub_ssh_key
  }
}

