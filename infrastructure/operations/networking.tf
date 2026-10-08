# Virtual Network
resource "oci_core_vcn" "env_vcn" {
  # 10.0.0.1 - 10.0.255.254 = 65534 Usable Hosts
  compartment_id = oci_identity_compartment.env_compartment.id
  cidr_blocks    = ["10.0.0.0/16"]
  display_name   = "OPS_VCN"
}

# Subnets
resource "oci_core_subnet" "public_subnet" {
  # 10.0.0.1 - 10.0.127.254 = 32766 Usable Hosts
  display_name               = "OPS_SUBNET_PUBLIC"
  cidr_block                 = "10.0.0.0/17"
  compartment_id             = oci_identity_compartment.env_compartment.id
  vcn_id                     = oci_core_vcn.env_vcn.id
  prohibit_internet_ingress  = false
  prohibit_public_ip_on_vnic = false
  security_list_ids          = [oci_core_security_list.public_security_list.id]
  route_table_id             = oci_core_route_table.public_route_table.id
}

resource "oci_core_subnet" "private_subnet" {
  # 10.0.128.1 - 10.0.255.254 = 32766 Usable Hosts
  display_name               = "OPS_SUBNET_PRIVATE"
  cidr_block                 = "10.0.128.0/17"
  compartment_id             = oci_identity_compartment.env_compartment.id
  vcn_id                     = oci_core_vcn.env_vcn.id
  prohibit_internet_ingress  = true
  prohibit_public_ip_on_vnic = true
  security_list_ids          = [oci_core_security_list.private_security_list.id]
  route_table_id             = oci_core_route_table.private_route_table.id
}

# Peering Gateway - Connects the two tenancies
resource "oci_core_local_peering_gateway" "ops_local_peering_gateway" {
  compartment_id = oci_identity_compartment.env_compartment.id
  vcn_id         = oci_core_vcn.env_vcn.id
  display_name   = "OPS_PEERING_GATEWAY"
  peer_id        = "ocid1.localpeeringgateway.oc1.eu-frankfurt-1.aaaaaaaazz3cwypsio44qs53xsgtdwqkwznoc6lgzjccadn23bzijvgei2xq"

  lifecycle {
    create_before_destroy = true
  }
}

output "ops_peering_gateway_id" {
  value       = oci_core_local_peering_gateway.ops_local_peering_gateway.id
  description = "The OCID of the Operations peering gateway for reference from Production"
}

# Internet Gateway
resource "oci_core_internet_gateway" "internet_gateway" {
  compartment_id = oci_identity_compartment.env_compartment.id
  vcn_id         = oci_core_vcn.env_vcn.id
  display_name   = "OPS_INTERNET_GATEWAY"
}

# Nat Gateway
resource "oci_core_nat_gateway" "nat_gateway" {
  compartment_id = oci_identity_compartment.env_compartment.id
  vcn_id         = oci_core_vcn.env_vcn.id
  display_name   = "OPS_NAT_GATEWAY"
}

# Route Tables - controls the routing of traffic to/from the subnet
resource "oci_core_route_table" "public_route_table" {
  compartment_id = oci_identity_compartment.env_compartment.id
  vcn_id         = oci_core_vcn.env_vcn.id
  display_name   = "OPS_ROUTE_TABLE_PUBLIC"

  # Internet route
  route_rules {
    network_entity_id = oci_core_internet_gateway.internet_gateway.id
    destination       = "0.0.0.0/0"
    destination_type  = "CIDR_BLOCK"
    description       = "Allows access to the internet"
  }

  # Peering route to Production VCN
  route_rules {
    network_entity_id = oci_core_local_peering_gateway.ops_local_peering_gateway.id
    destination       = "10.1.0.0/16" # Production VCN CIDR
    destination_type  = "CIDR_BLOCK"
    description       = "Allows routing to Production Tenancy"
  }
}

