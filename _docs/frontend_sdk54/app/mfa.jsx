/** React & Expo */
import { useState, useContext } from "react"
import { StyleSheet, View, Text, TextInput, Platform, KeyboardAvoidingView } from "react-native"
import { useRouter, useLocalSearchParams } from "expo-router"
import * as Device from "expo-device"
/** Firebase */
import { signOut } from "firebase/auth"
import { auth } from "../configs/firebase"
/** Configs */
import ThemeContext from "../configs/themes"
import LocaleContext from "../configs/locales"
import { requestJson } from "../configs/services"
/** Components */
import ButtonBig from "./website_components/button_big"
import FadeModal from "./website_components/fade_modal"

const MFA = () => {
    const { challenge_id } = useLocalSearchParams()
    const [code, setCode] = useState("")
    const [loading, setLoading] = useState(false)
    const [modalVisible, setModalVisible] = useState(false)
    const [modalData, setModalData] = useState({ title: "", message: "", buttons: [] })

    const { theme } = useContext(ThemeContext)
    const { locale } = useContext(LocaleContext)
    const router = useRouter()

    const handleSignOut = async () => {
        await signOut(auth)
        router.replace("/")
    }

    const handleVerify = async () => {
        if (code.length !== 6) return
        setLoading(true)

        const response = await requestJson("account", "POST", { challenge_id, mfa_code: code })
        setLoading(false)

        if (response?.status === 200 || response?.status === 201) {
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
            return
        }

        /** Map backend status codes to locale strings */
        let message = locale.mfa_error
        switch (response?.status) {
            case 429:
                message = locale.mfa_too_many
                setCode("")
                setModalData({
                    title: locale.mfa_title,
                    message,
                    buttons: [{ variant: "default", label: locale.close, onPress: handleSignOut }]
                })
                setModalVisible(true)
                return
            case 401:
                message = response?.data?.data?.message?.includes("expired")
                    ? locale.mfa_expired
                    : locale.mfa_invalid
                if (message === locale.mfa_expired) {
                    setCode("")
                    setModalData({
                        title: locale.mfa_title,
                        message,
                        buttons: [{ variant: "default", label: locale.close, onPress: handleSignOut }]
                    })
                    setModalVisible(true)
                    return
                }
                break
        }

        setCode("")
        setModalData({
            title: locale.mfa_title,
            message,
            buttons: [{ variant: "default", label: locale.close, onPress: () => setModalVisible(false) }]
        })
        setModalVisible(true)
    }

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.background,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
        },
        title: {
            fontSize: 24,
            fontWeight: "600",
            color: theme.invert,
            textAlign: "center",
            marginBottom: 12,
        },
        message: {
            fontSize: 16,
            color: theme.invert,
            textAlign: "center",
            opacity: 0.7,
            marginBottom: 30,
        },
        input: {
            height: 56,
            width: "100%",
            backgroundColor: theme.clear,
            borderWidth: 1,
            borderColor: theme.textLight,
            borderRadius: 10,
            color: theme.invert,
            fontSize: 28,
            textAlign: "center",
            letterSpacing: 10,
            marginBottom: 16,
            padding: 10,
        },
    })

    return <View style={styles.container}>
        <FadeModal visible={modalVisible} title={modalData.title} subtitle={modalData.message} buttons={modalData.buttons} />
        <KeyboardAvoidingView style={{ maxWidth: 360, width: "90%" }} behavior={Platform.OS === "web" ? "position" : "position"}>
            <Text style={styles.title}>{locale.mfa_title}</Text>
            <Text style={styles.message}>{locale.mfa_message}</Text>
            <TextInput
                style={styles.input}
                value={code}
                onChangeText={setCode}
                placeholder={locale.mfa_placeholder}
                placeholderTextColor={theme.textLight}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
            />
            <ButtonBig text={locale.mfa_verify} action={handleVerify} disabled={loading || code.length !== 6} />
        </KeyboardAvoidingView>
    </View>
}

export default MFA
