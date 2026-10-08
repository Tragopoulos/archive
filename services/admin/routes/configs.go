package routes

import (
	"admin/db"
	"admin/helpers"
	"bytes"
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"
)

/** configEntry maps a (app, env) pair to its target VM and file path. */
type configEntry struct {
	App      string
	Env      string
	Host     string
	Hosts    []string
	ReadHost string
	Path     string
}

var configRegistry = []configEntry{
	{App: "admin", Env: "ops", Host: "AREA51", Path: "/etc/admin/config.json"},
	{App: "core", Env: "test", Host: "AREA51", Path: "/etc/core/config.json"},
	{App: "core", Env: "prod", Host: "AREA52-54", Hosts: []string{"AREA52", "AREA53", "AREA54"}, ReadHost: "AREA52", Path: "/etc/core/config.json"},
	{App: "logger", Env: "test", Host: "AREA51", Path: "/etc/logger/config.json"},
	{App: "logger", Env: "prod", Host: "AREA52-54", Hosts: []string{"AREA52", "AREA53", "AREA54"}, ReadHost: "AREA52", Path: "/etc/logger/config.json"},
	{App: "mailer", Env: "test", Host: "AREA51", Path: "/etc/mailer/config.json"},
	{App: "mailer", Env: "prod", Host: "AREA52-54", Hosts: []string{"AREA52", "AREA53", "AREA54"}, ReadHost: "AREA52", Path: "/etc/mailer/config.json"},
}

var configWorkflows = map[string]string{
	"admin/ops":   "MS_ADMIN_OPS.yml",
	"core/test":   "MS_CORE_TEST.yml",
	"logger/test": "MS_LOGGER_TEST.yml",
	"mailer/test": "MS_MAILER_TEST.yml",
}

type prodDeploySpec struct {
	BinaryName string
}

type serviceMeta struct {
	Description string
	BinaryName  string
}

var serviceCatalog = map[string]serviceMeta{
	"admin": {
		Description: "Administration service for operations platform",
		BinaryName:  "ADMIN",
	},
	"core": {
		Description: "Core service for operations platform",
		BinaryName:  "CORE",
	},
	"logger": {
		Description: "Centralized logging service",
		BinaryName:  "LOGGER",
	},
	"mailer": {
		Description: "Asynchronous email delivery service",
		BinaryName:  "MAILER",
	},
}

var prodDeploySpecs = map[string]prodDeploySpec{
	"core": {
		BinaryName: "CORE",
	},
	"logger": {
		BinaryName: "LOGGER",
	},
	"mailer": {
		BinaryName: "MAILER",
	},
}

func configWorkflow(entry *configEntry) (string, bool) {
	workflow, ok := configWorkflows[entry.App+"/"+entry.Env]
	if !ok {
		return "", false
	}
	return workflow, true
}

func shouldAutoTriggerDeployment(entry *configEntry) bool {
	_ = entry
	return false
}

func buildDeploymentInfo(entry *configEntry, latestUpdate time.Time, status string) map[string]any {
	binaryPath := ""
	if meta, ok := serviceCatalog[entry.App]; ok {
		binaryPath = "/usr/local/bin/" + meta.BinaryName
	}

	description := fmt.Sprintf("%s service", strings.ToUpper(entry.App))
	if meta, ok := serviceCatalog[entry.App]; ok {
		description = meta.Description
	}

	return map[string]any{
		"description":                 description,
		"host":                        configHostLabel(entry),
		"status":                      status,
		"deployment_status":           status,
		"latest_update":               latestUpdate.UTC().Format(time.RFC3339),
		"latest_update_binary":        latestUpdate.UTC().Format(time.RFC3339),
		"latest_update_configuration": latestUpdate.UTC().Format(time.RFC3339),
		"configuration_path":          entry.Path,
		"binary_path":                 binaryPath,
	}
}

func serviceBinaryPath(entry *configEntry) (string, bool) {
	meta, ok := serviceCatalog[entry.App]
	if !ok || meta.BinaryName == "" {
		return "", false
	}
	return "/usr/local/bin/" + meta.BinaryName, true
}

func setDeploymentStatus(info map[string]any, status string) {
	if info == nil {
		return
	}
	info["status"] = status
	info["deployment_status"] = status
}

