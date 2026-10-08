package operations

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"sync"
	"time"
)

/** InstallerStatus represents the current state of an installation run. */
type InstallerStatus string

const (
	StatusIdle    InstallerStatus = "idle"
	StatusRunning InstallerStatus = "running"
	StatusSuccess InstallerStatus = "success"
	StatusError   InstallerStatus = "error"
)

/** RunRecord tracks a single installation execution. */
type RunRecord struct {
	Status     InstallerStatus `json:"status"`
	StartedAt  time.Time       `json:"started_at"`
	FinishedAt *time.Time      `json:"finished_at,omitempty"`
	Output     string          `json:"output,omitempty"`
	Error      string          `json:"error,omitempty"`
	Version    string          `json:"version,omitempty"`
}

var (
	runs   = loadRuns()
	runsMu sync.RWMutex
)

var installerStatePaths = []string{
	"/etc/admin/installers_state.json",
	filepath.Join("/home/opc/operations", "installers_state.json"),
}

/** GetRun returns the current run record for an installer, or nil. */
func GetRun(name string) *RunRecord {
	runsMu.RLock()
	defer runsMu.RUnlock()
	return cloneRun(runs[name])
}

/** setRun updates the run record for an installer. */
func setRun(name string, rec *RunRecord) {
	runsMu.Lock()
	defer runsMu.Unlock()
	runs[name] = cloneRun(rec)
	persistRunsLocked()
}

/** InstallerDefinition describes a supported installer. */
type InstallerDefinition struct {
	Name           string     `json:"name"`
	LabelKey       string     `json:"labelKey"`
	DescriptionKey string     `json:"descriptionKey"`
	Inputs         []InputDef `json:"inputs,omitempty"`
}

type InputDef struct {
	Name     string `json:"name"`
	Label    string `json:"label"`
	Type     string `json:"type"`
	Required bool   `json:"required"`
	Default  string `json:"default,omitempty"`
}

/** AvailableInstallers returns the list of supported installers. */
func AvailableInstallers() []InstallerDefinition {
	return []InstallerDefinition{
		{
			Name:           "GITEA_GO_INSTALL",
			LabelKey:       "installer_go_label",
			DescriptionKey: "installer_go_description",
			Inputs: []InputDef{
				{Name: "go_version", Label: "Go Version", Type: "string", Required: false, Default: "1.26.4"},
			},
		},
		{
			Name:           "GITEA_NODEJS_INSTALL",
			LabelKey:       "installer_node_label",
			DescriptionKey: "installer_node_description",
			Inputs: []InputDef{
				{Name: "nodejs_version", Label: "Node.js Version", Type: "string", Required: false, Default: "22.x"},
			},
		},
		{
			Name:           "GITEA_TERRAFORM_INSTALL",
			LabelKey:       "installer_terraform_label",
			DescriptionKey: "installer_terraform_description",
			Inputs: []InputDef{
				{Name: "terraform_version", Label: "Terraform Version", Type: "string", Required: false, Default: "1.15.8"},
			},
		},
	}
}

/** FindInstaller returns the installer definition by name, or nil. */
func FindInstaller(name string) *InstallerDefinition {
	for i := range AvailableInstallers() {
		if AvailableInstallers()[i].Name == name {
			return &AvailableInstallers()[i]
		}
	}
	return nil
}

/** TriggerInstall starts an installation in the background and returns immediately. */
func TriggerInstall(name string, inputs map[string]string) (*RunRecord, error) {
	def := FindInstaller(name)
	if def == nil {
		return nil, fmt.Errorf("installer not found")
	}

	rec := &RunRecord{
		Status:    StatusRunning,
		StartedAt: time.Now(),
		Version:   requestedVersion(name, inputs),
	}
	setRun(name, rec)

	go func() {
		switch name {
		case "GITEA_GO_INSTALL":
			runGoInstall(rec, inputs)
		case "GITEA_NODEJS_INSTALL":
			runNodeJSInstall(rec, inputs)
		case "GITEA_TERRAFORM_INSTALL":
			runTerraformInstall(rec, inputs)
		default:
			rec.Status = StatusError
			rec.Error = "unsupported installer"
			now := time.Now()
			rec.FinishedAt = &now
			setRun(name, rec)
		}
	}()

	return rec, nil
}