resource "oci_core_route_table" "private_route_table" {
  compartment_id = oci_identity_compartment.env_compartment.id
  vcn_id         = oci_core_vcn.env_vcn.id
  display_name   = "OPS_ROUTE_TABLE_PRIVATE"

  # NAT route (for outbound internet)
  route_rules {
    network_entity_id = oci_core_nat_gateway.nat_gateway.id
    destination       = "0.0.0.0/0"
    destination_type  = "CIDR_BLOCK"
    description       = "Allows access to the internet"
  }

  # Peering route to Production VCN
  route_rules {
    network_entity_id = oci_core_local_peering_gateway.ops_local_peering_gateway.id
    destination       = "10.1.0.0/16" # Production VCN CIDR
    destination_type  = "CIDR_BLOCK"
    description       = "Allows routing to Production Tenancy"
  }
}

# Security Lists - minimal (ingress handled by NSGs)
resource "oci_core_security_list" "public_security_list" {
  compartment_id = oci_identity_compartment.env_compartment.id
  vcn_id         = oci_core_vcn.env_vcn.id
  display_name   = "OPS_SECURITY_LIST_PUBLIC"
}

# Private Security List
resource "oci_core_security_list" "private_security_list" {
  compartment_id = oci_identity_compartment.env_compartment.id
  vcn_id         = oci_core_vcn.env_vcn.id
  display_name   = "OPS_SECURITY_LIST_PRIVATE"
}

# API GW NSG
resource "oci_core_network_security_group" "api_gw_nsg" {
  compartment_id = oci_identity_compartment.env_compartment.id
  vcn_id         = oci_core_vcn.env_vcn.id
  display_name   = "API_GW_NSG"
}

resource "oci_core_network_security_group_security_rule" "api_gw_ingress" {
  network_security_group_id = oci_core_network_security_group.api_gw_nsg.id
  direction                 = "INGRESS"
  protocol                  = "6"
  description               = "Allow HTTPS ingress from internet"
  source_type               = "CIDR_BLOCK"
  source                    = "0.0.0.0/0"
  stateless                 = false

  tcp_options {
    destination_port_range {
      min = 443
      max = 443
    }
  }
}

resource "oci_core_network_security_group_security_rule" "api_gw_http_egress_to_jump_box" {
  network_security_group_id = oci_core_network_security_group.api_gw_nsg.id
  direction                 = "EGRESS"
  protocol                  = "6"
  description               = "Allow HTTP egress to Jump Box"
  destination_type          = "NETWORK_SECURITY_GROUP"
  destination               = oci_core_network_security_group.jump_box_nsg.id
  stateless                 = false

  tcp_options {
    destination_port_range {
      min = 8700
      max = 8700
    }
  }
}

resource "oci_core_network_security_group_security_rule" "api_gw_egress_to_nlb" {
  network_security_group_id = oci_core_network_security_group.api_gw_nsg.id
  direction                 = "EGRESS"
  protocol                  = "6"
  destination_type          = "NETWORK_SECURITY_GROUP"
  destination               = oci_core_network_security_group.nlb_nsg.id
  stateless                 = false
  description               = "Allow HTTP egress to NLB"
  tcp_options {
    destination_port_range {
      min = 8700
      max = 8700
    }
  }
}

resource "oci_core_network_security_group_security_rule" "api_gw_egress_to_faas" {
  network_security_group_id = oci_core_network_security_group.api_gw_nsg.id
  direction                 = "EGRESS"
  protocol                  = "6"
  destination_type          = "NETWORK_SECURITY_GROUP"
  destination               = oci_core_network_security_group.faas_nsg.id
  stateless                 = false
  description               = "Allow HTTPS egress to FaaS"
  tcp_options {
    destination_port_range {
      min = 443
      max = 443
    }
  }
}

# MySQL NSG
resource "oci_core_network_security_group" "db_nsg" {
  compartment_id = oci_identity_compartment.env_compartment.id
  vcn_id         = oci_core_vcn.env_vcn.id
  display_name   = "DB_NSG"
}

