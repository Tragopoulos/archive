package helpers

import (
	"admin/db"
	"bytes"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

/** ErrGiteaNotFound is returned by GiteaGetFile when the path does not exist
 *  on the configured branch. Callers can distinguish "file missing" from
 *  network or auth failures. */
var ErrGiteaNotFound = errors.New("gitea: file not found")

/** ErrGiteaNotConfigured is returned when the admin config has no Gitea
 *  credentials set yet. */
var ErrGiteaNotConfigured = errors.New("gitea: not configured")

type giteaContents struct {
	Path     string `json:"path"`
	SHA      string `json:"sha"`
	Encoding string `json:"encoding"`
	Content  string `json:"content"`
}

type giteaIdentity struct {
	Name  string `json:"name"`
	Email string `json:"email"`
}

type giteaPutRequest struct {
	Branch    string         `json:"branch"`
	Message   string         `json:"message"`
	Content   string         `json:"content"`
	SHA       string         `json:"sha,omitempty"`
	Author    *giteaIdentity `json:"author,omitempty"`
	Committer *giteaIdentity `json:"committer,omitempty"`
}

type giteaWorkflowDispatchRequest struct {
	Ref string `json:"ref"`
}

type giteaActionRun struct {
	ID int64 `json:"id"`
}

type giteaActionRunsResponse struct {
	WorkflowRuns []giteaActionRun `json:"workflow_runs"`
	TotalCount   int              `json:"total_count"`
}

/** giteaClient is a small singleton HTTP client tuned for short JSON
 *  round-trips against a self-hosted Gitea. */
var giteaClient = &http.Client{Timeout: 15 * time.Second}

func giteaBase(config *db.Config) (string, error) {
	if config.GiteaURL == "" || config.GiteaToken == "" || config.GiteaOwner == "" || config.GiteaRepo == "" {
		return "", ErrGiteaNotConfigured
	}
	base := strings.TrimRight(config.GiteaURL, "/")
	return fmt.Sprintf("%s/api/v1/repos/%s/%s/contents", base, config.GiteaOwner, config.GiteaRepo), nil
}

func giteaActionsBase(config *db.Config) (string, error) {
	if config.GiteaURL == "" || config.GiteaToken == "" || config.GiteaOwner == "" || config.GiteaRepo == "" {
		return "", ErrGiteaNotConfigured
	}
	base := strings.TrimRight(config.GiteaURL, "/")
	return fmt.Sprintf("%s/api/v1/repos/%s/%s/actions/runs", base, config.GiteaOwner, config.GiteaRepo), nil
}

func giteaBranch(config *db.Config) string {
	if config.GiteaBranch == "" {
		return "main"
	}
	return config.GiteaBranch
}

/** GiteaGetFile fetches a file from the configured repo on the configured
 *  branch and returns its decoded contents alongside the blob SHA needed for
 *  a subsequent update. */
func GiteaGetFile(config *db.Config, path string) ([]byte, string, error) {
	base, err := giteaBase(config)
	if err != nil {
		return nil, "", err
	}
	url := fmt.Sprintf("%s/%s?ref=%s", base, path, giteaBranch(config))

	req, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		return nil, "", err
	}
	req.Header.Set("Authorization", "token "+config.GiteaToken)
	req.Header.Set("Accept", "application/json")

	resp, err := giteaClient.Do(req)
	if err != nil {
		return nil, "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusNotFound {
		return nil, "", ErrGiteaNotFound
	}
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, "", fmt.Errorf("gitea get %s: status %d: %s", path, resp.StatusCode, string(body))
	}

	var out giteaContents
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		return nil, "", err
	}
	if out.Encoding != "base64" {
		return nil, "", fmt.Errorf("gitea get %s: unexpected encoding %q", path, out.Encoding)
	}
	/** Gitea returns base64 with embedded newlines. */
	clean := strings.ReplaceAll(out.Content, "\n", "")
	clean = strings.ReplaceAll(clean, "\r", "")
	data, err := base64.StdEncoding.DecodeString(clean)
	if err != nil {
		return nil, "", err
	}
	return data, out.SHA, nil
}

/** GiteaPutFile creates or updates a file in the repo. When sha is empty the
 *  call creates a new file; when non-empty it updates the existing blob. */