func GetInstallerState(name string) (map[string]any, error) {
	def := FindInstaller(name)
	if def == nil {
		return nil, fmt.Errorf("installer not found")
	}

	entry := map[string]any{
		"name":           def.Name,
		"labelKey":       def.LabelKey,
		"descriptionKey": def.DescriptionKey,
		"inputs":         def.Inputs,
		"status":         StatusIdle,
	}

	run := GetRun(name)
	if run != nil {
		entry["status"] = run.Status
		if run.Version != "" {
			entry["version"] = run.Version
		}
		if run.Error != "" {
			entry["error"] = run.Error
		}
		if run.Output != "" {
			entry["output"] = run.Output
		}
		if !run.StartedAt.IsZero() {
			startedAt := run.StartedAt.UTC().Format(time.RFC3339)
			entry["started_at"] = startedAt
			entry["startedAt"] = startedAt
		}
		if run.FinishedAt != nil {
			finishedAt := run.FinishedAt.UTC().Format(time.RFC3339)
			entry["finished_at"] = finishedAt
			entry["finishedAt"] = finishedAt
			entry["latestUpdate"] = finishedAt
		} else if !run.StartedAt.IsZero() {
			startedAt := run.StartedAt.UTC().Format(time.RFC3339)
			entry["latestUpdate"] = startedAt
		}
	}

	return entry, nil
}

func runGoInstall(rec *RunRecord, inputs map[string]string) {
	version := getInput(inputs, "go_version", "1.26.4")
	installDir := "/usr/local"
	arch := "arm64"
	url := fmt.Sprintf("https://dl.google.com/go/go%s.linux-%s.tar.gz", version, arch)

	var out bytes.Buffer

	cmd := exec.Command("bash", "-c", fmt.Sprintf(`
		set -e
		echo "[INFO] Go Installation/Update"
		echo "[INFO] Version: %s"
		echo "[INFO] Architecture: %s"
		echo "[INFO] Install Directory: %s"

		if command -v go &> /dev/null; then
			CURRENT_VERSION=$(go version)
			echo "[INFO] Current installation: ${CURRENT_VERSION}"
		else
			echo "[INFO] Go is not currently installed"
		fi

		if [ -d "%s/go" ]; then
			echo "[INFO] Removing old Go installation..."
			sudo rm -rf "%s/go"
			echo "[OK] Old installation removed"
		else
			echo "[INFO] No previous installation found"
		fi

		echo "[INFO] Downloading and installing Go %s..."
		GO_FILE="/tmp/go%s.linux-%s.tar.gz"
		wget --timeout=600 -O "$GO_FILE" "%s"
		if [ ! -f "$GO_FILE" ] || [ ! -s "$GO_FILE" ]; then
			echo "[ERROR] Download failed or file is empty"
			exit 1
		fi
		sudo tar -C %s -xzf "$GO_FILE"
		rm "$GO_FILE"
		echo "[OK] Installation successful"

		echo "[INFO] Verifying installation..."
		if [ -f "%s/go/bin/go" ]; then
			NEW_VERSION=$(%s/go/bin/go version)
			echo "[OK] Installed: ${NEW_VERSION}"
		else
			echo "[ERROR] Go binary not found after installation"
			exit 1
		fi

		echo "[INFO] Checking PATH configuration..."
		if echo "$PATH" | grep -q "%s/go/bin"; then
			echo "[OK] Go is already in PATH"
		else
			echo "[WARN] Go is not in PATH"
		fi

		echo "Installation Complete!"
		NEW_VERSION=$(%s/go/bin/go version)
		echo "[INFO] Go version: ${NEW_VERSION}"
		echo "[INFO] Go binary: %s/go/bin/go"
	`, version, arch, installDir, installDir, installDir, version, version, arch, url, installDir, installDir, installDir, installDir, installDir, installDir))

	cmd.Stdout = &out
	cmd.Stderr = &out

	if err := cmd.Run(); err != nil {
		rec.Status = StatusError
		rec.Error = err.Error()
	} else {
		rec.Status = StatusSuccess
		rec.Version = version
	}
	rec.Output = sanitizeInstallerOutput(out.String())
	now := time.Now()
	rec.FinishedAt = &now
	setRun("GITEA_GO_INSTALL", rec)
}