resource "oci_core_network_security_group_security_rule" "ingress_jumpbox" {
  network_security_group_id = oci_core_network_security_group.db_nsg.id
  direction                 = "INGRESS"
  protocol                  = "6"
  source                    = oci_core_network_security_group.jump_box_nsg.id
  source_type               = "NETWORK_SECURITY_GROUP"

  tcp_options {
    destination_port_range {
      min = 3306
      max = 3306
    }
  }
}

resource "oci_core_network_security_group_security_rule" "ingress_private_vm_nsg" {
  network_security_group_id = oci_core_network_security_group.db_nsg.id
  direction                 = "INGRESS"
  protocol                  = "6"
  source                    = oci_core_network_security_group.private_vm_nsg.id
  source_type               = "NETWORK_SECURITY_GROUP"
  tcp_options {
    destination_port_range {
      min = 3306
      max = 3306
    }
  }
}

resource "oci_core_network_security_group_security_rule" "ingress_faas_nsg" {
  network_security_group_id = oci_core_network_security_group.db_nsg.id
  direction                 = "INGRESS"
  protocol                  = "6"
  source                    = oci_core_network_security_group.faas_nsg.id
  source_type               = "NETWORK_SECURITY_GROUP"
  tcp_options {
    destination_port_range {
      min = 3306
      max = 3306
    }
  }
}

resource "oci_core_network_security_group_security_rule" "ingress_area53" {
  network_security_group_id = oci_core_network_security_group.db_nsg.id
  direction                 = "INGRESS"
  protocol                  = "6"
  source_type               = "CIDR_BLOCK"
  source                    = "10.1.128.53/32"
  stateless                 = false

  tcp_options {
    destination_port_range {
      min = 3306
      max = 3306
    }
  }
}

resource "oci_core_network_security_group_security_rule" "ingress_area54" {
  network_security_group_id = oci_core_network_security_group.db_nsg.id
  direction                 = "INGRESS"
  protocol                  = "6"
  source_type               = "CIDR_BLOCK"
  source                    = "10.1.128.54/32"
  stateless                 = false

  tcp_options {
    destination_port_range {
      min = 3306
      max = 3306
    }
  }
}

resource "oci_core_network_security_group_security_rule" "ingress_jumpbox_x_protocol" {
  network_security_group_id = oci_core_network_security_group.db_nsg.id
  direction                 = "INGRESS"
  protocol                  = "6"
  source                    = oci_core_network_security_group.jump_box_nsg.id
  source_type               = "NETWORK_SECURITY_GROUP"

  tcp_options {
    destination_port_range {
      min = 33060
      max = 33060
    }
  }
}

resource "oci_core_network_security_group_security_rule" "ingress_private_vm_nsg_x_protocol" {
  network_security_group_id = oci_core_network_security_group.db_nsg.id
  direction                 = "INGRESS"
  protocol                  = "6"
  source                    = oci_core_network_security_group.private_vm_nsg.id
  source_type               = "NETWORK_SECURITY_GROUP"
  tcp_options {
    destination_port_range {
      min = 33060
      max = 33060
    }
  }
}

resource "oci_core_network_security_group_security_rule" "ingress_faas_nsg_x_protocol" {
  network_security_group_id = oci_core_network_security_group.db_nsg.id
  direction                 = "INGRESS"
  protocol                  = "6"
  source                    = oci_core_network_security_group.faas_nsg.id
  source_type               = "NETWORK_SECURITY_GROUP"
  tcp_options {
    destination_port_range {
      min = 33060
      max = 33060
    }
  }
}

resource "oci_core_network_security_group_security_rule" "ingress_area53_x_protocol" {
  network_security_group_id = oci_core_network_security_group.db_nsg.id
  direction                 = "INGRESS"
  protocol                  = "6"
  source_type               = "CIDR_BLOCK"
  source                    = "10.1.128.53/32"
  stateless                 = false

  tcp_options {
    destination_port_range {
      min = 33060
      max = 33060
    }
  }
}

