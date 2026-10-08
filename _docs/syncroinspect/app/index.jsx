/** React & Expo */
import { useEffect, useState, useContext } from "react"
import { StyleSheet, View, Platform, ScrollView, Linking } from "react-native"
import Head from "expo-router/head"
import * as SplashScreen from "expo-splash-screen"
import * as WebBrowser from "expo-web-browser"
/** Configs */
import ThemeContext from "../configs/themes"
import LocaleContext from "../configs/locales"
import storage from "../configs/storage"
/** Components */
import ConsentBanner from "./website_components/consent_banner"
import Hero from "./website_components/hero"
import ThreeCards from "./website_components/three_cards"
import SomethingWentWrong from "./website_components/error"

/** Keep splash screen visible until ready (for native only) */
SplashScreen.preventAutoHideAsync()

/** Closes the web popup after authentication */
WebBrowser.maybeCompleteAuthSession()

const Page = () => {
  const { theme } = useContext(ThemeContext)
  const { locale } = useContext(LocaleContext)
  const [loading, setLoading] = useState(true)
  const [consent, setConsent] = useState(false)
  const [error, setError] = useState(null)

  /** Hide/Show Consent Banner */
  useEffect(() => {
    let mounted = true

    const init = async () => {
      try {
        const storedConsent = await storage.get("consent")
        if (mounted && storedConsent) {
          setConsent(true)
        }
      } catch (e) {
        console.error("Init failed", e)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    init()
    return () => { mounted = false }
  }, [])


  /** MOBILE ONLY: Hide splash screen */
  useEffect(() => {
    if (!loading && Platform.OS !== "web") {
      SplashScreen.hideAsync()
    }
  }, [loading])


  /** Consent Banner Action */
  const handleConsent = async () => {
    try {
      setConsent(true)
      await storage.set("consent", true)
    } catch (error) {
      console.error("Page initialization failed:", error.code || error.message)
    }
  }

  /** Web styles */
  const web = StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollView: {
      flexGrow: 1
    },
    banner: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 100,
      backgroundColor: "white",
      zIndex: 200,
    },
  })

  /** Web layout */
  if (Platform.OS === "web") {

    /** Hide until the page is loaded */
    if (loading) { return <View style={[web.overlay, { opacity: 1 }]} /> }

    /** Show the error page */
    if (error) {
      return <SomethingWentWrong
        title={locale.gcp_error_title}
        subtitle={locale.gcp_error_subtitle}
        errorCode={locale.gcp_error_code}
        troubleshooting={true}
        buttons={[
          {
            variant: "default",
            label: locale.gcp_error_button_1,
            onPress: () => window.location.reload(),
          },
          {
            variant: "default",
            label: locale.gcp_error_button_2,
            onPress: () => Linking.openURL(`mailto:support@syncrosocial.com?subject=${locale.gcp_error_code} - ${new Date().toLocaleString()}`),
          },
        ]}
      />
    }

    /** Show the Web page */
    return <View style={web.container}>
      <Head>
        <title>SyncroSocial</title>
        <meta name="description" content="Manage multiple accounts, channels, and schedules in one unified space." />
        <meta property="og:title" content="SyncroSocial" />
        <meta property="og:description" content="Manage multiple accounts, channels, and schedules in one unified space." />
      </Head>
      {!consent && <ConsentBanner consent={handleConsent} />}
      <ScrollView style={web.scrollView} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
        <Hero loading={loading} consentGiven={consent} onConsent={handleConsent} />
        <ThreeCards />
      </ScrollView>
    </View>
  }

  /** Native app styles */
  const mobile = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.white,
    }
  })

  /** Native app layout */
  return <View style={mobile.container}>
    <Hero loading={loading} consentGiven={true} onConsent={() => { }} />
  </View>
}

export default Page