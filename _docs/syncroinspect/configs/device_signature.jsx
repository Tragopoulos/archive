/** React & Expo */
import { Platform } from "react-native"
import * as Device from "expo-device"
import { getLocales, getCalendars } from "expo-localization"

export const createDeviceSignature = async () => {
    const weekdayMap = {
        0: "Sunday",
        1: "Monday",
        2: "Tuesday",
        3: "Wednesday",
        4: "Thursday",
        5: "Friday",
        6: "Saturday"
    }

    /** Get locale and calendar */
    const locales = getLocales()
    const calendars = getCalendars()
    const primaryLocale = locales?.[0] || {}
    const primaryCalendar = calendars?.[0] || {}
    const firstWeekdayNum = primaryCalendar.firstWeekday

    /** Calculate device uptime for mobile platforms */
    let lastRestartAt
    if (Platform.OS === "ios" || Platform.OS === "android") {
        try {
            lastRestartAt = Math.floor((Date.now() - await Device.getUptimeAsync()) / 1000)
        } catch {
            lastRestartAt = undefined
        }
    }

    /** Build signature object */
    const signature = {
        /** Locale information */
        locale: {
            languageTag: primaryLocale.languageTag || null,
            regionCode: primaryLocale.regionCode || null,
            currencyCode: primaryLocale.currencyCode || null,
            currencySymbol: primaryLocale.currencySymbol || null,
            decimalSeparator: primaryLocale.decimalSeparator || null,
            digitGroupingSeparator: primaryLocale.digitGroupingSeparator || null,
            temperatureUnit: primaryLocale.temperatureUnit || null,
            textDirection: primaryLocale.textDirection || null,
        },
        /** Calendar information */
        calendar: {
            calendarType: primaryCalendar.calendar || null,
            firstWeekdayName: firstWeekdayNum != null && weekdayMap[firstWeekdayNum] ? weekdayMap[firstWeekdayNum] : null,
            timezone: primaryCalendar.timeZone || null,
            uses24hourClock: primaryCalendar.uses24hourClock ?? null,
        },
        /** Device information */
        device_type: Device.deviceType === 1 ? "phone" : Device.deviceType === 2 ? "tablet" : Device.deviceType === 3 ? "desktop" : "unknown",
        manufacturer: Device.manufacturer,
        brand: Device.brand,
        model_name: Device.modelName,
        device_name: Device.deviceName,
        is_physical_device: Device.isDevice,
        cpu_architectures: Device.supportedCpuArchitectures,
        total_memory: Device.totalMemory,
        year_class: Device.deviceYearClass,
        os_name: Device.osName,
        os_version: Device.osVersion,
        os_build_id: Device.osBuildId,
        last_restart_at: lastRestartAt,
        /** Platform-specific fields */
        ...(Platform.OS === "ios" && { ios_model_id: Device.modelId }),
        ...(Platform.OS === "android" && {
            android_design_name: Device.designName,
            android_os_build_fingerprint: Device.osBuildFingerprint,
            android_platform_api_level: Device.platformApiLevel,
            android_product_name: Device.productName,
        }),
    }

    return btoa(JSON.stringify(signature))
}