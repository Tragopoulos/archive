/** React & Expo */
import { Platform } from "react-native"
import * as Device from "expo-device"
/** Firebase */
import { auth } from "./firebase"

/** Oracle Cloud Infrastructure API Gateway */
const BASE_URL = "https://k5ttqhdrow7ob5hrmblo4r2cga.apigateway.eu-frankfurt-1.oci.customer-oci.com/v1/"

/** Requests Oracle Cloud Infrastructure */
export const request = async (method, action, body, file) => {
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

export const getDeviceMetadata = () => {
  const baseMetadata = {
    deviceType: Device.deviceType === 1 ? "PHONE" :
      Device.deviceType === 2 ? "TABLET" :
        Device.deviceType === 3 ? "DESKTOP" :
          Device.deviceType === 4 ? "TV" : "UNKNOWN",
    manufacturer: Device.manufacturer,
    modelName: Device.modelName,
    osName: Device.osName,
    osVersion: Device.osVersion,
    totalMemory: Math.round(Device.totalMemory / 1073741824) + "GB",
  }

  const mobileMetadata = {
    brand: Device.brand,
    deviceName: Device.deviceName,
    deviceYearClass: Device.deviceYearClass,
    isDevice: Device.isDevice ? "PHYSICAL" : "VIRTUAL",
    osBuildId: Device.osBuildId,
    osInternalBuildId: Device.osInternalBuildId,
    supportedCpuArchitectures: Device.supportedCpuArchitectures,
  }

  let platformSpecificMetadata = {}

  switch (Platform.OS) {
    case "web":
      platformSpecificMetadata = {}
      break
    case "ios":
      platformSpecificMetadata = {
        modelId: Device.modelId,
      }
      break
    case "android":
      platformSpecificMetadata = {
        designName: Device.designName,
        osBuildFingerprint: Device.osBuildFingerprint,
        platformApiLevel: Device.platformApiLevel,
        productName: Device.productName,
      }
      break
    default:
      platformSpecificMetadata = {
        brand: Device.brand,
        designName: Device.designName,
        deviceName: Device.deviceName,
        deviceYearClass: Device.deviceYearClass,
      }
      break
  }

  if (Platform.OS === "ios" || Platform.OS === "android") {
    return { ...baseMetadata, ...platformSpecificMetadata, ...mobileMetadata }
  }

  return { ...baseMetadata, ...platformSpecificMetadata }
}

const getLatestRestart = async () => {
  if (Platform.OS === "ios" || Platform.OS === "android") {
    const deviceUptime = await Device.getUptimeAsync()
    const deviceUptimeSeconds = Math.floor(deviceUptime / 1000)
    return Math.floor(Date.now() / 1000) - deviceUptimeSeconds
  }
}