package operations

import (
	"database/sql"
	"strings"
	"time"
)

type User struct {
	ID        uint64
	Email     string
	Name      string
	Role      string
	CreatedAt time.Time
}

/** CreateUser inserts a new user row */
func CreateUser(pool *sql.DB, email, name, role string) error {
	_, err := pool.Exec("INSERT INTO users (email, name, role) VALUES (?, ?, ?)", email, name, role)
	return err
}

/** ReadUser returns one or more users. With no arguments it returns every
 *  user; with one or more emails it returns only the matching rows. */
func ReadUser(pool *sql.DB, emails ...string) ([]User, error) {
	query := "SELECT id, email, name, role, created_at FROM users"
	args := []any{}
	if len(emails) > 0 {
		placeholders := strings.Repeat("?,", len(emails))
		placeholders = placeholders[:len(placeholders)-1]
		query += " WHERE email IN (" + placeholders + ")"
		for _, e := range emails {
			args = append(args, e)
		}
	}
	query += " ORDER BY email"

	rows, err := pool.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var users []User
	for rows.Next() {
		var u User
		if err := rows.Scan(&u.ID, &u.Email, &u.Name, &u.Role, &u.CreatedAt); err != nil {
			return nil, err
		}
		users = append(users, u)
	}
	return users, rows.Err()
}

/** ReadUserByID returns one or more users matched by their numeric id. */
func ReadUserByID(pool *sql.DB, ids ...uint64) ([]User, error) {
	if len(ids) == 0 {
		return nil, nil
	}
	placeholders := strings.Repeat("?,", len(ids))
	placeholders = placeholders[:len(placeholders)-1]
	args := make([]any, len(ids))
	for i, id := range ids {
		args[i] = id
	}
	rows, err := pool.Query(
		"SELECT id, email, name, role, created_at FROM users WHERE id IN ("+placeholders+") ORDER BY email",
		args...,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var users []User
	for rows.Next() {
		var u User
		if err := rows.Scan(&u.ID, &u.Email, &u.Name, &u.Role, &u.CreatedAt); err != nil {
			return nil, err
		}
		users = append(users, u)
	}
	return users, rows.Err()
}

/** UpdateUser patches only the fields set on the User struct.
 *  Empty strings are treated as "leave this column unchanged" — safe because
 *  neither column accepts the empty string as a legal value. */
func UpdateUser(pool *sql.DB, email string, u User) error {
	sets := []string{}
	args := []any{}
	if u.Email != "" {
		sets = append(sets, "email = ?")
		args = append(args, u.Email)
	}
	if u.Name != "" {
		sets = append(sets, "name = ?")
		args = append(args, u.Name)
	}
	if u.Role != "" {
		sets = append(sets, "role = ?")
		args = append(args, u.Role)
	}
	if len(sets) == 0 {
		return nil
	}
	args = append(args, email)
	_, err := pool.Exec("UPDATE users SET "+strings.Join(sets, ", ")+" WHERE email = ?", args...)
	return err
}

/** DeleteUser removes a user by email */
func DeleteUser(pool *sql.DB, email string) error {
	_, err := pool.Exec("DELETE FROM users WHERE email = ?", email)
	return err
}
