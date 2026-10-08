/** React & Expo */
import { Stack, useRouter } from "expo-router"
import { useEffect, useRef, useState, useContext } from "react"
import * as Device from "expo-device"
/** Firebase */
import { onAuthStateChanged, signOut } from "firebase/auth"
import { auth } from "../configs/firebase"
/** Configs */
import LocaleContext, { LocaleProvider } from "../configs/locales"
import { ThemeProvider } from "../configs/themes"
import { enforceWebDomain } from "../configs/environment"
import { requestJson } from "../configs/services"
/** Components */
import FadeModal from "./website_components/fade_modal"

const InnerLayout = () => {
  const router = useRouter()
  const backendCalled = useRef(false)
  const { locale } = useContext(LocaleContext)
  const [deactivated, setDeactivated] = useState(false)

  useEffect(() => {
    /** Redirects Firebase domains to syncrosocial.com */
    enforceWebDomain()

    /** Check authentication and route to appropriate layout */
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        backendCalled.current = false
        return
      }

      /** Prevent repeated backend calls when router re-triggers the effect */
      if (backendCalled.current) return
      backendCalled.current = true

      /** Call the backend to sign in or sign up */
      const response = await requestJson("account", "POST", null)

      switch (response?.status) {
        case 200:
        case 201:
          switch (Device.deviceType) {
            case 3: // DESKTOP
            case 2: // TABLET
              router.replace("/(desktop)/home")
              break
            case 1: // PHONE
            case 0: // UNKNOWN
            default:
              router.replace("/(mobile)/home")
          }
          break
        case 202:
          router.replace({ pathname: "/mfa", params: { challenge_id: response.data?.data?.challenge_id } })
          break
        case 403:
          /** Account is deactivated — sign out of Firebase and show an error */
          await signOut(auth)
          setDeactivated(true)
          break
        default:
          console.error("Backend error during auth:", response?.status, response?.data)
      }
    })

    return () => unsubscribe()
  }, [router])

  return <>
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="mfa" options={{ headerShown: false }} />
      <Stack.Screen name="(mobile)" options={{ headerShown: false }} />
      <Stack.Screen name="(desktop)" options={{ headerShown: false }} />
      <Stack.Screen name="[...missing]" options={{ headerShown: false }} />
      {/* <Stack.Screen name="verified" options={{ headerShown: false }} /> */}
      <Stack.Screen name="information" options={{ headerShown: false, headerTransparent: true }} />
      <Stack.Screen name="password" options={{ headerShown: false, headerTransparent: true }} />
      <Stack.Screen name="access" options={{ headerShown: false, headerTransparent: true }} />
      <Stack.Screen name="download" options={{ headerShown: false, headerTransparent: true }} />
      <Stack.Screen name="deactivate" options={{ headerShown: false, headerTransparent: true }} />
      <Stack.Screen name="themes" options={{ headerShown: false, headerTransparent: true }} />
      <Stack.Screen name="languages" options={{ headerShown: false, headerTransparent: true }} />
      <Stack.Screen name="terms" options={{ headerShown: false, headerTransparent: true }} />
      <Stack.Screen name="privacy" options={{ headerShown: false, headerTransparent: true }} />
      {/* <Stack.Screen name="dashboard_profile_add" options={{ headerShown: false, headerTransparent: true }} /> */}
      {/* <Stack.Screen name="dashboard_profile_edit/[id]" options={{ headerShown: false, headerTransparent: true }} /> */}
    </Stack>
    <FadeModal
      visible={deactivated}
      title={locale.account_deactivated_title}
      subtitle={locale.account_deactivated_message}
      buttons={[
        { variant: "default", label: locale.close, onPress: () => setDeactivated(false) }
      ]}
    />
  </>
}

const Layout = () => {
  return <ThemeProvider>
    <LocaleProvider>
      <InnerLayout />
    </LocaleProvider>
  </ThemeProvider>
}

export default Layout