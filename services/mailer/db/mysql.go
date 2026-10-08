package db

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	_ "github.com/go-sql-driver/mysql"
	mysqlDriver "github.com/go-sql-driver/mysql"
)

/** Returns a MySQL connection pool */

func CreateMySQL(config *Config) (*sql.DB, error) {
	if config.MySQL_USERNAME == "" || config.MySQL_PASSWORD == "" || config.MySQL_IP == "" {
		return nil, fmt.Errorf("mysql database configuration is missing required fields (username, password, or ip)")
	}

	rootDSN := fmt.Sprintf("%s:%s@tcp(%s)/?parseTime=true&loc=UTC",
		config.MySQL_USERNAME,
		config.MySQL_PASSWORD,
		config.MySQL_IP,
	)

	dsn := fmt.Sprintf("%s:%s@tcp(%s)/mailer?parseTime=true&loc=UTC",
		config.MySQL_USERNAME,
		config.MySQL_PASSWORD,
		config.MySQL_IP,
	)

	dbConn, err := sql.Open("mysql", dsn)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	dbConn.SetMaxOpenConns(50)
	dbConn.SetMaxIdleConns(5)
	dbConn.SetConnMaxLifetime(5 * time.Minute)

	if err := dbConn.Ping(); err != nil {
		if isUnknownDatabaseError(err) {
			dbConn.Close()
			if err := bootstrapEmailsDatabase(rootDSN); err != nil {
				return nil, fmt.Errorf("failed to bootstrap emails database: %w", err)
			}

			dbConn, err = sql.Open("mysql", dsn)
			if err != nil {
				return nil, fmt.Errorf("failed to reopen database after bootstrap: %w", err)
			}
			dbConn.SetMaxOpenConns(50)
			dbConn.SetMaxIdleConns(5)
			dbConn.SetConnMaxLifetime(5 * time.Minute)
		}

		if err := dbConn.Ping(); err != nil {
			dbConn.Close()
			return nil, fmt.Errorf("failed to ping database: %w", err)
		}
	}

	if err := ensureEmailsSchema(dbConn); err != nil {
		dbConn.Close()
		return nil, fmt.Errorf("failed to ensure emails schema: %w", err)
	}

	return dbConn, nil
}

func bootstrapEmailsDatabase(rootDSN string) error {
	bootstrapConn, err := sql.Open("mysql", rootDSN)
	if err != nil {
		return fmt.Errorf("failed to open bootstrap connection: %w", err)
	}
	defer bootstrapConn.Close()

	if err := bootstrapConn.Ping(); err != nil {
		return fmt.Errorf("failed to ping bootstrap connection: %w", err)
	}

	if _, err := bootstrapConn.Exec("CREATE DATABASE IF NOT EXISTS mailer"); err != nil {
		return fmt.Errorf("failed to create mailer database: %w", err)
	}

	return nil
}

func ensureEmailsSchema(pool *sql.DB) error {
	if _, err := pool.Exec(`
		CREATE TABLE IF NOT EXISTS emails (
			id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
			created_at DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
			hostname   VARCHAR(255)    NOT NULL,
			status     VARCHAR(32)     NOT NULL DEFAULT 'sent',
			from_email VARCHAR(255)    NOT NULL,
			to_email   VARCHAR(255)    NOT NULL,
			subject    VARCHAR(500)    NOT NULL,
			template   VARCHAR(100)    NOT NULL,
			components JSON            NULL,
			INDEX idx_emails_to (to_email),
			INDEX idx_emails_from (from_email),
			INDEX idx_emails_created_at (created_at),
			INDEX idx_emails_hostname (hostname)
		)
	`); err != nil {
		return fmt.Errorf("failed to create emails table: %w", err)
	}

	var statusColumnCount int
	if err := pool.QueryRow(`
		SELECT COUNT(*)
		FROM information_schema.columns
		WHERE table_schema = 'mailer' AND table_name = 'emails' AND column_name = 'status'
	`).Scan(&statusColumnCount); err != nil {
		return fmt.Errorf("failed to inspect emails.status column: %w", err)
	}

	if statusColumnCount == 0 {
		if _, err := pool.Exec("ALTER TABLE emails ADD COLUMN status VARCHAR(32) NOT NULL DEFAULT 'sent' AFTER hostname"); err != nil {
			return fmt.Errorf("failed to add emails.status column: %w", err)
		}
	}

	var fromColumnCount int
	if err := pool.QueryRow(`
		SELECT COUNT(*)
		FROM information_schema.columns
		WHERE table_schema = 'mailer' AND table_name = 'emails' AND column_name = 'from_email'
	`).Scan(&fromColumnCount); err != nil {
		return fmt.Errorf("failed to inspect emails.from_email column: %w", err)
	}

	if fromColumnCount == 0 {
		if _, err := pool.Exec("ALTER TABLE emails CHANGE COLUMN `from` from_email VARCHAR(255) NOT NULL"); err != nil {
			return fmt.Errorf("failed to rename emails.from column: %w", err)
		}
	}

	var toColumnCount int
	if err := pool.QueryRow(`
		SELECT COUNT(*)
		FROM information_schema.columns
		WHERE table_schema = 'mailer' AND table_name = 'emails' AND column_name = 'to_email'
	`).Scan(&toColumnCount); err != nil {
		return fmt.Errorf("failed to inspect emails.to_email column: %w", err)
	}

	if toColumnCount == 0 {
		if _, err := pool.Exec("ALTER TABLE emails CHANGE COLUMN `to` to_email VARCHAR(255) NOT NULL"); err != nil {
			return fmt.Errorf("failed to rename emails.to column: %w", err)
		}
	}

	return nil
}

