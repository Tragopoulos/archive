/** React & Expo */
import { useState, useContext, useMemo, useRef } from "react"
import { StyleSheet, useWindowDimensions, Text, View, ImageBackground, Animated, TextInput, Platform, KeyboardAvoidingView } from "react-native"
/** Configs */
import ThemeContext, { alpha } from "../../configs/themes"
import LocaleContext from "../../configs/locales"
import { requestJson } from "../../configs/services"
/** Components */
import ButtonBig from "./button_big"
import Logo from "../icons/logo"
import AtSign from "../icons/at_sign"
/** Media */
import bgHero from "../../../assets/images/bg_hero.jpg"

const FadingImageBackground = Animated.createAnimatedComponent(ImageBackground)

const fadeTo = (value, toValue, duration) => Animated.timing(value, { toValue, duration, useNativeDriver: Platform.OS !== "web", }).start()

const createStyles = (theme, width, height) => StyleSheet.create({
    container: {
        width: "100%",
        height,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: theme.black,
    },
    backgroundImage: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
    },
    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: theme.black,
        opacity: 0.8,
        pointerEvents: "none",
    },
    content: {
        width: "100%",
        alignItems: "center",
    },
    logo: {
        width: "90%",
        maxWidth: 500,
        aspectRatio: 400 / 96,
    },
    input: {
        height: 48,
        width: "100%",
        backgroundColor: theme.clear + alpha[80],
        color: theme.invert,
        fontSize: 18,
        padding: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: theme.invert,
        marginTop: 40,
        fontFamily: theme.font,
    },
    consentText: {
        marginTop: 40,
        fontSize: 14,
        lineHeight: 18,
        opacity: 1,
        textAlign: "center",
        color: theme.textLight,
        fontFamily: theme.font,
    },
    successTitle: {
        marginTop: 40,
        fontSize: 22,
        textAlign: "center",
        color: theme.textLight,
        fontFamily: theme.font,
    },
    successText: {
        marginTop: 12,
        fontSize: 14,
        lineHeight: 18,
        textAlign: "center",
        color: theme.textLight,
        fontFamily: theme.font,
    },
    errorText: {
        marginTop: 12,
        fontSize: 14,
        lineHeight: 18,
        textAlign: "center",
        color: theme.primaryRed,
        fontFamily: theme.font,
    },
})

const Hero = () => {
    const { theme } = useContext(ThemeContext)
    const { width, height } = useWindowDimensions()
    const { locale } = useContext(LocaleContext)
    const bgOpacity = useRef(new Animated.Value(0)).current
    const [email, setEmail] = useState("")
    const [status, setStatus] = useState("idle") // idle | sending | sent | error
    const [errorMessage, setErrorMessage] = useState("")

    const styles = useMemo(() => createStyles(theme, width, height), [theme, width, height])

    /** Fade in the background image once it has loaded */
    const handleImageLoad = () => fadeTo(bgOpacity, 1, 300)

    /** Handle Sign In */
    const handleSignIn = async () => {
        if (status === "sending") return
        const trimmed = email.trim()
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
            setStatus("error")
            setErrorMessage(locale.invalid_email)
            return
        }
        setStatus("sending")
        setErrorMessage("")
        try {
            const { status: code } = await requestJson("/api/auth/request", "POST", { email: trimmed })
            if (code >= 200 && code < 300) {
                setStatus("sent")
            } else {
                setStatus("error")
                setErrorMessage(locale.send_failed)
            }
        } catch (e) {
            setStatus("error")
            setErrorMessage(locale.send_failed)
        }
    }

    const handleReset = () => {
        setStatus("idle")
        setErrorMessage("")
    }

    const buttonText =
        status === "sending" ? locale.sending :
            status === "sent" ? locale.send_again :
                locale.sign_in_with_email

    return <View style={styles.container}>
        <FadingImageBackground style={[styles.backgroundImage, { opacity: bgOpacity }]} source={bgHero} onLoad={handleImageLoad} />
        <View style={styles.overlay} />
        <View style={styles.content}>
            <View style={styles.logo}>
                <Logo width="100%" height="100%" />
            </View>
            <KeyboardAvoidingView style={{ maxWidth: 480, width: "90%" }} behavior="position">
                {status === "sent" ? <>
                    <Text style={styles.successTitle}>{locale.check_inbox_title}</Text>
                    <Text style={styles.successText}>{locale.check_inbox_text}</Text>
                    <ButtonBig text={buttonText} action={handleReset} icon={AtSign} accessibilityLabel={buttonText} />
                </> : <>
                    <TextInput value={email} style={styles.input} placeholder={locale.email} placeholderTextColor={theme.primary} autoCapitalize="none" keyboardType="email-address" inputMode="email" autoComplete="email" editable={status !== "sending"} onChangeText={(v) => { setEmail(v); if (status === "error") setStatus("idle") }} onSubmitEditing={handleSignIn} />
                    <ButtonBig text={buttonText} action={handleSignIn} icon={AtSign} accessibilityLabel={buttonText} />
                    {status === "error" ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
                </>}
                <Text style={styles.consentText}>{locale.consent_text}</Text>
            </KeyboardAvoidingView>
        </View>
    </View>
}

export default Hero