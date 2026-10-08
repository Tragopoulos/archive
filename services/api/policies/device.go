package policies

import (
	"api/db"
	"api/request"
	"strings"
)

func devicePolicies(data *request.Data, config *db.Config, add func(string)) {
	/** User Agent Presence */
	if strings.TrimSpace(data.UARaw) == "" {
		add(MissingUserAgent)
		return
	}

	/** Tool client check */
	lowerUA := strings.ToLower(data.UARaw)
	for _, client := range config.ToolClients {
		if strings.Contains(lowerUA, client) {
			add(NonBrowserClient)
			return
		}
	}

	/** Device Type */
	if strings.TrimSpace(data.DeviceType) == "" {
		add(UnknownDeviceType)
	} else {
		switch data.DeviceType {
		case request.DevicePhone, request.DeviceTablet, request.DeviceDesktop:
			// valid
		default:
			add(UnsupportedDeviceType)
		}
	}

	/** Platform check */
	if data.Platform == "" {
		add(MissingPlatform)
	} else {
		switch data.Platform {
		case request.WEB, request.IOS, request.ANDROID:
		default:
			add(UnsupportedPlatform)
		}
	}

	/** OS validation */
	if strings.TrimSpace(data.DeviceOSName) == "" {
		add(MissingOSName)
	}

	if strings.TrimSpace(data.DeviceOSVersion) == "" {
		add(MissingOSVersion)
	}

	/** Memory check */
	if data.DeviceTotalMemory > 0 && data.DeviceTotalMemory < 1<<30 {
		add(LowMemoryDevice)
	}

	/** IsDevice check */
	if !data.DeviceIsPhysical {
		add(VirtualDevice)
	}
}