func isUnknownDatabaseError(err error) bool {
	var mysqlErr *mysqlDriver.MySQLError
	if !errors.As(err, &mysqlErr) {
		return false
	}

	return mysqlErr.Number == 1049
}

func isSchemaDriftError(err error) bool {
	var mysqlErr *mysqlDriver.MySQLError
	if !errors.As(err, &mysqlErr) {
		return false
	}

	switch mysqlErr.Number {
	case 1054, 1146:
		return true
	default:
		return false
	}
}

/** Email model */
type Email struct {
	ID         uint64           `json:"id"`
	CreatedAt  time.Time        `json:"created_at"`
	Hostname   string           `json:"hostname"`
	Status     string           `json:"status"`
	From       string           `json:"from"`
	To         string           `json:"to"`
	Subject    string           `json:"subject"`
	Template   string           `json:"template"`
	Components []map[string]any `json:"components"`
}

/** InsertEmail stores an email record and returns the ID */
func InsertEmail(pool *sql.DB, e *Email) (int64, error) {
	components, err := json.Marshal(e.Components)
	if err != nil {
		return 0, err
	}

	result, err := insertEmailRow(pool, e, string(components))
	if err != nil {
		if isSchemaDriftError(err) {
			if ensureErr := ensureEmailsSchema(pool); ensureErr != nil {
				return 0, fmt.Errorf("insert email failed and schema repair failed: %w", ensureErr)
			}

			result, err = insertEmailRow(pool, e, string(components))
		}
		if err != nil {
			return 0, err
		}
	}

	return result.LastInsertId()
}

func insertEmailRow(pool *sql.DB, e *Email, components string) (sql.Result, error) {
	return pool.Exec(
		"INSERT INTO emails (created_at, hostname, status, from_email, to_email, subject, template, components) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
		e.CreatedAt, e.Hostname, e.Status, e.From, e.To, e.Subject, e.Template, components,
	)
}

func UpdateEmailStatus(pool *sql.DB, id int64, status string) error {
	_, err := pool.Exec("UPDATE emails SET status = ? WHERE id = ?", status, id)
	return err
}

/** ReadEmails returns all emails, newest first */
func ReadEmails(pool *sql.DB) ([]Email, error) {
	rows, err := pool.Query("SELECT id, created_at, hostname, status, from_email, to_email, subject, template, components FROM emails ORDER BY created_at DESC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var emails []Email
	for rows.Next() {
		var e Email
		var componentsRaw []byte
		if err := rows.Scan(&e.ID, &e.CreatedAt, &e.Hostname, &e.Status, &e.From, &e.To, &e.Subject, &e.Template, &componentsRaw); err != nil {
			return nil, err
		}
		if len(componentsRaw) > 0 {
			if err := json.Unmarshal(componentsRaw, &e.Components); err != nil {
				e.Components = nil
			}
		}
		emails = append(emails, e)
	}
	return emails, rows.Err()
}

/** ReadEmailByID returns a single email by ID */
func ReadEmailByID(pool *sql.DB, id uint64) (*Email, error) {
	row := pool.QueryRow("SELECT id, created_at, hostname, status, from_email, to_email, subject, template, components FROM emails WHERE id = ?", id)
	var e Email
	var componentsRaw []byte
	if err := row.Scan(&e.ID, &e.CreatedAt, &e.Hostname, &e.Status, &e.From, &e.To, &e.Subject, &e.Template, &componentsRaw); err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	if len(componentsRaw) > 0 {
		if err := json.Unmarshal(componentsRaw, &e.Components); err != nil {
			e.Components = nil
		}
	}
	return &e, nil
}
