resource "oci_mysql_mysql_db_system" "operations_db" {
  display_name            = "Operations"
  description             = "MySQL Operations Application Database"
  compartment_id          = oci_identity_compartment.env_compartment.id
  availability_domain     = data.oci_identity_availability_domain.area_domain_3.name
  subnet_id               = oci_core_subnet.private_subnet.id
  nsg_ids                 = [oci_core_network_security_group.db_nsg.id]
  ip_address              = "10.0.200.50"
  port                    = "3306"
  port_x                  = "33060"
  shape_name              = "MySQL.Free"
  admin_username          = var.db_username
  admin_password          = var.db_password
  access_mode             = "UNRESTRICTED"
  crash_recovery          = "ENABLED"
  data_storage_size_in_gb = "50"
  database_management     = "DISABLED"
  database_mode           = "READ_WRITE"

  customer_contacts {
    email = "tragopoulos@icloud.com"
  }

  data_storage {
    is_auto_expand_storage_enabled = "false"
  }

  deletion_policy {
    automatic_backup_retention = "RETAIN"
    final_backup               = "REQUIRE_FINAL_BACKUP"
    is_delete_protected        = "true"
  }

  encrypt_data {
    key_generation_type = "SYSTEM"
  }

  maintenance {
    window_start_time = "MONDAY 03:00"
  }

  rest {
    configuration = "DISABLED"
  }

  secure_connections {
    certificate_generation_type = "SYSTEM"
  }

  lifecycle {
    ignore_changes = [admin_username, admin_password]
  }
}

resource "oci_mysql_heat_wave_cluster" "operations_heatwave" {
  db_system_id         = oci_mysql_mysql_db_system.operations_db.id
  cluster_size         = 1
  is_lakehouse_enabled = "true"
  shape_name           = "HeatWave.Free"
}
