/** Expo & React */
import { useEffect, useState, useCallback } from "react"
import { Platform, Dimensions, StyleSheet, View, ScrollView } from "react-native"
import { useRouter } from "expo-router"
import * as SplashScreen from "expo-splash-screen"
import { StatusBar } from "expo-status-bar"
/** Firebase */
import { auth } from "../configs/firebase"
import { onAuthStateChanged } from "firebase/auth"
/** Configs */
import storage from "../configs/storage"
import { fetchWebsite } from "../configs/services"
/** Components */
import Hero from "./web/hero"
import ThreeCards from "./web/three_cards"

/** Keeps the splash screen active */
SplashScreen.preventAutoHideAsync()

export default function App() {
  const [home, setHome] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    scrollView: {
      height: Dimensions.get("window").height
    }
  })

  useEffect(() => {
    /** Gets the website data from Firestore and saves it in the storage */
    setLoading(true)
    fetchWebsite()
    storage.get("home").then(setHome)
    setLoading(false)
    /** AuthN Control */
    return onAuthStateChanged(auth, (user) => user && router.replace("/(mobile)/dashboard"))
  }, [])

  /** Hides the splash screen 500ms after the data are loaded */
  const onLayoutRootView = useCallback(async () => !loading && setTimeout(() => SplashScreen.hideAsync(), 500), [loading])

  return <View style={Platform.OS !== "web" && styles.container} onLayout={onLayoutRootView}>
    <StatusBar hidden />
    {Platform.OS === "web" ?
      <ScrollView style={styles.scrollView}>
        <Hero data={home} />
        <ThreeCards data={home} />
      </ScrollView> :
      <Hero data={home} />
    }
  </View >
}