func GiteaPutFile(config *db.Config, path, sha string, content []byte, message, authorName, authorEmail string) error {
	base, err := giteaBase(config)
	if err != nil {
		return err
	}
	url := fmt.Sprintf("%s/%s", base, path)

	body := giteaPutRequest{
		Branch:  giteaBranch(config),
		Message: message,
		Content: base64.StdEncoding.EncodeToString(content),
		SHA:     sha,
	}
	if authorName != "" || authorEmail != "" {
		ident := &giteaIdentity{Name: authorName, Email: authorEmail}
		body.Author = ident
		body.Committer = ident
	}

	buf, err := json.Marshal(body)
	if err != nil {
		return err
	}
	req, err := http.NewRequest(http.MethodPut, url, bytes.NewReader(buf))
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "token "+config.GiteaToken)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")

	resp, err := giteaClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusOK || resp.StatusCode == http.StatusCreated {
		return nil
	}
	respBody, _ := io.ReadAll(resp.Body)
	return fmt.Errorf("gitea put %s: status %d: %s", path, resp.StatusCode, string(respBody))
}

func GiteaDeleteWorkflowRuns(config *db.Config) (int, error) {
	base, err := giteaActionsBase(config)
	if err != nil {
		return 0, err
	}

	deletedCount := 0
	page := 1
	perPage := 100

	for {
		url := fmt.Sprintf("%s?page=%d&limit=%d", base, page, perPage)
		req, err := http.NewRequest(http.MethodGet, url, nil)
		if err != nil {
			return deletedCount, err
		}
		req.Header.Set("Authorization", "token "+config.GiteaToken)
		req.Header.Set("Accept", "application/json")

		resp, err := giteaClient.Do(req)
		if err != nil {
			return deletedCount, err
		}
		body, _ := io.ReadAll(resp.Body)
		resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			return deletedCount, fmt.Errorf("gitea list workflow runs: status %d: %s", resp.StatusCode, string(body))
		}

		runs, totalCount, err := decodeGiteaActionRuns(body)
		if err != nil {
			return deletedCount, err
		}
		if len(runs) == 0 {
			break
		}

		for _, run := range runs {
			deleteReq, err := http.NewRequest(http.MethodDelete, fmt.Sprintf("%s/%d", base, run.ID), nil)
			if err != nil {
				return deletedCount, err
			}
			deleteReq.Header.Set("Authorization", "token "+config.GiteaToken)
			deleteReq.Header.Set("Accept", "application/json")

			deleteResp, err := giteaClient.Do(deleteReq)
			if err != nil {
				return deletedCount, err
			}
			deleteBody, _ := io.ReadAll(deleteResp.Body)
			deleteResp.Body.Close()

			if deleteResp.StatusCode != http.StatusOK && deleteResp.StatusCode != http.StatusNoContent {
				return deletedCount, fmt.Errorf("gitea delete workflow run %d: status %d: %s", run.ID, deleteResp.StatusCode, string(deleteBody))
			}
			deletedCount++
		}

		if totalCount == 0 || page*perPage >= totalCount {
			break
		}
		page++
	}

	return deletedCount, nil
}

func GiteaDispatchWorkflow(config *db.Config, workflowFile string) error {
	if workflowFile == "" {
		return fmt.Errorf("workflow file is required")
	}
	if config.GiteaURL == "" || config.GiteaToken == "" || config.GiteaOwner == "" || config.GiteaRepo == "" {
		return ErrGiteaNotConfigured
	}

	base := strings.TrimRight(config.GiteaURL, "/")
	url := fmt.Sprintf(
		"%s/api/v1/repos/%s/%s/actions/workflows/%s/dispatches",
		base,
		config.GiteaOwner,
		config.GiteaRepo,
		workflowFile,
	)

	body := giteaWorkflowDispatchRequest{Ref: giteaBranch(config)}
	buf, err := json.Marshal(body)
	if err != nil {
		return err
	}

	req, err := http.NewRequest(http.MethodPost, url, bytes.NewReader(buf))
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "token "+config.GiteaToken)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")

	resp, err := giteaClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusOK || resp.StatusCode == http.StatusCreated || resp.StatusCode == http.StatusNoContent || resp.StatusCode == http.StatusAccepted {
		return nil
	}

	respBody, _ := io.ReadAll(resp.Body)
	return fmt.Errorf("gitea dispatch workflow %s: status %d: %s", workflowFile, resp.StatusCode, string(respBody))
}

func decodeGiteaActionRuns(body []byte) ([]giteaActionRun, int, error) {
	var wrapped giteaActionRunsResponse
	if err := json.Unmarshal(body, &wrapped); err == nil && wrapped.WorkflowRuns != nil {
		return wrapped.WorkflowRuns, wrapped.TotalCount, nil
	}

	var bare []giteaActionRun
	if err := json.Unmarshal(body, &bare); err == nil {
		return bare, len(bare), nil
	}

	return nil, 0, fmt.Errorf("gitea workflow runs: unexpected response: %s", string(body))
}
