/** Expo & React */
import { useEffect, useContext } from "react"
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import { useRouter } from "expo-router"
import { Tabs } from "expo-router/tabs"
import { FontAwesome5, Ionicons, Fontisto } from "@expo/vector-icons"
/** Firebase */
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "../../configs/firebase"
/** Configs */
import ThemeContext from "../../configs/themes"
import storage from "../../configs/storage"
import { request } from "../../configs/services"
/** Components */
import HeaderReports from "../mobile_components/header_reports"
// import DesktopDashboard from "../components/app/desktop_dashboard"
// import { Platform } from "react-native"

const Layout = () => {
  const { theme, setTheme } = useContext(ThemeContext)
  const router = useRouter()
  const insets = useSafeAreaInsets()

  useEffect(() => {
    const getAccount = async () => {
      /** Shows loading page */
      await storage.set("loading", true)

      /** Checks if there is a registration in progress */
      const storageKeys = await storage.getKeys()
      if (storageKeys.includes("registering")) {

        const registrationDelay = async () => {
          const storageKeys = await storage.getKeys()
          if (storageKeys.includes("registering")) {
            setTimeout(registrationDelay, 1000)
          } else {
            const account = await storage.get("account")
            setTheme(account.data.theme)
          }
        }
        registrationDelay()
      } else {
        /** Get Account from the backend */
        const response = await request("GET", "account", null)
        const saved = await storage.set("account", response)
        saved && setTheme(response.data.theme)
      }

      /** Hides loading page */
      await storage.set("loading", false)
    }

    getAccount()
    /** AuthN Control */
    return onAuthStateChanged(auth, (user) => !user && router.replace("/"))
  }, [])

  /** Platform.OS === "web" ? <DesktopDashboard />  */

  return <SafeAreaProvider style={{ flex: 1, paddingTop: insets.top, backgroundColor: theme.clear }}>
    <StatusBar style={theme.statusBar} hidden={false} />
    <Tabs screenOptions={{
      tabBarStyle: { backgroundColor: theme.clear },
      tabBarActiveTintColor: theme.primaryBlue,
      tabBarLabelStyle: { fontWeight: "bold" },
      tabBarShowLabel: true,
      headerShadowVisible: false,
    }}>
      <Tabs.Screen name="reports" options={{
        tabBarLabel: "Reports",
        tabBarLabelStyle: { paddingBottom: 5 },
        tabBarIcon: ({ color, size }) => <FontAwesome5 name="file-medical-alt" size={size} color={color} />,
        tabBarIconStyle: { marginTop: 5 },
        headerShown: false,
        headerRight: () => <HeaderReports />,
      }} />
      <Tabs.Screen name="(access)" options={{
        tabBarLabel: "Access",
        tabBarLabelStyle: { paddingBottom: 5 },
        headerShown: false,
        tabBarIcon: ({ color, size }) => <Ionicons name="shield-checkmark" size={size} color={color} />,
        tabBarIconStyle: { marginTop: 5 },
      }} />
      <Tabs.Screen name="dashboard" options={{
        tabBarLabel: "Dashboard",
        tabBarLabelStyle: { paddingBottom: 5 },
        headerShown: false,
        tabBarIcon: ({ color, size }) => <FontAwesome5 name="heartbeat" size={size} color={color} />,
        tabBarIconStyle: { marginTop: 5 },
      }} />
      <Tabs.Screen name="(contacts)" options={{
        tabBarLabel: "Contacts",
        tabBarLabelStyle: { paddingBottom: 5 },
        headerShown: false,
        tabBarIcon: ({ color, size }) => <Fontisto name="doctor" size={size} color={color} />,
        tabBarIconStyle: { marginTop: 5 },
      }} />
      <Tabs.Screen name="(settings)" options={{
        tabBarLabel: "Settings",
        tabBarLabelStyle: { paddingBottom: 5 },
        headerShown: false,
        headerTransparent: true,
        tabBarIcon: ({ color, size }) => <Ionicons name="settings-sharp" size={size} color={color} />,
        tabBarIconStyle: { marginTop: 5 },
      }} />
      {/* <Tabs.Screen name="notifications" options={{ href: null }} /> */}
      {/* <Tabs.Screen name="(settings)/theme" options={{ href: null }} /> */}
    </Tabs >
  </SafeAreaProvider>
}

export default Layout