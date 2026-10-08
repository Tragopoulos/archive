resource "oci_identity_policy" "administrator_policies" {
  compartment_id = var.tenancy_ocid
  name           = "ADMINISTRATOR_POLICIES"
  description    = "Includes all policies for Administrators in the tenancy"
  statements = [
    # Peering
    "Allow group Administrators to manage local-peering-gateways in tenancy",
    "Allow group Administrators to manage vcns in tenancy",
    # Object Storage
    "Allow group Administrators to manage buckets in tenancy",
    "Allow group Administrators to manage objects in tenancy",
    "Allow any-user to manage object-family in tenancy where request.principal.type='instance'",
    format("%s%s%s%s", "Allow dynamic-group ", oci_identity_dynamic_group.faas_dynamic_group.name, " to manage buckets in compartment ", oci_identity_compartment.env_compartment.name),
    format("%s%s%s%s", "Allow dynamic-group ", oci_identity_dynamic_group.faas_dynamic_group.name, " to manage objects in compartment ", oci_identity_compartment.env_compartment.name),
    # NoSQL Tables
    "Allow group Administrators to manage nosql-family in tenancy",
    # Email Service
    "Allow group Administrators to manage email-family in tenancy",
    # API Gateway (Only for API Gateway access to/from FaaS)
    format("%s%s%s%s%s", "Allow any-user to use functions-family in compartment ", oci_identity_compartment.env_compartment.name,
    " where ALL {request.principal.type= 'ApiGateway', request.resource.compartment.id = '", oci_identity_compartment.env_compartment.id, "'}"),
    # Functions
    "Allow group Administrators to use cloud-shell in tenancy",
    "Allow group Administrators to read objectstorage-namespaces in tenancy",
    format("%s%s", "Allow group Administrators to manage repos in compartment ", oci_identity_compartment.env_compartment.name),
    format("%s%s", "Allow group Administrators to manage logging-family in compartment ", oci_identity_compartment.env_compartment.name),
    format("%s%s", "Allow group Administrators to read metrics in compartment ", oci_identity_compartment.env_compartment.name),
    format("%s%s", "Allow group Administrators to manage functions-family in compartment ", oci_identity_compartment.env_compartment.name),
    format("%s%s", "Allow group Administrators to use virtual-network-family in compartment ", oci_identity_compartment.env_compartment.name),
    format("%s%s", "Allow group Administrators to use apm-domains in compartment ", oci_identity_compartment.env_compartment.name),
    format("%s%s", "Allow group Administrators to read vaults in compartment ", oci_identity_compartment.env_compartment.name),
    format("%s%s", "Allow group Administrators to use keys in compartment ", oci_identity_compartment.env_compartment.name),
    format("%s%s", "Allow service faas to use apm-domains in compartment ", oci_identity_compartment.env_compartment.name),
    "Allow service faas to read repos in tenancy where request.operation='ListContainerImageSignatures'",
    format("%s%s%s", "Allow service faas to {KEY_READ} in compartment ", oci_identity_compartment.env_compartment.name, " where request.operation='GetKeyVersion'"),
    format("%s%s%s", "Allow service faas to {KEY_VERIFY} in compartment ", oci_identity_compartment.env_compartment.name, " where request.operation='Verify'"),
    format("%s%s", "Allow service FaaS to use virtual-network-family in compartment id ", oci_identity_compartment.env_compartment.id),
    format("%s%s%s%s", "Allow dynamic-group ", oci_identity_dynamic_group.faas_dynamic_group.name,
    " to manage all-resources in compartment id ", oci_identity_compartment.env_compartment.id),
  ]
}