func runNodeJSInstall(rec *RunRecord, inputs map[string]string) {
	version, err := resolveNodeVersion(getInput(inputs, "nodejs_version", "22.x"))
	if err != nil {
		rec.Status = StatusError
		rec.Error = err.Error()
		rec.Output = err.Error()
		now := time.Now()
		rec.FinishedAt = &now
		setRun("GITEA_NODEJS_INSTALL", rec)
		return
	}

	rec.Version = version
	installDir := "/usr/local"
	installRoot := "/usr/local/lib/nodejs"
	arch := "arm64"
	url := fmt.Sprintf("https://nodejs.org/dist/%s/node-%s-linux-%s.tar.xz", version, version, arch)

	var out bytes.Buffer

	cmd := exec.Command("bash", "-c", fmt.Sprintf(`
		set -e
		echo "[INFO] Node.js Installation/Update"
		echo "[INFO] Version: %s"
		echo "[INFO] Architecture: %s"
		echo "[INFO] Install Directory: %s"
		echo "[INFO] Install Root: %s"

		if command -v node &> /dev/null; then
			CURRENT_VERSION=$(node -v)
			CURRENT_NPM=$(npm -v)
			echo "[INFO] Current Node.js: ${CURRENT_VERSION}"
			echo "[INFO] Current npm: ${CURRENT_NPM}"
		else
			echo "[INFO] Node.js is not currently installed"
		fi

		echo "[INFO] Downloading Node.js %s..."
		NODEJS_FILE="/tmp/node-%s-linux-%s.tar.xz"
		STAGING_DIR="/tmp/nodejs-install-%s-$$"
		TARGET_DIR="%s/%s"
		CURRENT_LINK="%s/current"
		wget --timeout=600 -O "$NODEJS_FILE" "%s"
		if [ ! -f "$NODEJS_FILE" ] || [ ! -s "$NODEJS_FILE" ]; then
			echo "[ERROR] Download failed or file is empty"
			exit 1
		fi

		echo "[INFO] Extracting into staging directory..."
		rm -rf "$STAGING_DIR"
		mkdir -p "$STAGING_DIR"
		tar -xJf "$NODEJS_FILE" -C "$STAGING_DIR"
		EXTRACTED_DIR="$STAGING_DIR/node-%s-linux-%s"
		if [ ! -x "$EXTRACTED_DIR/bin/node" ] || [ ! -x "$EXTRACTED_DIR/bin/npm" ] || [ ! -x "$EXTRACTED_DIR/bin/npx" ]; then
			echo "[ERROR] Extracted Node.js archive is missing expected binaries"
			exit 1
		fi

		echo "[INFO] Verifying staged Node.js binaries..."
		STAGED_NODE_VERSION=$($EXTRACTED_DIR/bin/node -v)
		STAGED_NPM_VERSION=$($EXTRACTED_DIR/bin/npm -v)
		echo "[OK] Staged Node.js: ${STAGED_NODE_VERSION}"
		echo "[OK] Staged npm: ${STAGED_NPM_VERSION}"

		echo "[INFO] Promoting staged Node.js installation..."
		sudo mkdir -p "%s" "%s/bin"
		sudo rm -rf "$TARGET_DIR"
		sudo mv "$EXTRACTED_DIR" "$TARGET_DIR"
		sudo ln -sfn "$TARGET_DIR" "$CURRENT_LINK"
		sudo ln -sfn "$CURRENT_LINK/bin/node" %s/bin/node
		sudo ln -sfn "$CURRENT_LINK/bin/npm" %s/bin/npm
		sudo ln -sfn "$CURRENT_LINK/bin/npx" %s/bin/npx
		echo "[INFO] Cleaning up temporary files..."
		rm "$NODEJS_FILE"
		rm -rf "$STAGING_DIR"
		echo "[OK] Installation successful"

		echo "[INFO] Creating symbolic links..."
		sudo ln -sfn %s/bin/node /usr/bin/node
		sudo ln -sfn %s/bin/npm /usr/bin/npm
		sudo ln -sfn %s/bin/npx /usr/bin/npx
		echo "[OK] Symbolic links created"

		echo "[INFO] Verifying installation..."
		if command -v node &> /dev/null && command -v npm &> /dev/null; then
			NODE_VERSION=$(node -v)
			NPM_VERSION=$(npm -v)
			echo "[OK] Node.js: ${NODE_VERSION}"
			echo "[OK] npm: ${NPM_VERSION}"
		else
			echo "[ERROR] Node.js or npm not found after installation"
			exit 1
		fi

		echo "Installation Complete!"
		echo "[INFO] Node.js version: $(node -v)"
		echo "[INFO] npm version: $(npm -v)"
		echo "[INFO] npx version: $(npx -v)"
		echo "[INFO] Node.js binary: %s/bin/node"
		echo "[INFO] npm binary: %s/bin/npm"
	`, version, arch, installDir, installRoot, version, version, arch, version, installRoot, version, installRoot, url, version, arch, installRoot, installDir, installDir, installDir, installDir, installDir, installDir, installDir, installDir, installDir))

	cmd.Stdout = &out
	cmd.Stderr = &out

	if err := cmd.Run(); err != nil {
		rec.Status = StatusError
		rec.Error = installerCommandError(err, sanitizeInstallerOutput(out.String()))
	} else {
		rec.Status = StatusSuccess
		rec.Version = version
	}
	rec.Output = sanitizeInstallerOutput(out.String())
	now := time.Now()
	rec.FinishedAt = &now
	setRun("GITEA_NODEJS_INSTALL", rec)
}

