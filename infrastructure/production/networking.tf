# Virtual Network
resource "oci_core_vcn" "env_vcn" {
  # 10.1.0.1 - 10.1.255.254 = 65534 Usable Hosts
  compartment_id = oci_identity_compartment.env_compartment.id
  cidr_blocks    = ["10.1.0.0/16"]
  display_name   = "PROD_VCN"
}

resource "oci_core_subnet" "private_subnet" {
  # 10.1.128.1 - 10.1.255.254 = 32766 Usable Hosts
  display_name               = "PROD_SUBNET_PRIVATE"
  cidr_block                 = "10.1.128.0/17"
  compartment_id             = oci_identity_compartment.env_compartment.id
  vcn_id                     = oci_core_vcn.env_vcn.id
  prohibit_internet_ingress  = true
  prohibit_public_ip_on_vnic = true
  security_list_ids          = [oci_core_security_list.private_security_list.id]
  route_table_id             = oci_core_route_table.private_route_table.id
}

# Peering Gateway
resource "oci_core_local_peering_gateway" "prod_local_peering_gateway" {
  compartment_id = oci_identity_compartment.env_compartment.id
  vcn_id         = oci_core_vcn.env_vcn.id
  display_name   = "PROD_PEERING_GATEWAY"
}

# Nat Gateway
resource "oci_core_nat_gateway" "nat_gateway" {
  compartment_id = oci_identity_compartment.env_compartment.id
  vcn_id         = oci_core_vcn.env_vcn.id
  display_name   = "PROD_NAT_GATEWAY"
}

resource "oci_core_route_table" "private_route_table" {
  compartment_id = oci_identity_compartment.env_compartment.id
  vcn_id         = oci_core_vcn.env_vcn.id
  display_name   = "PROD_ROUTE_TABLE_PRIVATE"

  # NAT route (for outbound internet)
  route_rules {
    network_entity_id = oci_core_nat_gateway.nat_gateway.id
    destination       = "0.0.0.0/0"
    destination_type  = "CIDR_BLOCK"
    description       = "Allows access to the internet"
  }

  # Peering route to Operations VCN
  route_rules {
    network_entity_id = oci_core_local_peering_gateway.prod_local_peering_gateway.id
    destination       = "10.0.0.0/16" # Operations VCN CIDR
    destination_type  = "CIDR_BLOCK"
    description       = "Allows routing to Operations Tenancy"
  }
}

# Private Security List
resource "oci_core_security_list" "private_security_list" {
  compartment_id = oci_identity_compartment.env_compartment.id
  vcn_id         = oci_core_vcn.env_vcn.id
  display_name   = "PROD_SECURITY_LIST_PRIVATE"
}

# VM NSG
resource "oci_core_network_security_group" "vm_nsg" {
  compartment_id = oci_identity_compartment.env_compartment.id
  vcn_id         = oci_core_vcn.env_vcn.id
  display_name   = "VM_NSG"
}

resource "oci_core_network_security_group_security_rule" "vm_ingress_ssh_from_area51" {
  network_security_group_id = oci_core_network_security_group.vm_nsg.id
  direction                 = "INGRESS"
  protocol                  = "6"
  description               = "Allow SSH ingress only from AREA51"
  source_type               = "CIDR_BLOCK"
  source                    = "10.0.0.51/32"
  stateless                 = false

  tcp_options {
    destination_port_range {
      min = 22
      max = 22
    }
  }
}

resource "oci_core_network_security_group_security_rule" "vm_egress_to_mysql_ops" {
  network_security_group_id = oci_core_network_security_group.vm_nsg.id
  direction                 = "EGRESS"
  protocol                  = "6"
  description               = "Allow MySQL Operations egress"
  destination_type          = "CIDR_BLOCK"
  destination               = "10.0.128.0/17"
  stateless                 = false

  tcp_options {
    destination_port_range {
      min = 3306
      max = 3306
    }
  }
}

resource "oci_core_network_security_group_security_rule" "vm_egress_to_mysql_x_ops" {
  network_security_group_id = oci_core_network_security_group.vm_nsg.id
  direction                 = "EGRESS"
  protocol                  = "6"
  description               = "Allow MySQL X Protocol Operations egress"
  destination_type          = "CIDR_BLOCK"
  destination               = "10.0.128.0/17"
  stateless                 = false

  tcp_options {
    destination_port_range {
      min = 33060
      max = 33060
    }
  }
}

resource "oci_core_network_security_group_security_rule" "vm_egress_https_to_internet" {
  network_security_group_id = oci_core_network_security_group.vm_nsg.id
  direction                 = "EGRESS"
  protocol                  = "6"
  description               = "Allow HTTPS egress to internet for Ksplice updates"
  destination_type          = "CIDR_BLOCK"
  destination               = "0.0.0.0/0"
  stateless                 = false

  tcp_options {
    destination_port_range {
      min = 443
      max = 443
    }
  }
}

resource "oci_core_network_security_group_security_rule" "vm_ingress_from_ops_nlb" {
  network_security_group_id = oci_core_network_security_group.vm_nsg.id
  direction                 = "INGRESS"
  protocol                  = "6"
  source_type               = "CIDR_BLOCK"
  source                    = "10.0.128.0/17"
  stateless                 = false
  description               = "Allow HTTP ingress from Ops NLB"
  tcp_options {
    destination_port_range {
      min = 8700
      max = 8700
    }
  }
}

resource "oci_core_network_security_group_security_rule" "vm_egress_to_ops_nlb" {
  network_security_group_id = oci_core_network_security_group.vm_nsg.id
  direction                 = "EGRESS"
  protocol                  = "6"
  destination_type          = "CIDR_BLOCK"
  destination               = "10.0.128.0/17"
  stateless                 = false
  description               = "Allow HTTP egress to Ops NLB - return traffic"
  tcp_options {
    destination_port_range {
      min = 8700
      max = 8700
    }
  }
}
