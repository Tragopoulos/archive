/** React & Expo */
import { useEffect, useState, useContext } from "react"
import { StatusBar } from "expo-status-bar"
import { StyleSheet, View, KeyboardAvoidingView, Platform, Dimensions, Text, ImageBackground, TextInput, ActivityIndicator, Alert, useColorScheme } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { useRouter } from "expo-router"
import Carousel from "react-native-reanimated-carousel"
import { SafeAreaView } from "react-native-safe-area-context"
/** Firebase */
import { auth } from "../configs/firebase"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, deleteUser, updateCurrentUser } from "firebase/auth"
/** Configs */
import storage from "../configs/storage"
import { requestAuth } from "../configs/services"
import LocaleContext from "../configs/locales"
import ThemeContext, { alpha } from "../configs/themes"
/** Components */
import Logo from "./components/logo"
import Card from "./components/carousel_card"
import ButtonWeb from "./components/web_button"
/** Media */
import bgDark from "../assets/media/bg_dark.png"
import bgLight from "../assets/media/bg_light.png"
import folder from "../assets/media/email.png"

const Page = () => {
    const colorScheme = useColorScheme()
    const router = useRouter()
    const { locale } = useContext(LocaleContext)
    const { theme } = useContext(ThemeContext)
    const [appData, setAppData] = useState(null)
    const [deviceData, setDeviceData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [show, setShow] = useState("index")


    const styles = StyleSheet.create({
        container: {
            flex: 1,
        },
        webContainer: {
            flex: 1,
        },
        scrollView: {
            // height: Dimensions.get("window").height,
            // height: windowDimensions.height,
            flexGrow: 1
        },
        bgImage: {
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
        },
        overlay: {
            flex: 1,
            backgroundColor: theme.clear + alpha[90],
        },
        contentContainer: {
            flex: 1,
            justifyContent: "space-between",
        },
        top: {
            flex: 0.6,
            alignItems: "center",
            justifyContent: "center",
        },
        middleCarousel: {
            flex: 2,
            alignItems: "center",
            justifyContent: "center",
        },
        middleInputs: {
            flex: 1,
            justifyContent: "center",
            paddingHorizontal: 10,
        },
        bottom: {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 10,
        },
        subtitle: {
            textAlign: "center",
            color: theme.logoPrimary,
            fontSize: 18,
            fontWeight: "500"
        },
        input: {
            backgroundColor: theme.clear,
            color: theme.invert,
            fontSize: 18,
            padding: 15,
            borderRadius: 10,
            marginTop: 10,
            borderColor: theme.logoPrimary,
            borderWidth: 2,
        },
        inputPlaceholder: {
            color: theme.smoke,
        },
    })

    useEffect(() => {
        /** AuthN Control */
        //TODO: The routing should be based on the backend: return onAuthStateChanged(auth, (user) => user && router.replace("/(mobile)/home"))
    }, [])

    const handlePress = action => (setShow(action), action === "cancel" && (setEmail(""), setPassword("")))

    const handleRegister = async () => {
        setLoading(true)
        try {
            /** Register in Firebase */
            const authn = await createUserWithEmailAndPassword(auth, email, password)

            if (authn.user) {
                /** Create user in backend after getting a JWT */
                const response = await requestAuth("POST", "metadata", deviceData)
                /** If the backend is not working then delete the user completely and show service unavailable */
                if (!response || response.status >= 300) {
                    try {
                        /** Ensure correct user is active */
                        await updateCurrentUser(auth, authn.user)
                        await deleteUser(authn.user)
                    } catch (error) {
                        //TODO: Error Handling -> Showing something else instead of the frontend
                        console.log(error)
                    }
                    throw new Error("auth/service-unavailable")
                } else {
                    /** If the backend works save the account settings to local storage */
                    await storage.set("account", response)
                    //TODO: Routing should be based on the backend
                    //return onAuthStateChanged(auth, (user) => user && router.replace("/(mobile)/home"))
                }
            }
        } catch (error) {
            const modal_data = locale.errors.find(modal => modal.case === error.code)
            // Platform.OS === "web" ? presentModal(modal_data.title, modal_data.message) :
            Alert.alert(modal_data.title, modal_data.message, [{ text: "Close" }])
            error.code === "auth/email-already-in-use" && (setEmail(""), setPassword(""))
        } finally {
            setLoading(false)
        }
    }

    const handleLogin = async () => {
        try {
            setLoading(true)
            const authn = await signInWithEmailAndPassword(auth, email, password)
            if (authn.user) {
                const response = await requestAuth("POST", "device_context", deviceData)
                    (!response || response.status >= 300) && (() => { throw new Error("auth/service-unavailable") })()
            }
        } catch (error) {
            const modal_data = locale.errors.find(modal => modal.case === error.code && modal)
            // Platform.OS === "web" ? presentModal(modal_data.title, modal_data.message) :
            Alert.alert(modal_data.title, modal_data.message, [{ text: "Close" }])
            error.code === "auth/user-disabled" && (setEmail(""), setPassword(""))
        } finally {
            setLoading(false)
            //TODO: Routing should be based on the backend
            //return onAuthStateChanged(auth, (user) => user && router.replace("/(mobile)/home"))
        }
    }

    const renderCarousel = () => (
        <View style={styles.middleCarousel}>
            {Platform.OS !== "web" && (
                <Carousel
                    style={styles.middleCarousel}
                    vertical={false}
                    width={Dimensions.get("window").width}
                    height={Dimensions.get("window").width}
                    loop
                    autoPlay
                    withAnimation={{ type: "spring", config: { damping: 15 } }}
                    autoPlayInterval={2000}
                    data={appData?.index.cards}
                    renderItem={({ index, animationValue }) => (
                        <Card animationValue={animationValue} index={index} data={appData?.index.cards} />
                    )}
                />
            )}
        </View>
    )

    return <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <StatusBar hidden />
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" && "padding"}>
            <ImageBackground style={styles.bgImage} source={theme.name === "light" ? bgLight : bgDark}>
                <View style={styles.overlay} />
            </ImageBackground>
            <SafeAreaView style={styles.contentContainer}>
                <View style={styles.top}>
                    <Logo />
                    <Text style={styles.subtitle}>{appData?.index?.hero_title}</Text>
                </View>
                {/* {show === "register" || show === "login" ? renderInputs() : renderCarousel()} */}
                <View style={styles.bottom}>
                    <ButtonWeb text={"Continue with GitHub"} action={handlePress} icon={folder} />
                    <ButtonWeb text={"Continue with Email"} action={handlePress} icon={folder} />
                </View>
            </SafeAreaView>
        </KeyboardAvoidingView>
    </GestureHandlerRootView>
}

export default Page
