/** ============================================================================
 *  DATABASE - Admin
 *  ============================================================================ */
CREATE DATABASE IF NOT EXISTS admin;

USE admin;

/** ============================================================================
 *  BASE SCHEMA - Core table definitions
 *  ============================================================================ */

CREATE TABLE IF NOT EXISTS users (
    id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    email       VARCHAR(320)    NOT NULL UNIQUE,
    name        VARCHAR(255)    NOT NULL DEFAULT '',
    role        ENUM('admin','support') NOT NULL,
    created_at  DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
);

INSERT IGNORE INTO users (email, role) VALUES ('tragopoulos@icloud.com', 'admin');

CREATE TABLE IF NOT EXISTS magic_links (
    id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    link_hash   CHAR(64)        NOT NULL UNIQUE,
    email       VARCHAR(320)    NOT NULL,
    created_at  DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    expires_at  DATETIME(6)     NOT NULL,
    INDEX idx_magic_links_expires_at (expires_at)
);

CREATE TABLE IF NOT EXISTS sessions (
    id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    session_hash CHAR(64)        NOT NULL UNIQUE,
    email        VARCHAR(320)    NOT NULL,
    created_at   DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    expires_at   DATETIME(6)     NOT NULL,
    revoked_at   DATETIME(6)     NULL,
    INDEX idx_sessions_email      (email),
    INDEX idx_sessions_expires_at (expires_at)
);

/** ============================================================================
 *  SCHEMA CHANGES - Add new changes below
 *  Always use IF NOT EXISTS / IF EXISTS for idempotency
 *  ============================================================================ */

-- 2026-07-25: Initial schema created
