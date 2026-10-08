/** React & Expo */
import { Stack, Redirect, useSegments } from "expo-router"
import Head from "expo-router/head"
import * as SplashScreen from "expo-splash-screen"
import * as Font from "expo-font"
import Constants, { ExecutionEnvironment } from "expo-constants"
import { useEffect, useState } from "react"
import { Text, TextInput, View } from "react-native"
/** Configs */
import { LocaleProvider } from "../configs/locales"
import { ThemeProvider } from "../configs/themes"
import { AuthProvider, useAuth } from "../configs/auth"
import { NotificationsProvider } from "../components/desktop/notifications"

Text.defaultProps = Text.defaultProps || {}
Text.defaultProps.style = [{ fontFamily: "IBMPlexSans" }, Text.defaultProps.style]
TextInput.defaultProps = TextInput.defaultProps || {}
TextInput.defaultProps.style = [{ fontFamily: "IBMPlexSans" }, TextInput.defaultProps.style]

SplashScreen.preventAutoHideAsync()

const AuthGate = () => {
    const segments = useSegments()
    const { authState } = useAuth()
    const [fontsReady, setFontsReady] = useState(false)

    /** Load fonts */
    useEffect(() => {
        let mounted = true
            ; (async () => {
                try {
                    await Font.loadAsync({
                        IBMPlexSans: require("../../assets/fonts/IBMPlexSans.ttf"),
                    })
                } catch (e) {
                    console.warn(e)
                } finally {
                    if (mounted) setFontsReady(true)
                }
            })()
        return () => { mounted = false }
    }, [])

    /** Hide splash once everything is ready */
    useEffect(() => {
        if (!fontsReady || authState === "checking") return
        SplashScreen.hide()
    }, [fontsReady, authState])

    /** Hold the screen blank until fonts AND auth are resolved. */
    if (!fontsReady || authState === "checking") {
        return <View style={{ flex: 1 }} />
    }

    /** Declarative routing — runs during render, so the wrong screen never
     *  paints. The /dashboard pivot route then picks desktop or mobile. */
    const group = segments[0] // "(desktop)" | "(mobile)" | undefined for "/" or "/dashboard"
    const inProtected = group === "(desktop)" || group === "(mobile)"
    const onDashboard = segments[0] === "dashboard"

    if (authState === "authed" && !inProtected && !onDashboard) {
        return <Redirect href="/dashboard" />
    }
    if (authState === "guest" && (inProtected || onDashboard)) {
        return <Redirect href="/" />
    }

    return <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="dashboard" options={{ headerShown: false }} />
        <Stack.Screen name="(mobile)" options={{ headerShown: false }} />
        <Stack.Screen name="(desktop)" options={{ headerShown: false }} />
    </Stack>
}

const Root = () => {
    return <ThemeProvider>
        <LocaleProvider>
            <NotificationsProvider>
                <AuthProvider>
                    <Head>
                        <title>Operations</title>
                        <meta name="description" content="Operations Console" />
                        <meta property="og:title" content="Operations" />
                        <meta property="og:description" content="Operations Console" />
                        <meta name="viewport" content="width=device-width, initial-scale=1" />
                        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
                    </Head>
                    <AuthGate />
                </AuthProvider>
            </NotificationsProvider>
        </LocaleProvider>
    </ThemeProvider>
}

export default Root