func triggerConfigDeployment(config *db.Config, entry *configEntry) error {
	workflowFile, ok := configWorkflow(entry)
	if !ok {
		return fmt.Errorf("no workflow configured for %s/%s", entry.App, entry.Env)
	}
	return helpers.GiteaDispatchWorkflow(config, workflowFile)
}

func deployConfigProduction(ctx context.Context, entry *configEntry) error {
	fmt.Printf("DEBUG: deployConfigProduction called for %s/%s\n", entry.App, entry.Env)
	spec, ok := prodDeploySpecs[entry.App]
	if !ok {
		return fmt.Errorf("production deploy is not supported for %s", entry.App)
	}
	fmt.Printf("DEBUG: spec found for %s, binary: %s\n", entry.App, spec.BinaryName)

	hosts := configHosts(entry)
	if len(hosts) == 0 {
		return fmt.Errorf("no production hosts configured for %s", entry.App)
	}
	fmt.Printf("DEBUG: hosts: %v\n", hosts)

	localBinary := "/usr/local/bin/" + spec.BinaryName
	if _, err := os.Stat(localBinary); err != nil {
		return fmt.Errorf("binary not found: %s", localBinary)
	}
	fmt.Printf("DEBUG: binary exists at %s\n", localBinary)

	remoteTmp := "/tmp/" + spec.BinaryName + ".new"
	remoteBinary := "/usr/local/bin/" + spec.BinaryName

	for _, host := range hosts {
		fmt.Printf("DEBUG: deploying to host %s\n", host)
		if output, err := runCommand(ctx, "scp", localBinary, fmt.Sprintf("opc@%s:%s", host, remoteTmp)); err != nil {
			return fmt.Errorf("copy binary to %s: %w: %s", host, err, strings.TrimSpace(string(output)))
		}
		fmt.Printf("DEBUG: SCP succeeded for %s\n", host)

		installCmd := fmt.Sprintf(`set -e
sudo -n mv %s %s
sudo -n chmod +x %s
sudo -n restorecon -v %s || true
sudo -n systemctl restart %s || true`,
			shellQuote(remoteTmp),
			shellQuote(remoteBinary),
			shellQuote(remoteBinary),
			shellQuote(remoteBinary),
			spec.BinaryName,
		)
		fmt.Printf("DEBUG: running install command on %s\n", host)
		fmt.Printf("DEBUG: install command:\n%s\n", installCmd)
		output, err := runCommand(ctx, "ssh", "opc@"+host, installCmd)
		if err != nil {
			fmt.Printf("DEBUG: install failed on %s: %v\nOutput: %s\n", host, err, strings.TrimSpace(string(output)))
			return fmt.Errorf("install on %s: %w: %s", host, err, strings.TrimSpace(string(output)))
		}
		fmt.Printf("DEBUG: install command output:\n%s\n", strings.TrimSpace(string(output)))
		fmt.Printf("DEBUG: install succeeded on %s\n", host)

		// Verify service file was created
		if checkOutput, err := runCommand(ctx, "ssh", "opc@"+host, "[ -f /etc/systemd/system/"+spec.BinaryName+".service ] && echo 'SERVICE_FILE_EXISTS' || echo 'SERVICE_FILE_MISSING'"); err != nil {
			fmt.Printf("DEBUG: service file check failed on %s: %v\n", host, err)
		} else {
			fmt.Printf("DEBUG: service file status on %s: %s\n", host, strings.TrimSpace(string(checkOutput)))
		}
	}

	fmt.Printf("DEBUG: deployConfigProduction completed successfully for %s/%s\n", entry.App, entry.Env)
	return nil
}

func findConfigEntry(app, env string) *configEntry {
	for i := range configRegistry {
		if configRegistry[i].App == app && configRegistry[i].Env == env {
			return &configRegistry[i]
		}
	}
	return nil
}

var errConfigNotFound = errors.New("config file not found")

func runCommand(ctx context.Context, name string, args ...string) ([]byte, error) {
	cmd := exec.CommandContext(ctx, name, args...)
	return cmd.CombinedOutput()
}

func shellQuote(value string) string {
	return "'" + strings.ReplaceAll(value, "'", "'\\''") + "'"
}

func configHosts(entry *configEntry) []string {
	if len(entry.Hosts) > 0 {
		return entry.Hosts
	}
	if entry.Host != "" {
		return []string{entry.Host}
	}
	return nil
}

