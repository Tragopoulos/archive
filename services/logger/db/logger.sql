/** ============================================================================
 *  DATABASE - Logger
 *  ============================================================================ */
CREATE DATABASE IF NOT EXISTS logger;

USE logger;

/** ============================================================================
 *  BASE SCHEMA - Core table definitions
 *  ============================================================================ */

CREATE TABLE IF NOT EXISTS logs (
    id                      BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    created_at              DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    severity                VARCHAR(16)     NOT NULL,
    message                 TEXT,
    violations              JSON,
    method                  VARCHAR(8)      NOT NULL,
    route                   VARCHAR(64)     NOT NULL,
    hostname                VARCHAR(255),
    client_ip               VARCHAR(45),
    load_balancer_ip        VARCHAR(45),
    api_gateway_ip          VARCHAR(45),
    oci_request_id          VARCHAR(64),
    accept_encoding         VARCHAR(100),
    content_type            VARCHAR(100),
    content_length          INT,
    account_id              CHAR(36),
    device_id               VARBINARY(255),
    auth_time               DATETIME,
    auth_expires_at         DATETIME,
    platform                VARCHAR(16),
    ua_raw                  TEXT,
    ua_device_family        VARCHAR(64),
    ua_device_brand         VARCHAR(64),
    ua_device_model         VARCHAR(64),
    ua_os                   VARCHAR(32),
    ua_os_version           VARCHAR(32),
    ua                      VARCHAR(32),
    ua_version              VARCHAR(32),
    city                    VARCHAR(128),
    country                 VARCHAR(64),
    country_iso             CHAR(2),
    accuracy_radius         SMALLINT,
    latitude                DECIMAL(9,6),
    longitude               DECIMAL(9,6),
    metro_code              SMALLINT,
    time_zone               VARCHAR(64),
    postal_code             VARCHAR(16),
    is_anonymous_proxy      TINYINT(1) NOT NULL DEFAULT 0,
    is_anycast              TINYINT(1) NOT NULL DEFAULT 0,
    is_satellite_provider   TINYINT(1) NOT NULL DEFAULT 0,
    asn                     INT,
    asn_org                 VARCHAR(255),
    origin                  VARCHAR(255),
    res_http_status         SMALLINT,
    res_http_text           VARCHAR(64),
    res_body                JSON,
    req_body                JSON,
    INDEX idx_logs_created_account  (created_at, account_id),
    INDEX idx_logs_created_device   (created_at, device_id),
    INDEX idx_logs_created_severity (created_at, severity),
    INDEX idx_logs_created_ip       (created_at, client_ip)
);

/** ============================================================================
 *  SCHEMA CHANGES - Add new changes below
 *  Always use IF NOT EXISTS / IF EXISTS for idempotency
 *
 *  Keep all changes here so the entire file can be run repeatedly safely
 *  ============================================================================ */

-- 2026-05-18: Initial schema created
-- Add your schema changes below this line
