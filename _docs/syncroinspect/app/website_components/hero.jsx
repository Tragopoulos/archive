/** React & Expo */
import { useState, useEffect, useContext, useRef } from "react"
import { StyleSheet, useWindowDimensions, Text, View, ImageBackground, Animated, TextInput, Linking, Platform, KeyboardAvoidingView } from "react-native"
import { useRouter } from "expo-router"
/** Configs */
import ThemeContext, { alpha } from "../../configs/themes"
import LocaleContext from "../../configs/locales"
import { useMicrosoft, useGoogle, useEmail, registerEmail } from "../../configs/authn"
/** Components */
import Logo from "../mobile_components/logo"
import ButtonBig from "./button_big"
import FadeModal from "./fade_modal"
/** Media */
import bgHero from "../../assets/media/bgHero.jpg"
import google from "../../assets/media/google.png"
import microsoft from "../../assets/media/microsoft.png"
import at_sign from "../../assets/media/email.png"

const Hero = ({ loading, consentGiven, onConsent }) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [modalVisible, setModalVisible] = useState(false)
  const [modalData, setModalData] = useState({ title: "", message: "" })

  const { width, height } = useWindowDimensions()
  const { theme } = useContext(ThemeContext)
  const { locale } = useContext(LocaleContext)
  const router = useRouter()
  const fade = useRef(new Animated.Value(1)).current

  /** Fade overlay opacity */
  useEffect(() => {
    if (!loading) {
      Animated.timing(fade, {
        toValue: 0.3,
        duration: 500,
        useNativeDriver: Platform.OS !== "web",
      }).start()
    }
  }, [loading, fade])

  /** Handle Sign In */
  const handleSignIn = async (signIn, skipConsentCheck = false) => {
    /** Check if consent has been given */
    if (!consentGiven && !skipConsentCheck) {
      setModalData({
        title: locale.consent_required_title,
        message: locale.consent_required_message,
        buttons: [
          {
            variant: "default",
            label: locale.cancel,
            onPress: () => setModalVisible(false)
          },
          {
            variant: "default",
            label: locale.consent_acknowledge_button,
            onPress: async () => {
              setModalVisible(false)
              await onConsent()
              /** Retry sign-in, bypassing consent check this time */
              setTimeout(() => handleSignIn(signIn, true), 150)
            }
          }
        ]
      })
      setModalVisible(true)
      return
    }

    /** Sign In to firebase */
    const { user, error } = await signIn(email, password)
    console.log(error)

    /** The user doesn't exist */
    if (!user) {
      /** If account not found show registration modal */
      if (error === "auth/invalid-credential") {
        const modalData = locale.errors.find(err => err.case === error)
        setModalData({
          title: modalData.title,
          message: modalData.message,
          buttons: [
            { variant: "default", label: locale.gcp_error_button_1, onPress: () => setModalVisible(false) },
            {
              variant: "default",
              label: locale.register,
              onPress: async () => {
                setModalVisible(false)
                const { user: newUser, error: registerError } = await registerEmail(email, password)
                if (newUser) {
                  handleSignIn(() => Promise.resolve({ user: newUser, error: null }))
                } else {
                  /** Show registration error */
                  const errorData = locale.errors.find(err => err.case === registerError) || locale.errors[0]
                  setModalData({
                    title: errorData.title,
                    message: errorData.message,
                    buttons: [{ variant: "default", label: locale.close, onPress: () => setModalVisible(false) }]
                  })
                  setModalVisible(true)
                }
              }
            },
          ]
        })
        setModalVisible(true)
        return
      }

      /** Display Error Modal */
      const modalData = locale.errors.find(err => err.case === error)
      modalData ? setModalData({
        title: modalData.title,
        message: modalData.message,
        buttons: [{ variant: "default", label: locale.gcp_error_button_1, onPress: () => setModalVisible(false) }]
      }) : setModalData({
        title: locale.errors[0].title,
        message: locale.errors[0].message,
        buttons: [
          { variant: "default", label: locale.gcp_error_button_1, onPress: () => setModalVisible(false) },
          {
            variant: "default", label: locale.gcp_error_button_2, onPress: () => {
              setModalVisible(false)
              Linking.openURL(`mailto:support@syncrosocial.com?subject=${locale.gcp_error_code} - ${new Date().toLocaleString()}`)
            }
          },
        ]
      })
      setModalVisible(true)
      return
    }

    /** _layout.jsx handles the backend call and routing via onAuthStateChanged */
  }

  const styles = StyleSheet.create({
    container: {
      width: "100%",
      height,
      justifyContent: "center",
      alignItems: "center",
    },
    backgroundImage: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%"
    },
    overlay: {
      flex: 1,
      backgroundColor: theme.black
    },
    subtitle: {
      textAlign: "center",
      paddingHorizontal: 20,
      color: theme.textLight,
      fontSize: width < 500 ? 18 : 26,
    },
    input: {
      height: 48,
      width: "100%",
      backgroundColor: theme.clear + alpha[80],
      color: theme.invert,
      fontSize: 18,
      padding: 10,
      borderRadius: 10,
      marginTop: 10,
      placeholderTextColor: theme.primary,
    },
    consentText: {
      marginTop: 10,
      fontSize: 14,
      lineHeight: 18,
      opacity: 0.8,
      textAlign: "center",
      color: theme.textLight,
      marginBottom: -120,
    },
    separator: {
      height: 1,
      width: "100%",
      backgroundColor: theme.textLight,
      marginTop: 10,
    }
  })

  return <View style={styles.container}>
    <ImageBackground style={styles.backgroundImage} source={bgHero}>
      <Animated.View style={[styles.overlay, { opacity: fade }]} />
    </ImageBackground>
    <Logo />
    <FadeModal visible={modalVisible} title={modalData.title} subtitle={modalData.message} buttons={modalData.buttons} />
    <Text style={styles.subtitle}>{locale.hero_subtitle}</Text>
    <KeyboardAvoidingView style={{ maxWidth: 360, width: "90%" }} behavior={Platform.OS === 'web' ? 'position' : 'position'}>
      <ButtonBig text={"Sign in with Microsoft"} action={() => handleSignIn(useMicrosoft)} icon={microsoft} disabled={loading} accessibilityLabel="Sign in with Microsoft" />
      <ButtonBig text={"Sign in with Google"} action={() => handleSignIn(useGoogle)} icon={google} disabled={loading} accessibilityLabel="Sign in with Google" />
      <View style={styles.separator} />
      <TextInput value={email} style={styles.input} placeholder={locale.email} placeholderTextColor={styles.input.placeholderTextColor} autoCapitalize="none" onChangeText={setEmail} />
      <TextInput value={password} style={styles.input} placeholder={locale.password} placeholderTextColor={styles.input.placeholderTextColor} secureTextEntry autoCapitalize="none" onChangeText={setPassword} />
      <ButtonBig text={"Sign in with Email"} action={() => handleSignIn(useEmail)} icon={at_sign} disabled={loading} accessibilityLabel="Sign in with Email" />
      <Text style={styles.consentText}>
        By signing in, you acknowledge our{" "}
        <Text style={{ textDecorationLine: "underline" }} onPress={() => router.push("/terms")}>Terms of Service</Text>
        {" "}and{" "}
        <Text style={{ textDecorationLine: "underline" }} onPress={() => router.push("/privacy")}>Privacy Policy</Text>.
      </Text>
    </KeyboardAvoidingView>
  </View >
}

export default Hero