func configReadHosts(entry *configEntry) []string {
	if entry.ReadHost != "" {
		return []string{entry.ReadHost}
	}
	return configHosts(entry)
}

func configHostLabel(entry *configEntry) string {
	if entry.Host != "" {
		return entry.Host
	}
	if len(entry.Hosts) > 0 {
		return strings.Join(entry.Hosts, ", ")
	}
	return ""
}

func configServiceName(entry *configEntry) string {
	return strings.ToUpper(entry.App)
}

func shouldRestartServiceAfterConfigWrite(entry *configEntry) bool {
	// Restarting ADMIN while it is serving this request can drop the response
	// after the config write succeeds, which appears as a failed deploy in UI.
	if entry.App == "admin" && entry.Env == "ops" {
		return false
	}
	return true
}

func restartConfigService(ctx context.Context, host, serviceName string) error {
	if host == "" {
		output, err := runCommand(ctx, "sudo", "-n", "systemctl", "restart", serviceName)
		if err != nil {
			return fmt.Errorf("restart %s: %w: %s", serviceName, err, strings.TrimSpace(string(output)))
		}
		return nil
	}

	output, err := runCommand(ctx, "ssh", "opc@"+host, fmt.Sprintf("sudo -n systemctl restart %s", shellQuote(serviceName)))
	if err != nil {
		return fmt.Errorf("restart %s on %s: %w: %s", serviceName, host, err, strings.TrimSpace(string(output)))
	}
	return nil
}

func restartServiceForEntry(ctx context.Context, entry *configEntry) error {
	hosts := configHosts(entry)
	serviceName := configServiceName(entry)

	if len(hosts) == 0 || (len(hosts) == 1 && hosts[0] == "AREA51") {
		return restartConfigService(ctx, "", serviceName)
	}

	for _, host := range hosts {
		if err := restartConfigService(ctx, host, serviceName); err != nil {
			return err
		}
	}

	return nil
}

func promoteCoreToProd(ctx context.Context) error {
	spec, ok := prodDeploySpecs["core"]
	if !ok {
		return fmt.Errorf("production deploy is not supported for core")
	}

	hosts := []string{"AREA52", "AREA53", "AREA54"}
	localBinary := "/tmp/" + spec.BinaryName + ".new"
	remoteTmp := "/tmp/" + spec.BinaryName + ".new"
	remoteBinary := "/usr/local/bin/" + spec.BinaryName
	serviceName := spec.BinaryName

	if output, err := runCommand(ctx, "cp", "/usr/local/bin/"+serviceName, localBinary); err != nil {
		return fmt.Errorf("copy binary: %w: %s", err, strings.TrimSpace(string(output)))
	}

	configData, err := os.ReadFile("/etc/core/config.json")
	if err != nil {
		return fmt.Errorf("read core config: %w", err)
	}

	configTmp, err := os.CreateTemp("", "core-config-*.json")
	if err != nil {
		return fmt.Errorf("create config temp file: %w", err)
	}
	defer os.Remove(configTmp.Name())
	if _, err := configTmp.Write(configData); err != nil {
		configTmp.Close()
		return fmt.Errorf("write config temp file: %w", err)
	}
	configTmp.Close()

	var deployed []string
	for _, host := range hosts {
		if output, err := runCommand(ctx, "scp", localBinary, fmt.Sprintf("opc@%s:%s", host, remoteTmp)); err != nil {
			return fmt.Errorf("copy binary to %s: %w: %s", host, err, strings.TrimSpace(string(output)))
		}

		if output, err := runCommand(ctx, "scp", configTmp.Name(), fmt.Sprintf("opc@%s:/etc/core/config.json", host)); err != nil {
			return fmt.Errorf("copy config to %s: %w: %s", host, err, strings.TrimSpace(string(output)))
		}

		unitFile := fmt.Sprintf(`[Unit]
Description=Core Service
After=network.target

[Service]
Type=simple
User=opc
WorkingDirectory=/home/opc
ExecStart=%s
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target`, remoteBinary)

		installCmd := fmt.Sprintf(`set -e
SERVICE_FILE="/etc/systemd/system/%s.service"
if [ ! -f "$SERVICE_FILE" ]; then
  echo "Service file not found, installing..."
  printf %%b %s | sudo -n tee "$SERVICE_FILE" > /dev/null
  sudo -n systemctl daemon-reload
  sudo -n systemctl enable %s
fi
if [ -f %s ]; then
  sudo -n cp %s %s.bak
fi
sudo -n mv %s %s
sudo -n chmod +x %s
sudo -n restorecon -v %s || true
sudo -n systemctl restart %s || true`,
			serviceName,
			shellQuote(unitFile),
			serviceName,
			shellQuote(remoteBinary),
			shellQuote(remoteBinary),
			shellQuote(remoteBinary),
			shellQuote(remoteTmp),
			shellQuote(remoteBinary),
			shellQuote(remoteBinary),
			shellQuote(remoteBinary),
			serviceName,
		)

		output, err := runCommand(ctx, "ssh", "opc@"+host, installCmd)
		if err != nil {
			fmt.Printf("promote install failed on %s: %v\nOutput: %s\n", host, err, strings.TrimSpace(string(output)))
			for _, rollbackHost := range deployed {
				if rbOut, rbErr := rollbackCoreOnHost(ctx, rollbackHost, serviceName); rbErr != nil {
					fmt.Printf("promote rollback failed on %s: %v\nOutput: %s\n", rollbackHost, rbErr, strings.TrimSpace(string(rbOut)))
				}
			}
			return fmt.Errorf("install on %s: %w: %s", host, err, strings.TrimSpace(string(output)))
		}

		if err := waitForServiceActive(ctx, host, serviceName); err != nil {
			fmt.Printf("promote health check failed on %s: %v\n", host, err)
			if rbOut, rbErr := rollbackCoreOnHost(ctx, host, serviceName); rbErr != nil {
				fmt.Printf("promote rollback failed on %s: %v\nOutput: %s\n", host, rbErr, strings.TrimSpace(string(rbOut)))
			}
			for _, rollbackHost := range deployed {
				if rbOut, rbErr := rollbackCoreOnHost(ctx, rollbackHost, serviceName); rbErr != nil {
					fmt.Printf("promote rollback failed on %s: %v\nOutput: %s\n", rollbackHost, rbErr, strings.TrimSpace(string(rbOut)))
				}
			}
			return fmt.Errorf("service not active on %s: %w", host, err)
		}

		deployed = append(deployed, host)
	}

	return nil
}

