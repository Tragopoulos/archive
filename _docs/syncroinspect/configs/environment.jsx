import { Platform } from "react-native"
import * as Device from "expo-device"

const PROD_API =
    "https://pz6nxnx5rdeedixixl6pctkmba.apigateway.eu-frankfurt-1.oci.customer-oci.com/v1/"

const TEST_API =
    "https://c2q2xhxtpb3qf57rzs43zq6k2m.apigateway.eu-frankfurt-1.oci.customer-oci.com/v1/"

/** Domain redirection for web */
export const enforceWebDomain = () => {
    if (Platform.OS !== "web") return
    if (typeof window === "undefined") return

    const hostname = window.location.hostname

    switch (hostname) {
        case "syncrosocial.web.app":
        case "syncrosocial.firebaseapp.com":
            window.location.replace("https://syncrosocial.com")
            break
    }
}

/** Resolve API base URL */
export const resolveBaseUrl = () => {
    switch (Platform.OS) {
        case "ios":
            if (Device.deviceName === "SyncroSocial iOS Tester") {
                return TEST_API
            }
            return Device.isDevice ? PROD_API : TEST_API

        case "android":
            if (Device.deviceName === "SyncroSocial Android Tester") {
                return TEST_API
            }
            return Device.isDevice ? PROD_API : TEST_API

        case "web":
            if (typeof window === "undefined") { return PROD_API } // Build-time default      
            return window.location.hostname === "syncrosocial.com" ? PROD_API : TEST_API // Actual

        default:
            return PROD_API
    }
}

export const BASE_URL = resolveBaseUrl()