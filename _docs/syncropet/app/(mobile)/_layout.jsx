/** React & Expo */
import { useEffect, useState, useContext } from "react"
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import { useRouter } from "expo-router"
import { Tabs } from "expo-router/tabs"
import { Entypo, Ionicons, MaterialIcons } from "@expo/vector-icons"
/** Firebase */
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "../../configs/firebase"
/** Configs */
import ThemeContext from "../../configs/themes"
import LocaleContext from "../../configs/locales"
import storage from "../../configs/storage"
import { request } from "../../configs/services"
/** Components */
import Loading from "../components/loading"
import BannerVerification from "../components/banner_verification"

const Layout = () => {
  const [loading, setLoading] = useState()
  const [verified, setVerified] = useState()
  const [account, setAccount] = useState()
  const { theme, setTheme } = useContext(ThemeContext)
  const { locale, setLocale } = useContext(LocaleContext)
  const router = useRouter()
  const insets = useSafeAreaInsets()

  useEffect(() => {
    /** Shows loading page */
    setLoading(true)
    /** Gets the settings */
    getSettings()
    /** AuthN Control */
    return onAuthStateChanged(auth, (user) => !user && router.replace("/"))
  }, [])

  const getSettings = async () => {
    let retry = 0

    const getAccount = async () => {
      /** Get Account from the backend */
      const response = await request("GET", "account", null)
      if (response?.status === 403) {
        /** Shows the verification banner */
        setVerified(response?.data.verified)
        /** Hides loading page */
        setLoading(false)
      } else if (response?.status === 200) {
        /** Sets the theme */
        setTheme(response?.data.theme)
        /** Sets the language */
        setLocale(response?.data.language)
        /** Sets the verified status */
        setVerified(response?.data.verified)
        /** Saves the account in the storage */
        await storage.set("account", response)
        /** Hides the loading page */
        setLoading(false)
      } else {
        /** Retries every 5 seconds */
        if (retry = 0) {
          getAccount
          retry++
        } else if (retry < 2) {
          retry++
          setTimeout(getAccount, 5000)
        }
      }
    }

    getAccount()
  }

  return loading ? <Loading /> :
    !verified ? <BannerVerification setAccount={setAccount} setVerified={setVerified} setLoading={setLoading} /> :
      <SafeAreaProvider style={{ flex: 1, paddingTop: insets.top, backgroundColor: theme.clear }}>
        <StatusBar style={theme.statusBar} hidden={false} />
        <Tabs screenOptions={{
          tabBarStyle: { backgroundColor: theme.clear },
          tabBarActiveTintColor: theme.logoBlue,
          tabBarLabelStyle: { paddingBottom: 5 },
          tabBarShowLabel: true,
          headerShadowVisible: false,
        }}>
          <Tabs.Screen name="home" options={{
            tabBarLabel: locale.home,
            tabBarIcon: ({ color, size }) => <MaterialIcons name="home-filled" size={size} color={color} />,
            headerShown: false,
          }} />
          <Tabs.Screen name="dashboard" options={{
            tabBarLabel: locale.dashboard,
            headerShown: false,
            tabBarIcon: ({ color, size }) => <MaterialIcons name="pets" size={size} color={color} />,
          }} />
          <Tabs.Screen name="messages" options={{
            tabBarLabel: locale.messages,
            headerShown: false,
            tabBarIcon: ({ color, size }) => <Ionicons name="chatbubbles" size={size} color={color} />,
          }} />
          <Tabs.Screen name="events" options={{
            tabBarLabel: locale.events,
            headerShown: false,
            tabBarIcon: ({ color, size }) => <Entypo name="notification" size={size} color={color} />,
          }} />
          <Tabs.Screen name="settings" options={{
            tabBarLabel: locale.settings,
            headerShown: false,
            headerTransparent: true,
            tabBarIcon: ({ color, size }) => <Ionicons name="settings-sharp" size={size} color={color} />,
          }} />
        </Tabs >
      </SafeAreaProvider>
}

export default Layout