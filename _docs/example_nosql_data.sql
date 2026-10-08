/** ============================================================================
 *  OCI NoSQL - Table Definitions
 *  ============================================================================
 *
 *  Tables:
 *    1. accounts       - User accounts with embedded auth methods
 *    2. organizations  - Organizations with embedded members
 *    3. devices        - Device signatures + settings (merged)
 *    4. mfa_challenges - MFA verification codes (TTL-enabled)
 *
 *  Notes:
 *    - OCI NoSQL DDL syntax (not standard SQL)
 *    - No ENUMs: use STRING and validate in the application
 *    - No foreign keys: enforce referential integrity in the application
 *    - BINARY maps to CRDB BYTES
 *    - JSON preserves exact numeric values (e.g. 3.028463562)
 *    - TTL is set per-row via the SDK, not in the DDL
 *    - Schema changes: add/remove fields in JSON without DDL modifications
 *  ============================================================================ */

-- 1. Accounts
CREATE TABLE IF NOT EXISTS accounts (
    account_id STRING,
    created_at TIMESTAMP(0),
    updated_at TIMESTAMP(0),
    profile JSON,
    auth_methods JSON,
    PRIMARY KEY (account_id)
)

/*
  profile JSON structure:
  {
    "name": "John Doe",
    "picture": "https://...",
    "is_active": true
  }

  auth_methods JSON structure:
  [
    {
      "provider": "google",
      "firebase_uid": "abc123",
      "audience": "...",
      "issuer": "...",
      "email": "user@example.com",
      "is_verified": true,
      "created_at": "2026-05-18T00:00:00Z",
      "updated_at": "2026-05-18T00:00:00Z"
    }
  ]

  Valid providers: password, google, microsoft, x, apple, facebook, github
*/

CREATE INDEX IF NOT EXISTS idx_accounts_auth ON accounts (
    auth_methods[].provider AS STRING,
    auth_methods[].firebase_uid AS STRING
)

-- 2. Organizations
CREATE TABLE IF NOT EXISTS organizations (
    organization_id STRING,
    created_at TIMESTAMP(0),
    updated_at TIMESTAMP(0),
    profile JSON,
    members JSON,
    PRIMARY KEY (organization_id)
)

/*
  profile JSON structure:
  {
    "name": "MyClinic",
    "description": "Veterinary clinic",
    "logo": "https://...",
    "is_active": true
  }

  members JSON structure:
  [
    {
      "account_id": "uuid",
      "role": "owner",
      "is_active": true,
      "created_at": "2026-05-18T00:00:00Z",
      "updated_at": "2026-05-18T00:00:00Z"
    }
  ]

  Valid roles: owner, admin, member, viewer
*/

CREATE INDEX IF NOT EXISTS idx_org_members ON organizations (
    members[].account_id AS STRING
)

-- 3. Devices (merged device_signatures + device_settings)
CREATE TABLE IF NOT EXISTS devices (
    device_id STRING,
    created_at TIMESTAMP(0),
    updated_at TIMESTAMP(0),
    signature JSON,
    settings JSON,
    PRIMARY KEY (device_id)
)

/*
  signature JSON structure:
  {
    "account_id": "uuid",
    "device_type": "phone",
    "manufacturer": "Samsung",
    "brand": "Galaxy",
    "model_name": "S24 Ultra",
    "is_physical_device": true,
    "cpu_architectures": ["arm64-v8a"],
    "ios_model_id": null,
    "total_memory": 12884901888,
    "device_year_class": 2024
  }

  settings JSON structure:
  {
    "os_name": "Android",
    "os_version": "15",
    "device_name": "John's Phone",
    "os_build_id": "...",
    "android_design_name": "...",
    "android_os_build_fingerprint": "...",
    "android_platform_api_level": 35,
    "android_product_name": "...",
    "last_restart_at": "2026-05-18T00:00:00Z",
    "calendar_type": "gregorian",
    "first_weekday": "monday",
    "uses_24_hour": true,
    "currency_code": "EUR",
    "currency_symbol": "€",
    "decimal_separator": ",",
    "digit_grouping_separator": ".",
    "temperature_unit": "celsius",
    "text_direction": "ltr",
    "timezone": "Europe/Athens",
    "language_tag": "el-GR",
    "region_code": "GR",
    "accept_language": "el-GR,el;q=0.9,en;q=0.8"
  }

  Valid device_type: phone, tablet, desktop, unknown
*/

CREATE INDEX IF NOT EXISTS idx_devices_account ON devices (signature.account_id AS STRING)

-- 4. MFA Challenges
CREATE TABLE IF NOT EXISTS mfa_challenges (
    challenge_id STRING,
    created_at TIMESTAMP(0),
    expires_at TIMESTAMP(0),
    challenge JSON,
    PRIMARY KEY (challenge_id)
) USING TTL 1 HOURS

/*
  challenge JSON structure:
  {
    "firebase_uid": "abc123",
    "code": "482916",
    "attempts": 0,
    "is_used": false
  }
*/

CREATE INDEX IF NOT EXISTS idx_mfa_uid ON mfa_challenges (challenge.firebase_uid AS STRING)
