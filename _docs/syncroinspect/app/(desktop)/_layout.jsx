/** Expo & React */
import { useEffect, useState, useRef, useContext } from "react"
import { Stack, useRouter } from "expo-router"
import { View, Pressable, Animated, StyleSheet } from "react-native"
import * as Device from "expo-device"
/** Firebase */
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "../../configs/firebase"
/** Configs */
import ThemeContext, { alpha } from "../../configs/themes"
/** Components */
import Loading from "../desktop_components/loading"
import NavBar from "../desktop_components/navbar"
import Drawer from "../desktop_components/drawer"

const LayoutContent = ({ children }) => {
    const { theme } = useContext(ThemeContext)
    const [drawerOpen, setDrawerOpen] = useState(false)
    const animatedValue = useRef(new Animated.Value(400)).current

    const openDrawer = () => {
        Animated.timing(animatedValue, { toValue: 0, duration: 250, useNativeDriver: true }).start()
        setDrawerOpen(true)
    }

    const closeDrawer = () => {
        Animated.timing(animatedValue, { toValue: 400, duration: 250, useNativeDriver: true }).start()
        setDrawerOpen(false)
    }

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            overflow: "hidden",
            height: "100%",
            backgroundColor: theme.clear,
        },
        drawerContainer: {
            width: 320,
            height: "100vh",
            backgroundColor: theme.ternary,
            position: "absolute",
            right: 0,
            top: 0,
            shadowColor: theme.black,
            shadowOffset: { width: -10, height: 0 },
            shadowOpacity: 0.2,
            shadowRadius: 15,
            elevation: 15,
            zIndex: 200
        },
        drawerOverlay: {
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: theme.black + alpha[60],
            zIndex: 100
        },
    })

    return <View style={styles.container}>
        <NavBar openDrawer={openDrawer} />
        <Animated.View style={[styles.drawerContainer, { transform: [{ translateX: animatedValue }] }]}>
            <Drawer closeDrawer={closeDrawer} />
        </Animated.View>
        {drawerOpen ? <Pressable onPress={closeDrawer} style={styles.drawerOverlay} /> : null}
        {children}
    </View>
}

const Layout = () => {
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        /** Shows loading page */
        setLoading(true)

        /** Check if device is desktop/tablet */
        if (Device.deviceType === 1 || Device.deviceType === 0) {
            /** Phone or unknown - redirect to mobile layout after mount */
            setTimeout(() => router.replace("/(mobile)/home"), 0)
            return
        }

        /** Hides loading page */
        const timer = setTimeout(() => setLoading(false), 300)

        /** AuthN Control */
        const unsubscribe = onAuthStateChanged(auth, (user) => !user && router.replace("/"))

        return () => {
            clearTimeout(timer)
            unsubscribe()
        }
    }, [router])

    return loading ? <Loading /> :
        <LayoutContent>
            <Stack screenOptions={{ headerShown: false }} />
        </LayoutContent>
}

export default Layout