func runTerraformInstall(rec *RunRecord, inputs map[string]string) {
	version := getInput(inputs, "terraform_version", "1.15.8")
	trimmed := strings.TrimSpace(version)
	if trimmed == "" {
		trimmed = "1.15.8"
	}

	var out bytes.Buffer
	cmd := exec.Command("bash", "-c", fmt.Sprintf(`
		set -e
		echo "[INFO] Terraform Installation/Update"
		echo "[INFO] Version: %s"
		if command -v terraform &> /dev/null; then
			CURRENT_VERSION=$(terraform version | head -n 1)
			echo "[INFO] Current installation: ${CURRENT_VERSION}"
		else
			echo "[INFO] Terraform is not currently installed"
		fi

		echo "[INFO] Ensuring HashiCorp repository is configured"
		sudo yum install -y yum-utils >/dev/null 2>&1 || true
		sudo yum-config-manager --add-repo https://rpm.releases.hashicorp.com/RHEL/hashicorp.repo >/dev/null 2>&1 || true
		sudo yum clean all >/dev/null 2>&1 || true

		echo "[INFO] Installing Terraform %s from HashiCorp yum repository"
		sudo yum install -y terraform-%s >/dev/null 2>&1
		if ! command -v terraform &> /dev/null; then
			echo "[ERROR] Terraform binary not found after installation"
			exit 1
		fi

		echo "[OK] Installation successful"
		terraform version
	`, trimmed, trimmed, trimmed))

	cmd.Stdout = &out
	cmd.Stderr = &out

	if err := cmd.Run(); err != nil {
		rec.Status = StatusError
		rec.Error = installerCommandError(err, sanitizeInstallerOutput(out.String()))
	} else {
		rec.Status = StatusSuccess
		rec.Version = trimmed
	}
	rec.Output = sanitizeInstallerOutput(out.String())
	now := time.Now()
	rec.FinishedAt = &now
	setRun("GITEA_TERRAFORM_INSTALL", rec)
}

func getInput(inputs map[string]string, key, fallback string) string {
	if v, ok := inputs[key]; ok && v != "" {
		return v
	}
	return fallback
}

func requestedVersion(name string, inputs map[string]string) string {
	switch name {
	case "GITEA_GO_INSTALL":
		return getInput(inputs, "go_version", "1.26.4")
	case "GITEA_NODEJS_INSTALL":
		version, err := resolveNodeVersion(getInput(inputs, "nodejs_version", "22.x"))
		if err == nil {
			return version
		}
		return getInput(inputs, "nodejs_version", "22.x")
	case "GITEA_TERRAFORM_INSTALL":
		return getInput(inputs, "terraform_version", "1.15.8")
	default:
		return ""
	}
}