func rollbackCoreProd(ctx context.Context) error {
	spec, ok := prodDeploySpecs["core"]
	if !ok {
		return fmt.Errorf("production rollback is not supported for core")
	}

	hosts := []string{"AREA52", "AREA53", "AREA54"}
	serviceName := spec.BinaryName

	for _, host := range hosts {
		if rbOut, rbErr := rollbackCoreOnHost(ctx, host, serviceName); rbErr != nil {
			return fmt.Errorf("rollback on %s: %w: %s", host, rbErr, strings.TrimSpace(string(rbOut)))
		}
		if err := waitForServiceActive(ctx, host, serviceName); err != nil {
			return fmt.Errorf("service not active on %s after rollback: %w", host, err)
		}
	}

	return nil
}

func rollbackCoreOnHost(ctx context.Context, host, serviceName string) ([]byte, error) {
	rollbackCmd := fmt.Sprintf(`set -e
if [ -f /usr/local/bin/%s.bak ]; then
  sudo -n mv /usr/local/bin/%s.bak /usr/local/bin/%s
  sudo -n chmod +x /usr/local/bin/%s
  sudo -n systemctl restart %s || true
  sudo -n systemctl is-active %s
else
  echo "NO_BACKUP_FOUND"
  exit 1
fi`,
		serviceName, serviceName, serviceName, serviceName, serviceName, serviceName,
	)

	return runCommand(ctx, "ssh", "opc@"+host, rollbackCmd)
}

func waitForServiceActive(ctx context.Context, host, serviceName string) error {
	for i := 0; i < 10; i++ {
		_, err := runCommand(ctx, "ssh", "opc@"+host, "sudo -n systemctl is-active --quiet "+serviceName)
		if err == nil {
			return nil
		}
		time.Sleep(2 * time.Second)
	}

	statusOutput, _ := runCommand(ctx, "ssh", "opc@"+host, "sudo -n systemctl status "+serviceName+" --no-pager || true")
	logsOutput, _ := runCommand(ctx, "ssh", "opc@"+host, "sudo -n journalctl -u "+serviceName+" -n 30 --no-pager || true")
	return fmt.Errorf("service did not become active in time\nStatus: %s\nLogs: %s", strings.TrimSpace(string(statusOutput)), strings.TrimSpace(string(logsOutput)))
}

