package request

import (
	"encoding/json"
	"io"
	"net/http"
	"strings"
)

func extractBody(r *http.Request, data *Data) {
	contentType := r.Header.Get("Content-Type")

	if strings.HasPrefix(contentType, "application/json") {
		extractJSONBody(r, data)
		return
	}

	if strings.HasPrefix(contentType, "multipart/form-data") {
		extractMultipartBody(r, data)
		return
	}

	data.ReqBody = map[string]any{}
	data.File = nil
	data.FileMeta = nil
}

/** JSON Handler */
func extractJSONBody(r *http.Request, data *Data) {
	var body map[string]any
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		data.ReqBody = map[string]any{}
		data.File = nil
		data.FileMeta = nil
		return
	}

	data.ReqBody = body
	data.File = nil
	data.FileMeta = nil
}

/** Multipart Handler */
func extractMultipartBody(r *http.Request, data *Data) {
	data.ReqBody = map[string]any{}
	data.File = nil
	data.FileMeta = nil

	if err := r.ParseMultipartForm(32 << 20); err != nil {
		return
	}

	bodyPart := r.FormValue("body")
	if bodyPart != "" {
		var body map[string]any
		if err := json.Unmarshal([]byte(bodyPart), &body); err == nil {
			data.ReqBody = body
		}
	}

	file, handler, err := r.FormFile("file")
	if handler == nil {
		return
	}

	data.FileMeta = map[string]any{
		"filename":     handler.Filename,
		"size":         handler.Size,
		"content_type": handler.Header.Get("Content-Type"),
		"headers":      handler.Header,
	}

	if err != nil {
		data.File = nil
		return
	}

	defer file.Close()

	fileBytes, err := io.ReadAll(file)
	if err != nil {
		data.File = nil
		return
	}

	data.File = fileBytes
}