func resolveNodeVersion(input string) (string, error) {
	trimmed := strings.TrimSpace(input)
	if trimmed == "" {
		trimmed = "22.x"
	}

	normalized := strings.TrimPrefix(trimmed, "v")
	if isExactSemver(normalized) {
		return "v" + normalized, nil
	}

	major := ""
	switch {
	case strings.HasSuffix(normalized, ".x"):
		major = strings.TrimSuffix(normalized, ".x")
	case isDigitsOnly(normalized):
		major = normalized
	}

	if major == "" {
		return "", fmt.Errorf("invalid Node.js version %q; use values like 22.x or 22.17.1", input)
	}

	resp, err := http.Get("https://nodejs.org/dist/index.json")
	if err != nil {
		return "", fmt.Errorf("failed to resolve Node.js %s: %w", trimmed, err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(io.LimitReader(resp.Body, 512))
		return "", fmt.Errorf("failed to resolve Node.js %s: nodejs.org returned %d %s", trimmed, resp.StatusCode, strings.TrimSpace(string(body)))
	}

	var releases []struct {
		Version string `json:"version"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&releases); err != nil {
		return "", fmt.Errorf("failed to parse Node.js releases: %w", err)
	}

	prefix := "v" + major + "."
	for _, release := range releases {
		if strings.HasPrefix(release.Version, prefix) {
			return release.Version, nil
		}
	}

	return "", fmt.Errorf("no Node.js release found for %s", trimmed)
}

func sanitizeInstallerOutput(output string) string {
	trimmed := strings.TrimSpace(output)
	if trimmed == "" {
		return ""
	}

	var filtered []string
	for _, rawLine := range strings.Split(trimmed, "\n") {
		line := strings.TrimSpace(rawLine)
		if line == "" {
			continue
		}
		if isInstallerNoiseLine(line) {
			continue
		}
		filtered = append(filtered, line)
	}

	return strings.Join(filtered, "\n")
}

func isInstallerNoiseLine(line string) bool {
	if strings.HasPrefix(line, "--") {
		return true
	}
	if strings.HasPrefix(line, "Length:") || strings.HasPrefix(line, "Saving to:") {
		return true
	}
	if strings.HasPrefix(line, "HTTP") || strings.HasPrefix(line, "Reusing") || strings.HasPrefix(line, "Connecting to") {
		return true
	}
	if strings.Contains(line, "100%") || strings.Contains(line, "%") && (strings.Contains(line, "K") || strings.Contains(line, "M") || strings.Contains(line, "B")) {
		return true
	}
	if strings.HasPrefix(line, "[") && strings.Contains(line, "]") {
		return false
	}
	if strings.Contains(line, "Installation Complete!") {
		return false
	}
	if strings.Contains(strings.ToLower(line), "error") || strings.Contains(strings.ToLower(line), "failed") || strings.Contains(strings.ToLower(line), "not found") || strings.Contains(strings.ToLower(line), "missing") {
		return false
	}
	return false
}

func installerCommandError(err error, output string) string {
	trimmed := strings.TrimSpace(output)
	if trimmed == "" {
		return err.Error()
	}

	lines := strings.Split(trimmed, "\n")
	for i := len(lines) - 1; i >= 0; i-- {
		line := strings.TrimSpace(lines[i])
		if line == "" {
			continue
		}
		if strings.Contains(line, "[ERROR]") {
			return line
		}
	}

	return lines[len(lines)-1]
}

func isExactSemver(value string) bool {
	parts := strings.Split(value, ".")
	if len(parts) != 3 {
		return false
	}

	for _, part := range parts {
		if !isDigitsOnly(part) {
			return false
		}
	}

	return true
}

func isDigitsOnly(value string) bool {
	if value == "" {
		return false
	}

	for _, ch := range value {
		if ch < '0' || ch > '9' {
			return false
		}
	}

	return true
}

func cloneRun(rec *RunRecord) *RunRecord {
	if rec == nil {
		return nil
	}
	cloned := *rec
	if rec.FinishedAt != nil {
		finished := *rec.FinishedAt
		cloned.FinishedAt = &finished
	}
	return &cloned
}

func loadRuns() map[string]*RunRecord {
	for _, path := range installerStatePaths {
		data, err := os.ReadFile(path)
		if err != nil {
			continue
		}

		loaded := map[string]*RunRecord{}
		if err := json.Unmarshal(data, &loaded); err != nil {
			continue
		}

		for name, rec := range loaded {
			if rec != nil && rec.Status == StatusRunning {
				rec.Status = StatusError
				rec.Error = "interrupted before completion"
				now := time.Now().UTC()
				rec.FinishedAt = &now
				loaded[name] = rec
			}
		}
		return loaded
	}

	return make(map[string]*RunRecord)
}

func persistRunsLocked() {
	data, err := json.MarshalIndent(runs, "", "  ")
	if err != nil {
		return
	}

	for _, path := range installerStatePaths {
		dir := filepath.Dir(path)
		if err := os.MkdirAll(dir, 0o755); err != nil {
			continue
		}
		if err := os.WriteFile(path, data, 0o644); err == nil {
			return
		}
	}
}

/** ListInstallers returns all supported installers with their current run state. */
func ListInstallers() []map[string]any {
	defs := AvailableInstallers()
	out := make([]map[string]any, 0, len(defs))
	for _, d := range defs {
		entry, err := GetInstallerState(d.Name)
		if err == nil {
			out = append(out, entry)
		}
	}
	return out
}
