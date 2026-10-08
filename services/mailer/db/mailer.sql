/** ============================================================================
 *  DATABASE - Mailer
 *  ============================================================================ */
CREATE DATABASE IF NOT EXISTS mailer;

USE mailer;

/** ============================================================================
 *  BASE SCHEMA - Core table definitions
 *  ============================================================================ */

CREATE TABLE IF NOT EXISTS emails (
    id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    created_at DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    hostname   VARCHAR(255)    NOT NULL,
    status     VARCHAR(32)     NOT NULL DEFAULT 'sent',
    `from`     VARCHAR(255)    NOT NULL,
    `to`       VARCHAR(255)    NOT NULL,
    subject    VARCHAR(500)    NOT NULL,
    template   VARCHAR(100)    NOT NULL,
    components JSON            NULL,
    INDEX idx_emails_to       (`to`),
    INDEX idx_emails_from     (`from`),
    INDEX idx_emails_created_at (created_at),
    INDEX idx_emails_hostname   (hostname)
);

/** ============================================================================
 *  SCHEMA CHANGES - Add new changes below
 *  Always use IF NOT EXISTS / IF EXISTS for idempotency
 *
 *  Example adding a column:
 *    ALTER TABLE emails ADD COLUMN IF NOT EXISTS new_column VARCHAR(255);
 *
 *  Example removing a column:
 *    ALTER TABLE emails DROP COLUMN IF EXISTS old_column;
 *
 *  Example adding an index:
 *    ALTER TABLE emails ADD INDEX IF NOT EXISTS idx_emails_new (new_column);
 *
 *  Keep all changes here so the entire file can be run repeatedly safely
 *  ============================================================================ */

-- 2026-07-19: Initial schema created
-- Add your schema changes below this line