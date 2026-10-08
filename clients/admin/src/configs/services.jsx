/** React & Expo */
import { Platform } from "react-native"


export const BASE_URL = ""

export const requestJson = async (path, method, body) => {
    try {
        const response = await fetch(`${BASE_URL + path}`, {
            method,
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-Client-Platform": Platform.OS,
            },
            ...(method !== "GET" && body && { body: JSON.stringify(body) }),
        })

        let data = null
        const contentType = response.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
            try {
                data = await response.json()
            } catch {
                data = null
            }
        }

        return { status: response.status, data }
    } catch (error) {
        console.error(error)
        return { status: 0, error: "NETWORK_OR_CLIENT_ERROR" }
    }
}

export const requestText = async (path, method, body) => {
    try {
        const response = await fetch(`${BASE_URL + path}`, {
            method,
            credentials: "include",
            headers: {
                "X-Client-Platform": Platform.OS,
            },
            ...(method !== "GET" && body && { body: JSON.stringify(body) }),
        })

        const text = await response.text()
        return { status: response.status, data: text }
    } catch (error) {
        console.error(error)
        return { status: 0, error: "NETWORK_OR_CLIENT_ERROR" }
    }
}

export const requestMultipart = async (path, method, body, file) => {
    try {
        const formData = new FormData()
        if (file) {
            const fileData = Platform.OS === "web" ? file : { uri: file, name: "upload", type: "application/octet-stream" }
            formData.append("file", fileData, "upload")
        }

        if (body && ["POST", "PUT", "DELETE"].includes(method)) {
            formData.append("body", JSON.stringify(body))
        }

        const response = await fetch(`${BASE_URL + path}`, {
            method,
            credentials: "include",
            headers: {
                "X-Client-Platform": Platform.OS,
            },
            body: method === "GET" ? undefined : formData,
        })

        let data = null
        const contentType = response.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
            try {
                data = await response.json()
            } catch {
                data = null
            }
        }

        return { status: response.status, data }
    } catch (error) {
        console.error(error)
        return { status: 0, error: "NETWORK_OR_CLIENT_ERROR" }
    }
}