package db

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	_ "github.com/go-sql-driver/mysql"
)

type DBConfig struct {
	dbName      string
	maxOpen     int
	maxIdle     int
	maxLifetime time.Duration
}

func createPool(cfg *Config, pc DBConfig) (*sql.DB, error) {
	if cfg.MySQL_USERNAME == "" || cfg.MySQL_PASSWORD == "" || cfg.MySQL_IP == "" {
		return nil, fmt.Errorf("mysql: missing required config fields")
	}

	dsn := fmt.Sprintf("%s:%s@tcp(%s)/%s?parseTime=true&loc=UTC",
		cfg.MySQL_USERNAME, cfg.MySQL_PASSWORD, cfg.MySQL_IP, pc.dbName)

	db, err := sql.Open("mysql", dsn)
	if err != nil {
		return nil, fmt.Errorf("failed to open %s database: %w", pc.dbName, err)
	}

	db.SetMaxOpenConns(pc.maxOpen)
	db.SetMaxIdleConns(pc.maxIdle)
	db.SetConnMaxLifetime(pc.maxLifetime)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := db.PingContext(ctx); err != nil {
		db.Close()
		return nil, fmt.Errorf("failed to ping %s database: %w", pc.dbName, err)
	}

	return db, nil
}

func CreateMySQL(config *Config) (*sql.DB, error) {
	return createPool(config, DBConfig{
		dbName:      "admin",
		maxOpen:     25,
		maxIdle:     5,
		maxLifetime: 5 * time.Minute,
	})
}

func CreateEmailsMySQL(config *Config) (*sql.DB, error) {
	return createPool(config, DBConfig{
		dbName:      "emails",
		maxOpen:     10,
		maxIdle:     2,
		maxLifetime: 5 * time.Minute,
	})
}