func readConfigFile(ctx context.Context, entry *configEntry, overrideHost string) ([]byte, error) {
	hosts := configReadHosts(entry)
	if overrideHost != "" {
		hosts = []string{overrideHost}
	}
	if len(hosts) == 0 || (len(hosts) == 1 && hosts[0] == "AREA51") {
		output, err := runCommand(ctx, "sudo", "-n", "cat", entry.Path)
		if err != nil {
			if strings.Contains(string(output), "No such file") {
				return nil, errConfigNotFound
			}
			return nil, fmt.Errorf("read config: %w: %s", err, strings.TrimSpace(string(output)))
		}
		return output, nil
	}

	for _, host := range hosts {
		remoteCmd := fmt.Sprintf("sudo -n cat %s", shellQuote(entry.Path))
		output, err := runCommand(ctx, "ssh", "opc@"+host, remoteCmd)
		if err == nil {
			return output, nil
		}
		if !strings.Contains(string(output), "No such file") {
			return nil, fmt.Errorf("read config from %s: %w: %s", host, err, strings.TrimSpace(string(output)))
		}
	}
	return nil, errConfigNotFound
}

func writeConfigFile(ctx context.Context, entry *configEntry, content []byte, overrideHost string) error {
	tmp, err := os.CreateTemp("", "admin-config-*.json")
	if err != nil {
		return err
	}
	tmpPath := tmp.Name()
	defer os.Remove(tmpPath)

	if _, err := tmp.Write(content); err != nil {
		_ = tmp.Close()
		return err
	}
	if err := tmp.Close(); err != nil {
		return err
	}

	hosts := configHosts(entry)
	if overrideHost != "" {
		hosts = []string{overrideHost}
	}
	if len(hosts) == 0 || (len(hosts) == 1 && hosts[0] == "AREA51") {
		if output, err := runCommand(ctx, "sudo", "-n", "mkdir", "-p", filepath.Dir(entry.Path)); err != nil {
			return fmt.Errorf("prepare config dir: %w: %s", err, strings.TrimSpace(string(output)))
		}
		if output, err := runCommand(ctx, "sudo", "-n", "mv", tmpPath, entry.Path); err != nil {
			return fmt.Errorf("write config: %w: %s", err, strings.TrimSpace(string(output)))
		}
		if output, err := runCommand(ctx, "sudo", "-n", "chown", "opc:opc", entry.Path); err != nil {
			return fmt.Errorf("set config owner: %w: %s", err, strings.TrimSpace(string(output)))
		}
		if output, err := runCommand(ctx, "sudo", "-n", "chmod", "600", entry.Path); err != nil {
			return fmt.Errorf("set config mode: %w: %s", err, strings.TrimSpace(string(output)))
		}
		if shouldRestartServiceAfterConfigWrite(entry) {
			if err := restartConfigService(ctx, "", configServiceName(entry)); err != nil {
				return err
			}
		}
		return nil
	}

	remoteTmp := "/tmp/" + filepath.Base(tmpPath)
	for _, host := range hosts {
		if output, err := runCommand(ctx, "scp", tmpPath, fmt.Sprintf("opc@%s:%s", host, remoteTmp)); err != nil {
			return fmt.Errorf("copy config to %s: %w: %s", host, err, strings.TrimSpace(string(output)))
		}
		prepareCmd := fmt.Sprintf("sudo -n mkdir -p %s", shellQuote(filepath.Dir(entry.Path)))
		if output, err := runCommand(ctx, "ssh", "opc@"+host, prepareCmd); err != nil {
			return fmt.Errorf("prepare config dir on %s: %w: %s", host, err, strings.TrimSpace(string(output)))
		}
		moveCmd := fmt.Sprintf(
			"sudo -n mv %s %s && sudo -n chown opc:opc %s && sudo -n chmod 600 %s",
			shellQuote(remoteTmp),
			shellQuote(entry.Path),
			shellQuote(entry.Path),
			shellQuote(entry.Path),
		)
		if output, err := runCommand(ctx, "ssh", "opc@"+host, moveCmd); err != nil {
			return fmt.Errorf("write config to %s: %w: %s", host, err, strings.TrimSpace(string(output)))
		}
		if shouldRestartServiceAfterConfigWrite(entry) {
			if err := restartConfigService(ctx, host, configServiceName(entry)); err != nil {
				return err
			}
		}
	}
	return nil
}

