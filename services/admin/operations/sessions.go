package operations

import (
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"strings"
	"time"
)

type Session struct {
	ID          uint64
	SessionHash string
	Email       string
	CreatedAt   time.Time
	ExpiresAt   time.Time
	RevokedAt   sql.NullTime
}

/** HashSessionID hashes an opaque session id for lookup. Must match the
 *  algorithm used at issue time so cookie checks resolve to a row. */
func HashSessionID(id string) string {
	sum := sha256.Sum256([]byte(id))
	return hex.EncodeToString(sum[:])
}

/** MaxActiveSessionsPerUser is the cap on concurrent active (non-revoked,
 *  non-expired) sessions for a single email. */
const MaxActiveSessionsPerUser = 2

/** CreateSession persists a new session and enforces MaxActiveSessionsPerUser
 *  by revoking the oldest active sessions for the same email beyond the cap. */
func CreateSession(pool *sql.DB, hash, email string, ttl time.Duration) error {
	now := time.Now().UTC()
	if _, err := pool.Exec(
		"INSERT INTO sessions (session_hash, email, created_at, expires_at) VALUES (?, ?, ?, ?)",
		hash, email, now, now.Add(ttl),
	); err != nil {
		return err
	}

	/** Revoke all but the MaxActiveSessionsPerUser most recently created
	 *  active sessions for this email. Wrapping the LIMIT subquery in an
	 *  outer SELECT is required so MySQL allows referencing the same table
	 *  in UPDATE...IN. */
	_, err := pool.Exec(`
		UPDATE sessions
		SET revoked_at = UTC_TIMESTAMP(6)
		WHERE email = ?
		  AND revoked_at IS NULL
		  AND expires_at > UTC_TIMESTAMP(6)
		  AND id NOT IN (
		    SELECT id FROM (
		      SELECT id FROM sessions
		      WHERE email = ? AND revoked_at IS NULL AND expires_at > UTC_TIMESTAMP(6)
		      ORDER BY created_at DESC
		      LIMIT ?
		    ) AS keep
		  )
	`, email, email, MaxActiveSessionsPerUser)
	return err
}

/** ReadSession returns one or more sessions. With no arguments it returns
 *  every session; with one or more hashes it returns only the matching rows. */
func ReadSession(pool *sql.DB, hashes ...string) ([]Session, error) {
	query := "SELECT id, session_hash, email, created_at, expires_at, revoked_at FROM sessions"
	args := []any{}
	if len(hashes) > 0 {
		placeholders := strings.Repeat("?,", len(hashes))
		placeholders = placeholders[:len(placeholders)-1]
		query += " WHERE session_hash IN (" + placeholders + ")"
		for _, h := range hashes {
			args = append(args, h)
		}
	}
	query += " ORDER BY created_at"

	rows, err := pool.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var sessions []Session
	for rows.Next() {
		var s Session
		if err := rows.Scan(&s.ID, &s.SessionHash, &s.Email, &s.CreatedAt, &s.ExpiresAt, &s.RevokedAt); err != nil {
			return nil, err
		}
		sessions = append(sessions, s)
	}
	return sessions, rows.Err()
}

/** UpdateSession patches only the fields set on the Session struct.
 *  Empty strings and zero times are treated as "leave this column unchanged".
 *  RevokedAt only writes when Valid is true. */
func UpdateSession(pool *sql.DB, hash string, s Session) error {
	sets := []string{}
	args := []any{}
	if s.Email != "" {
		sets = append(sets, "email = ?")
		args = append(args, s.Email)
	}
	if !s.ExpiresAt.IsZero() {
		sets = append(sets, "expires_at = ?")
		args = append(args, s.ExpiresAt)
	}
	if s.RevokedAt.Valid {
		sets = append(sets, "revoked_at = ?")
		args = append(args, s.RevokedAt.Time)
	}
	if len(sets) == 0 {
		return nil
	}
	args = append(args, hash)
	_, err := pool.Exec("UPDATE sessions SET "+strings.Join(sets, ", ")+" WHERE session_hash = ?", args...)
	return err
}

/** DeleteSession removes one or more sessions by hash */
func DeleteSession(pool *sql.DB, hashes ...string) error {
	if len(hashes) == 0 {
		return nil
	}
	placeholders := strings.Repeat("?,", len(hashes))
	placeholders = placeholders[:len(placeholders)-1]
	args := make([]any, len(hashes))
	for i, h := range hashes {
		args[i] = h
	}
	_, err := pool.Exec("DELETE FROM sessions WHERE session_hash IN ("+placeholders+")", args...)
	return err
}