resource "oci_core_network_security_group_security_rule" "ingress_area54_x_protocol" {
  network_security_group_id = oci_core_network_security_group.db_nsg.id
  direction                 = "INGRESS"
  protocol                  = "6"
  source_type               = "CIDR_BLOCK"
  source                    = "10.1.128.54/32"
  stateless                 = false

  tcp_options {
    destination_port_range {
      min = 33060
      max = 33060
    }
  }
}

# Jump Box NSG
resource "oci_core_network_security_group" "jump_box_nsg" {
  compartment_id = oci_identity_compartment.env_compartment.id
  vcn_id         = oci_core_vcn.env_vcn.id
  display_name   = "JUMP_BOX_NSG"
}

resource "oci_core_network_security_group_security_rule" "vm_https_ingress" {
  network_security_group_id = oci_core_network_security_group.jump_box_nsg.id
  direction                 = "INGRESS"
  protocol                  = "6"
  source_type               = "CIDR_BLOCK"
  source                    = "0.0.0.0/0"
  stateless                 = false
  description               = "Allow HTTPS from Internet"
  tcp_options {
    destination_port_range {
      min = 443
      max = 443
    }
  }
}

resource "oci_core_network_security_group_security_rule" "jump_box_http_ingress_from_api_gw" {
  network_security_group_id = oci_core_network_security_group.jump_box_nsg.id
  direction                 = "INGRESS"
  protocol                  = "6"
  source_type               = "NETWORK_SECURITY_GROUP"
  source                    = oci_core_network_security_group.api_gw_nsg.id
  stateless                 = false
  description               = "Allow HTTP from API Gateway"
  tcp_options {
    destination_port_range {
      min = 8700
      max = 8700
    }
  }
}

resource "oci_core_network_security_group_security_rule" "vm_all_egress" {
  network_security_group_id = oci_core_network_security_group.jump_box_nsg.id
  direction                 = "EGRESS"
  protocol                  = "all"
  destination_type          = "CIDR_BLOCK"
  destination               = "0.0.0.0/0"
  stateless                 = false
  description               = "Allow all outbound traffic"
}

resource "oci_core_network_security_group_security_rule" "jump_box_ssh_egress_to_ops" {
  network_security_group_id = oci_core_network_security_group.jump_box_nsg.id
  direction                 = "EGRESS"
  protocol                  = "6"
  destination_type          = "CIDR_BLOCK"
  destination               = "10.0.0.0/16"
  stateless                 = false
  description               = "Allow SSH egress to Operations VMs"
  tcp_options {
    destination_port_range {
      min = 22
      max = 22
    }
  }
}

resource "oci_core_network_security_group_security_rule" "jump_box_ssh_egress_to_prod" {
  network_security_group_id = oci_core_network_security_group.jump_box_nsg.id
  direction                 = "EGRESS"
  protocol                  = "6"
  destination_type          = "CIDR_BLOCK"
  destination               = "10.1.0.0/16"
  stateless                 = false
  description               = "Allow SSH egress to Production VMs"
  tcp_options {
    destination_port_range {
      min = 22
      max = 22
    }
  }
}

# Private VM NSG
resource "oci_core_network_security_group" "private_vm_nsg" {
  compartment_id = oci_identity_compartment.env_compartment.id
  vcn_id         = oci_core_vcn.env_vcn.id
  display_name   = "PRIVATE_VM_NSG"
}

resource "oci_core_network_security_group_security_rule" "private_vm_ssh_ingress_from_area51" {
  network_security_group_id = oci_core_network_security_group.private_vm_nsg.id
  direction                 = "INGRESS"
  protocol                  = "6"
  source_type               = "CIDR_BLOCK"
  source                    = "10.0.0.51/32"
  stateless                 = false
  description               = "Allow SSH ingress from AREA51"
  tcp_options {
    destination_port_range {
      min = 22
      max = 22
    }
  }
}