func readConfigDeployment(ctx context.Context, entry *configEntry, overrideHost string) (map[string]any, error) {
	binaryPath, hasBinary := serviceBinaryPath(entry)
	statCmd := []string{"stat", "-c", "%Y", entry.Path}
	hosts := configReadHosts(entry)
	if overrideHost != "" {
		hosts = []string{overrideHost}
	}
	if len(hosts) == 0 || (len(hosts) == 1 && hosts[0] == "AREA51") {
		output, err := runCommand(ctx, "sudo", append([]string{"-n"}, statCmd...)...)
		if err != nil {
			if strings.Contains(string(output), "No such file") {
				return nil, errConfigNotFound
			}
			return nil, fmt.Errorf("read config metadata: %w: %s", err, strings.TrimSpace(string(output)))
		}
		updatedAt, err := timeFromUnixString(strings.TrimSpace(string(output)))
		if err != nil {
			return nil, err
		}

		deployment := buildDeploymentInfo(entry, updatedAt, "Success")
		deployment["latest_update_configuration"] = updatedAt.UTC().Format(time.RFC3339)
		deployment["configuration_path"] = entry.Path

		if hasBinary {
			binaryOutput, err := runCommand(ctx, "sudo", "-n", "stat", "-c", "%Y", binaryPath)
			if err == nil {
				binaryUpdatedAt, parseErr := timeFromUnixString(strings.TrimSpace(string(binaryOutput)))
				if parseErr == nil {
					deployment["latest_update_binary"] = binaryUpdatedAt.UTC().Format(time.RFC3339)
				}
			}
			deployment["binary_path"] = binaryPath
		}

		return deployment, nil
	}

	for _, host := range hosts {
		remoteCmd := fmt.Sprintf("sudo -n stat -c %%Y %s", shellQuote(entry.Path))
		output, err := runCommand(ctx, "ssh", "opc@"+host, remoteCmd)
		if err == nil {
			updatedAt, err := timeFromUnixString(strings.TrimSpace(string(output)))
			if err != nil {
				return nil, err
			}

			deployment := buildDeploymentInfo(entry, updatedAt, "Success")
			deployment["latest_update_configuration"] = updatedAt.UTC().Format(time.RFC3339)
			deployment["configuration_path"] = entry.Path

			if hasBinary {
				binaryOutput, err := runCommand(ctx, "sudo", "-n", "stat", "-c", "%Y", binaryPath)
				if err == nil {
					binaryUpdatedAt, parseErr := timeFromUnixString(strings.TrimSpace(string(binaryOutput)))
					if parseErr == nil {
						deployment["latest_update_binary"] = binaryUpdatedAt.UTC().Format(time.RFC3339)
					}
				}
				deployment["binary_path"] = binaryPath
			}

			return deployment, nil
		}
		if !strings.Contains(string(output), "No such file") {
			return nil, fmt.Errorf("read config metadata from %s: %w: %s", host, err, strings.TrimSpace(string(output)))
		}
	}
	return nil, errConfigNotFound
}

func timeFromUnixString(value string) (time.Time, error) {
	seconds, err := time.ParseDuration(value + "s")
	if err != nil {
		return time.Time{}, err
	}
	return time.Unix(int64(seconds.Seconds()), 0).Local(), nil
}

/** GET /configs — admin only. Returns the registry of editable configs so
 *  the UI can build its app/env picker without hard-coding it. */
func GetConfigs(config *db.Config, mysql *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if helpers.RequireAdmin(w, r, mysql) == nil {
			return
		}
		items := make([]map[string]any, 0, len(configRegistry))
		for _, e := range configRegistry {
			items = append(items, map[string]any{
				"app":  e.App,
				"env":  e.Env,
				"host": e.Host,
				"path": e.Path,
			})
		}
		helpers.Response(w, http.StatusOK, map[string]any{"status": "ok", "configs": items})
	}
}

/** GET /configs/{app}/{env} — admin only. Fetches the JSON file from the
 *  target VM and returns it as a parsed object so the UI can render a form. */
