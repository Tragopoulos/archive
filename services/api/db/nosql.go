package db

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/oracle/nosql-go-sdk/nosqldb"
	"github.com/oracle/nosql-go-sdk/nosqldb/auth/iam"
	"github.com/oracle/nosql-go-sdk/nosqldb/common"
	"github.com/oracle/nosql-go-sdk/nosqldb/types"
)

/** CreateNoSQL returns a NoSQL client using Instance Principal auth */
func CreateNoSQL(config *Config) (*nosqldb.Client, error) {
	provider, err := iam.NewSignatureProviderWithInstancePrincipal(config.NoSQLCompartmentID)
	if err != nil {
		return nil, fmt.Errorf("instance principal auth failed: %w", err)
	}

	client, err := nosqldb.NewClient(nosqldb.Config{
		Mode:                  "cloud",
		Region:                common.Region(config.NoSQLRegion),
		AuthorizationProvider: provider,
		RequestConfig: nosqldb.RequestConfig{
			RequestTimeout: 5 * time.Second,
		},
	})
	if err != nil {
		return nil, fmt.Errorf("nosql client creation failed: %w", err)
	}

	return client, nil
}

/** CreateToTable executes the insert statement from a TxOp; returns false on DB error */
func CreateToTable(client *nosqldb.Client, op TxOp) bool {
	req := &nosqldb.QueryRequest{Statement: op.Statement}
	_, err := client.Query(req)
	return err == nil
}

/** ReadFromTable executes a SELECT, unmarshals the first row into T.
 *  Returns (nil, false) on DB error, (nil, true) when not found, (*T, true) when found. */
func ReadFromTable[T any](client *nosqldb.Client, stmtTemplate string, args ...any) (*T, bool) {
	stmt := fmt.Sprintf(stmtTemplate, args...)
	req := &nosqldb.QueryRequest{
		Statement:   stmt,
		Consistency: types.Absolute,
	}
	res, err := client.Query(req)
	if err != nil {
		return nil, false
	}
	results, err := res.GetResults()
	if err != nil {
		return nil, false
	}
	if len(results) == 0 {
		return nil, true
	}
	b, err := json.Marshal(results[0].Map())
	if err != nil {
		return nil, false
	}
	var result T
	if err := json.Unmarshal(b, &result); err != nil {
		return nil, false
	}
	return &result, true
}

/** UpdateToTable executes an UPDATE statement; returns false on DB error */
func UpdateToTable(client *nosqldb.Client, stmt string) bool {
	req := &nosqldb.QueryRequest{Statement: stmt}
	_, err := client.Query(req)
	return err == nil
}

/** DeleteFromTable executes a DELETE statement; returns false on DB error */
func DeleteFromTable(client *nosqldb.Client, stmt string) bool {
	req := &nosqldb.QueryRequest{Statement: stmt}
	_, err := client.Query(req)
	return err == nil
}

/** TxOp represents a single operation in a compensating transaction */
type TxOp struct {
	Statement string // Forward DML (INSERT, UPDATE, DELETE)
	Rollback  string // Compensating DML (executed on failure)
}

/** ExecuteTx executes operations sequentially. On failure, compensates in reverse order. */
func ExecuteTx(client *nosqldb.Client, config *Config, ops []TxOp) error {
	var completed int

	for i, op := range ops {
		req := &nosqldb.QueryRequest{
			Statement:   op.Statement,
			Consistency: types.Absolute,
		}

		_, err := client.Query(req)
		if err != nil {
			/** Compensate completed operations in reverse order */
			for j := completed - 1; j >= 0; j-- {
				if ops[j].Rollback == "" {
					continue
				}
				rollbackReq := &nosqldb.QueryRequest{
					Statement: ops[j].Rollback,
				}
				if _, rbErr := client.Query(rollbackReq); rbErr != nil {
					if config.LoggerURL == "" {
						fmt.Printf("CRITICAL: rollback failed at step %d: %v (statement: %s)\n", j, rbErr, ops[j].Rollback)
					} else {
						payload, _ := json.Marshal(map[string]any{
							"severity": "critical",
							"method":   "INTERNAL",
							"route":    "/tx_rollback",
							"message":  fmt.Sprintf("rollback failed at step %d: %v", j, rbErr),
						})
						ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
						defer cancel()
						logReq, _ := http.NewRequestWithContext(ctx, "POST", config.LoggerURL, bytes.NewReader(payload))
						logReq.Header.Set("Content-Type", "application/json")
						http.DefaultClient.Do(logReq)
					}
				}
			}
			return fmt.Errorf("tx failed at step %d: %w", i, err)
		}
		completed++
	}

	return nil
}
