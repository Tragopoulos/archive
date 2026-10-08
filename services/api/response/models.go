package response

type Response struct {
	ID        string         `json:"id"`
	TIMESTAMP int64          `json:"timestamp"`
	DATA      map[string]any `json:"data"`
}