func GetConfig(config *db.Config, mysql *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if helpers.RequireAdmin(w, r, mysql) == nil {
			return
		}
		entry := findConfigEntry(r.PathValue("app"), r.PathValue("env"))
		if entry == nil {
			helpers.Response(w, http.StatusNotFound, map[string]any{"status": "error", "message": "unknown config"})
			return
		}

		raw, err := readConfigFile(r.Context(), entry, r.URL.Query().Get("host"))
		if err != nil {
			if errors.Is(err, errConfigNotFound) {
				helpers.Response(w, http.StatusNotFound, map[string]any{"status": "error", "message": "config file not found on target"})
				return
			}
			helpers.Response(w, http.StatusBadGateway, map[string]any{"status": "error", "message": "failed to read config from target vm"})
			return
		}

		var parsed map[string]any
		if err := json.Unmarshal(raw, &parsed); err != nil {
			helpers.Response(w, http.StatusBadGateway, map[string]any{"status": "error", "message": "config file is not valid JSON"})
			return
		}

		deployment, err := readConfigDeployment(r.Context(), entry, r.URL.Query().Get("host"))
		if err != nil {
			helpers.Response(w, http.StatusBadGateway, map[string]any{"status": "error", "message": "failed to read deployment status from target vm"})
			return
		}

		helpers.Response(w, http.StatusOK, map[string]any{
			"status":     "ok",
			"app":        entry.App,
			"env":        entry.Env,
			"path":       entry.Path,
			"config":     parsed,
			"deployment": deployment,
		})
	}
}

/** PUT /configs/{app}/{env} — admin only. Body: the new config object.
 *  Writes it directly to the target VM so the service sees the update
 *  immediately. */
func PutConfig(config *db.Config, mysql *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if helpers.RequireAdmin(w, r, mysql) == nil {
			return
		}
		entry := findConfigEntry(r.PathValue("app"), r.PathValue("env"))
		if entry == nil {
			helpers.Response(w, http.StatusNotFound, map[string]any{"status": "error", "message": "unknown config"})
			return
		}

		var body map[string]any
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			helpers.Response(w, http.StatusBadRequest, map[string]any{"status": "error", "message": "invalid body"})
			return
		}

		/** Re-serialize with 4-space indent and a trailing newline so the
		 *  on-disk format stays stable across edits. */
		var buf bytes.Buffer
		enc := json.NewEncoder(&buf)
		enc.SetIndent("", "    ")
		enc.SetEscapeHTML(false)
		if err := enc.Encode(body); err != nil {
			helpers.Response(w, http.StatusBadRequest, map[string]any{"status": "error", "message": "failed to serialize config"})
			return
		}

		if err := writeConfigFile(r.Context(), entry, buf.Bytes(), r.URL.Query().Get("host")); err != nil {
			helpers.Response(w, http.StatusBadGateway, map[string]any{"status": "error", "message": "failed to write config to target vm"})
			return
		}

		deployment, err := readConfigDeployment(r.Context(), entry, r.URL.Query().Get("host"))
		if err != nil {
			helpers.Response(w, http.StatusOK, map[string]any{"status": "ok"})
			return
		}

		helpers.Response(w, http.StatusOK, map[string]any{"status": "ok", "deployment": deployment})
	}
}

/** POST /configs/{app}/{env}/deploy — admin only. Triggers the mapped Gitea
 *  workflow so production deploys can be started manually from the UI. */
