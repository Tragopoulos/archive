package operations

import (
	"database/sql"
	"strings"
	"time"
)

type MagicLink struct {
	ID        uint64
	LinkHash  string
	Email     string
	CreatedAt time.Time
	ExpiresAt time.Time
}

/** CreateMagicLink persists a freshly issued link with its expiry */
func CreateMagicLink(pool *sql.DB, hash, email string, ttl time.Duration) error {
	now := time.Now().UTC()
	_, err := pool.Exec(
		"INSERT INTO magic_links (link_hash, email, created_at, expires_at) VALUES (?, ?, ?, ?)",
		hash, email, now, now.Add(ttl),
	)
	return err
}

/** ReadMagicLink returns one or more magic links. With no arguments it returns
 *  every row; with one or more hashes it returns only the matching rows. */
func ReadMagicLink(pool *sql.DB, hashes ...string) ([]MagicLink, error) {
	query := "SELECT id, link_hash, email, created_at, expires_at FROM magic_links"
	args := []any{}
	if len(hashes) > 0 {
		placeholders := strings.Repeat("?,", len(hashes))
		placeholders = placeholders[:len(placeholders)-1]
		query += " WHERE link_hash IN (" + placeholders + ")"
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
	var links []MagicLink
	for rows.Next() {
		var m MagicLink
		if err := rows.Scan(&m.ID, &m.LinkHash, &m.Email, &m.CreatedAt, &m.ExpiresAt); err != nil {
			return nil, err
		}
		links = append(links, m)
	}
	return links, rows.Err()
}

/** UpdateMagicLink patches only the fields set on the MagicLink struct.
 *  Empty strings and zero times are treated as "leave this column unchanged". */
func UpdateMagicLink(pool *sql.DB, hash string, m MagicLink) error {
	sets := []string{}
	args := []any{}
	if m.Email != "" {
		sets = append(sets, "email = ?")
		args = append(args, m.Email)
	}
	if !m.ExpiresAt.IsZero() {
		sets = append(sets, "expires_at = ?")
		args = append(args, m.ExpiresAt)
	}
	if len(sets) == 0 {
		return nil
	}
	args = append(args, hash)
	_, err := pool.Exec("UPDATE magic_links SET "+strings.Join(sets, ", ")+" WHERE link_hash = ?", args...)
	return err
}

/** DeleteMagicLink removes one or more magic links by hash */
func DeleteMagicLink(pool *sql.DB, hashes ...string) error {
	if len(hashes) == 0 {
		return nil
	}
	placeholders := strings.Repeat("?,", len(hashes))
	placeholders = placeholders[:len(placeholders)-1]
	args := make([]any, len(hashes))
	for i, h := range hashes {
		args[i] = h
	}
	_, err := pool.Exec("DELETE FROM magic_links WHERE link_hash IN ("+placeholders+")", args...)
	return err
}
