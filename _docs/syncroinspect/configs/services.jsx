/** React & Expo */
import { Platform } from "react-native"
/** Firebase */
import { auth } from "./firebase"
import { BASE_URL } from "./environment"
/** Configs */
import { createDeviceSignature } from "./device_signature"

/** application/json request */
export const requestJson = async (path, method, body) => {
  try {
    /** Get the JWT */
    const user = auth.currentUser
    if (!user) {
      return { status: 401, error: "NO_AUTHENTICATED_USER" }
    }
    const token = await user.getIdToken()


    /** Create device signature */
    const deviceSignature = await createDeviceSignature()

    /** Send the request */
    const response = await fetch(`${BASE_URL + path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "X-Client-Platform": Platform.OS,
        "X-Device-Signature": deviceSignature,
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

/** multipart/form-data request */
export const requestMultipart = async (method, action, body, file) => {
  const accessToken = auth.currentUser?.stsTokenManager.accessToken
  if (!accessToken) return
  try {
    const formData = new FormData()
    if (file) {
      const fileData = Platform.OS === "web" ? file : { uri: file, name: "avatar.jpeg", type: "image/jpeg" }
      formData.append("file", fileData, "avatar.jpeg")
    }

    if (body && ["POST", "PUT", "DELETE"].includes(method)) {
      formData.append("body", JSON.stringify(body))
    }

    const response = await fetch(`${BASE_URL}authn`, {
      method,
      headers: {
        "Access-Token": `Bearer ${accessToken}`,
        "Action": action,
      },
      body: method === "GET" ? undefined : formData,
    })

    const data = await response.json()
    return { ...data, status: response.status }

  } catch (error) {
    console.error(error.code, error.message)
  }
}