func PostConfigDeploy(config *db.Config, mysql *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if helpers.RequireAdmin(w, r, mysql) == nil {
			return
		}

		entry := findConfigEntry(r.PathValue("app"), r.PathValue("env"))
		if entry == nil {
			helpers.Response(w, http.StatusNotFound, map[string]any{"status": "error", "message": "unknown config"})
			return
		}

		if entry.Env == "prod" {
			if err := deployConfigProduction(r.Context(), entry); err != nil {
				fmt.Printf("prod deploy failed for %s/%s: %v\n", entry.App, entry.Env, err)
				helpers.Response(w, http.StatusBadGateway, map[string]any{
					"status":  "error",
					"message": "failed to deploy service to production",
					"details": err.Error(),
				})
				return
			}

		deployment, err := readConfigDeployment(r.Context(), entry, r.URL.Query().Get("host"))
			if err != nil {
				deployment = buildDeploymentInfo(entry, time.Now(), "Success")
			}
			setDeploymentStatus(deployment, "Success")

			helpers.Response(w, http.StatusOK, map[string]any{
				"status":     "ok",
				"deployment": deployment,
			})
			return
		}

		if _, ok := configWorkflow(entry); !ok {
			helpers.Response(w, http.StatusBadRequest, map[string]any{"status": "error", "message": "no deployment workflow configured for this application/environment"})
			return
		}

		if err := triggerConfigDeployment(config, entry); err != nil {
			if errors.Is(err, helpers.ErrGiteaNotConfigured) {
				helpers.Response(w, http.StatusServiceUnavailable, map[string]any{"status": "error", "code": "gitea_not_configured", "message": "gitea is not configured"})
				return
			}
			helpers.Response(w, http.StatusBadGateway, map[string]any{"status": "error", "message": "failed to trigger deployment workflow"})
			return
		}

		deployment, err := readConfigDeployment(r.Context(), entry, r.URL.Query().Get("host"))
		if err != nil {
			deployment = buildDeploymentInfo(entry, time.Now(), "Running")
		}
		setDeploymentStatus(deployment, "Running")

		helpers.Response(w, http.StatusOK, map[string]any{
			"status":     "ok",
			"deployment": deployment,
		})
	}
}

/** POST /configs/{app}/{env}/restart — admin only. Restarts the target
 *  service without changing configuration or binary. */
func PostConfigRestart(config *db.Config, mysql *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if helpers.RequireAdmin(w, r, mysql) == nil {
			return
		}

		entry := findConfigEntry(r.PathValue("app"), r.PathValue("env"))
		if entry == nil {
			helpers.Response(w, http.StatusNotFound, map[string]any{"status": "error", "message": "unknown config"})
			return
		}

		if err := restartServiceForEntry(r.Context(), entry); err != nil {
			helpers.Response(w, http.StatusBadGateway, map[string]any{
				"status":  "error",
				"message": "failed to restart service",
				"details": err.Error(),
			})
			return
		}

		deployment, err := readConfigDeployment(r.Context(), entry, r.URL.Query().Get("host"))
		if err != nil {
			deployment = buildDeploymentInfo(entry, time.Now(), "Success")
		}
		setDeploymentStatus(deployment, "Success")

		helpers.Response(w, http.StatusOK, map[string]any{
			"status":     "ok",
			"deployment": deployment,
		})
	}
}

/** POST /configs/core/promote — admin only. Copies the core binary from
 *  AREA51 and deploys it serially to the hosts for the requested environment. */
func PostCorePromote(config *db.Config, mysql *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if helpers.RequireAdmin(w, r, mysql) == nil {
			return
		}

		env := r.URL.Query().Get("env")
		if env == "" {
			env = "prod"
		}

		if err := promoteCoreToProd(r.Context()); err != nil {
			helpers.Response(w, http.StatusBadGateway, map[string]any{
				"status":  "error",
				"message": "failed to promote core to production",
				"details": err.Error(),
			})
			return
		}

		entry := findConfigEntry("core", env)
		deployment, err := readConfigDeployment(r.Context(), entry, r.URL.Query().Get("host"))
		if err != nil {
			deployment = buildDeploymentInfo(entry, time.Now(), "Success")
		}
		setDeploymentStatus(deployment, "Success")

		helpers.Response(w, http.StatusOK, map[string]any{
			"status":     "ok",
			"deployment": deployment,
		})
	}
}

/** POST /configs/core/rollback — admin only. Rolls back the core binary on
 *  the hosts for the requested environment using the .bak backup if available. */
func PostCoreRollback(config *db.Config, mysql *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if helpers.RequireAdmin(w, r, mysql) == nil {
			return
		}

		env := r.URL.Query().Get("env")
		if env == "" {
			env = "prod"
		}

		if err := rollbackCoreProd(r.Context()); err != nil {
			helpers.Response(w, http.StatusBadGateway, map[string]any{
				"status":  "error",
				"message": "failed to rollback core on production",
				"details": err.Error(),
			})
			return
		}

		entry := findConfigEntry("core", env)
		deployment, err := readConfigDeployment(r.Context(), entry, r.URL.Query().Get("host"))
		if err != nil {
			deployment = buildDeploymentInfo(entry, time.Now(), "Success")
		}
		setDeploymentStatus(deployment, "Success")

		helpers.Response(w, http.StatusOK, map[string]any{
			"status":     "ok",
			"deployment": deployment,
		})
	}
}