resource "oci_core_network_security_group_security_rule" "private_vm_http_ingress_from_ops_nlb" {
  network_security_group_id = oci_core_network_security_group.private_vm_nsg.id
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

resource "oci_core_network_security_group_security_rule" "private_vm_http_egress_to_ops_nlb" {
  network_security_group_id = oci_core_network_security_group.private_vm_nsg.id
  direction                 = "EGRESS"
  protocol                  = "6"
  destination_type          = "CIDR_BLOCK"
  destination               = "10.0.128.0/17"
  stateless                 = false
  description               = "Allow HTTP egress to Production NLB - return traffic"
  tcp_options {
    destination_port_range {
      min = 8700
      max = 8700
    }
  }
}

resource "oci_core_network_security_group_security_rule" "private_vm_egress_to_db" {
  network_security_group_id = oci_core_network_security_group.private_vm_nsg.id
  direction                 = "EGRESS"
  protocol                  = "6"
  destination_type          = "NETWORK_SECURITY_GROUP"
  destination               = oci_core_network_security_group.db_nsg.id
  stateless                 = false
  description               = "Allow MySQL egress to database"
  tcp_options {
    destination_port_range {
      min = 3306
      max = 3306
    }
  }
}

resource "oci_core_network_security_group_security_rule" "private_vm_egress_to_db_x_protocol" {
  network_security_group_id = oci_core_network_security_group.private_vm_nsg.id
  direction                 = "EGRESS"
  protocol                  = "6"
  destination_type          = "NETWORK_SECURITY_GROUP"
  destination               = oci_core_network_security_group.db_nsg.id
  stateless                 = false
  description               = "Allow MySQL X Protocol egress to database"
  tcp_options {
    destination_port_range {
      min = 33060
      max = 33060
    }
  }
}

resource "oci_core_network_security_group_security_rule" "private_vm_egress_https_to_internet" {
  network_security_group_id = oci_core_network_security_group.private_vm_nsg.id
  direction                 = "EGRESS"
  protocol                  = "6"
  destination_type          = "CIDR_BLOCK"
  destination               = "0.0.0.0/0"
  stateless                 = false
  description               = "Allow HTTPS egress to internet (for updates and external APIs)"
  tcp_options {
    destination_port_range {
      min = 443
      max = 443
    }
  }
}

resource "oci_core_network_security_group_security_rule" "private_vm_egress_http_to_internet" {
  network_security_group_id = oci_core_network_security_group.private_vm_nsg.id
  direction                 = "EGRESS"
  protocol                  = "6"
  destination_type          = "CIDR_BLOCK"
  destination               = "0.0.0.0/0"
  stateless                 = false
  description               = "Allow HTTP egress to internet (for updates)"
  tcp_options {
    destination_port_range {
      min = 80
      max = 80
    }
  }
}

# NLB NSG
resource "oci_core_network_security_group" "nlb_nsg" {
  compartment_id = oci_identity_compartment.env_compartment.id
  vcn_id         = oci_core_vcn.env_vcn.id
  display_name   = "NLB_NSG"
}

resource "oci_core_network_security_group_security_rule" "nlb_ingress_from_api_gw" {
  network_security_group_id = oci_core_network_security_group.nlb_nsg.id
  direction                 = "INGRESS"
  protocol                  = "6"
  source_type               = "NETWORK_SECURITY_GROUP"
  source                    = oci_core_network_security_group.api_gw_nsg.id
  stateless                 = false
  description               = "Allow ingress from API Gateway"

  tcp_options {
    destination_port_range {
      min = 8700
      max = 8700
    }
  }
}

resource "oci_core_network_security_group_security_rule" "nlb_ingress_from_ops_backend" {
  network_security_group_id = oci_core_network_security_group.nlb_nsg.id
  direction                 = "INGRESS"
  protocol                  = "6"
  source_type               = "CIDR_BLOCK"
  source                    = "10.0.128.0/17"
  stateless                 = false
  description               = "Allow TCP 8700 return ingress from Ops backend"
  tcp_options {
    destination_port_range {
      min = 8700
      max = 8700
    }
  }
}

resource "oci_core_network_security_group_security_rule" "nlb_ingress_from_prod_backend" {
  network_security_group_id = oci_core_network_security_group.nlb_nsg.id
  direction                 = "INGRESS"
  protocol                  = "6"
  source_type               = "CIDR_BLOCK"
  source                    = "10.1.128.0/17"
  stateless                 = false
  description               = "Allow TCP 8700 return ingress from Prod backends"
  tcp_options {
    destination_port_range {
      min = 8700
      max = 8700
    }
  }
}

resource "oci_core_network_security_group_security_rule" "nlb_egress_to_ops_backend" {
  network_security_group_id = oci_core_network_security_group.nlb_nsg.id
  direction                 = "EGRESS"
  protocol                  = "6"
  destination_type          = "CIDR_BLOCK"
  destination               = "10.0.128.0/17"
  stateless                 = false
  description               = "Allow TCP 8700 egress to Ops backend"
  tcp_options {
    destination_port_range {
      min = 8700
      max = 8700
    }
  }
}

resource "oci_core_network_security_group_security_rule" "nlb_egress_to_prod_backend" {
  network_security_group_id = oci_core_network_security_group.nlb_nsg.id
  direction                 = "EGRESS"
  protocol                  = "6"
  destination_type          = "CIDR_BLOCK"
  destination               = "10.1.128.0/17"
  stateless                 = false
  description               = "Allow TCP 8700 egress to Prod backends"
  tcp_options {
    destination_port_range {
      min = 8700
      max = 8700
    }
  }
}

# FaaS NSG
resource "oci_core_network_security_group" "faas_nsg" {
  compartment_id = oci_identity_compartment.env_compartment.id
  vcn_id         = oci_core_vcn.env_vcn.id
  display_name   = "FAAS_NSG"
}

resource "oci_core_network_security_group_security_rule" "faas_ingress_from_api_gw_https" {
  network_security_group_id = oci_core_network_security_group.faas_nsg.id
  direction                 = "INGRESS"
  protocol                  = "6"
  source_type               = "NETWORK_SECURITY_GROUP"
  source                    = oci_core_network_security_group.api_gw_nsg.id
  stateless                 = false
  description               = "Allow HTTPS ingress from API Gateway to FaaS"

  tcp_options {
    destination_port_range {
      min = 443
      max = 443
    }
  }
}

resource "oci_core_network_security_group_security_rule" "faas_egress_to_db" {
  network_security_group_id = oci_core_network_security_group.faas_nsg.id
  direction                 = "EGRESS"
  protocol                  = "6"
  description               = "Allow FaaS egress to MySQL database"
  destination_type          = "NETWORK_SECURITY_GROUP"
  destination               = oci_core_network_security_group.db_nsg.id
  stateless                 = false

  tcp_options {
    destination_port_range {
      min = 3306
      max = 3306
    }
  }
}

resource "oci_core_network_security_group_security_rule" "faas_egress_to_db_x_protocol" {
  network_security_group_id = oci_core_network_security_group.faas_nsg.id
  direction                 = "EGRESS"
  protocol                  = "6"
  description               = "Allow FaaS egress to MySQL X Protocol"
  destination_type          = "NETWORK_SECURITY_GROUP"
  destination               = oci_core_network_security_group.db_nsg.id
  stateless                 = false

  tcp_options {
    destination_port_range {
      min = 33060
      max = 33060
    }
  }
}

resource "oci_core_network_security_group_security_rule" "faas_egress_to_object_storage" {
  network_security_group_id = oci_core_network_security_group.faas_nsg.id
  direction                 = "EGRESS"
  protocol                  = "6"
  description               = "Allow FaaS egress to Object Storage via HTTPS"
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