resource "oci_identity_policy" "mandatory_mysql_policies" {
  compartment_id = var.tenancy_ocid
  name           = "MYSQL_POLICIES"
  description    = "Mandatory policies for Administrators to manage MySQL HeatWave DB systems in tenancy"

  statements = [
    "Allow group Administrators to manage mysql-family in tenancy",
    "Allow group Administrators to manage dbmgmt-mysql-family in tenancy",
    "Allow group Administrators to inspect compartments in tenancy",
    "Allow group Administrators to read virtual-network-family in tenancy",
    "Allow group Administrators to manage virtual-network-family in tenancy",
    "Allow group Administrators to manage vnics in tenancy",
    "Allow group Administrators to manage network-security-groups in tenancy",
    "Allow group Administrators to {VCN_READ, SUBNET_READ, SUBNET_ATTACH, SUBNET_DETACH} in tenancy",
    "Allow group Administrators to {NETWORK_SECURITY_GROUP_READ, NETWORK_SECURITY_GROUP_UPDATE_MEMBERS, VNIC_ASSOCIATE_NETWORK_SECURITY_GROUP, VNIC_DISASSOCIATE_NETWORK_SECURITY_GROUP} in tenancy",
    "Allow group Administrators to {VNIC_CREATE, VNIC_DELETE, VNIC_UPDATE, NETWORK_SECURITY_GROUP_UPDATE_MEMBERS, VNIC_ASSOCIATE_NETWORK_SECURITY_GROUP} in tenancy",
    "Allow group Administrators to read leaf-certificates in tenancy",
    "Allow group Administrators to read vaults in tenancy",
    "Allow group Administrators to read keys in tenancy",
    "Allow group Administrators to read metrics in tenancy",
    "Allow any-user to {AUTHENTICATION_INSPECT, GROUP_MEMBERSHIP_INSPECT, DYNAMIC_GROUP_INSPECT} in tenancy where request.principal.type='mysqldbsystem'",
    "Allow any-user to {NETWORK_SECURITY_GROUP_UPDATE_MEMBERS} in tenancy where all {request.principal.type='mysqldbsystem'}",
    "Allow any-user to {VNIC_CREATE, VNIC_UPDATE, VNIC_ASSOCIATE_NETWORK_SECURITY_GROUP, VNIC_DISASSOCIATE_NETWORK_SECURITY_GROUP} in tenancy where all {request.principal.type='mysqldbsystem'}",
    "Allow any-user to {SECURITY_ATTRIBUTE_NAMESPACE_USE, VNIC_UPDATE, VNIC_CREATE} in tenancy where all {request.principal.type='mysqldbsystem'}",
    "Allow any-user to use key-delegate in tenancy where all {request.principal.type='mysqldbsystem'}",
    "Endorse any-user to {VOLUME_UPDATE, VOLUME_INSPECT, VOLUME_CREATE, VOLUME_BACKUP_READ, VOLUME_BACKUP_UPDATE, BUCKET_UPDATE, VOLUME_GROUP_BACKUP_CREATE, VOLUME_BACKUP_COPY, VOLUME_BACKUP_CREATE, TAG_NAMESPACE_INSPECT, TAG_NAMESPACE_USE} in any-tenancy where request.principal.type='mysqldbsystem'",
    "Endorse any-user to associate keys in tenancy with volumes in any-tenancy where request.principal.type='mysqldbsystem'",
    "Endorse any-user to associate keys in tenancy with volume-backups in any-tenancy where request.principal.type='mysqldbsystem'",
    "Endorse any-user to associate keys in tenancy with buckets in any-tenancy where request.principal.type='mysqldbsystem'",
  ]
}

resource "oci_identity_policy" "requestor_peering_policy" {
  name           = "PEERING_POLICIES"
  description    = "Allows Operations tenancy to initiate local VCN peering with Production tenancy"
  compartment_id = var.tenancy_ocid

  statements = [
    "Define tenancy Acceptor as ocid1.localpeeringgateway.oc1.eu-frankfurt-1.aaaaaaaazz3cwypsio44qs53xsgtdwqkwznoc6lgzjccadn23bzijvgei2xq",
    "Define group Administrators as ocid1.group.oc1..aaaaaaaacakdfqxl4a3uxu4xnpfnfvg64ncqjvagldyijyehwm73sa4jbcxq",
    "Define compartment OPERATIONS as ${oci_identity_compartment.env_compartment.id}",
    "Allow group Administrators to manage local-peering-from in compartment OPERATIONS",
    "Endorse group Administrators to manage local-peering-to in tenancy Acceptor",
    "Endorse group Administrators to associate local-peering-gateways in compartment OPERATIONS with local-peering-gateways in tenancy Acceptor",
  ]
}
