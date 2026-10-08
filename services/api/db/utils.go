package db

import "time"

/** NowUTC returns the current UTC time formatted as ISO 8601 for NoSQL storage */
func NowUTC() string {
	return time.Now().UTC().Format(time.RFC3339)
}

/** ParseTimestamp parses an ISO 8601 string back to time.Time */
func ParseTimestamp(s string) (time.Time, error) {
	return time.Parse(time.RFC3339, s)
}
