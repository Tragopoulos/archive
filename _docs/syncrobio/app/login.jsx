/** Expo & React */
import { useState, useEffect } from "react"
import { useRouter } from "expo-router"
import { useWindowDimensions, Dimensions, KeyboardAvoidingView, Animated, View, ImageBackground, TextInput, ActivityIndicator, Alert, Platform, StyleSheet } from "react-native"
/** Firebase */
import { auth } from "../configs/firebase"
import { signInWithEmailAndPassword } from "firebase/auth"
/** Configs */
import storage from "../configs/storage"
import { light, alpha } from "../configs/themes"
/** Components */
import Logo from "./web/logo"
import bImageLandscape from "../assets/images/prod_landscape_b.jpeg"
import bImagePortrait from "../assets/images/prod_portrait_b.jpeg"
import ButtonWeb from "./web/button_web"
import InfoModal from "./web/info_modal"

const Page = () => {
  const router = useRouter()
  const [data, setData] = useState(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [fadeAnimation] = useState(new Animated.Value(0))
  const [modalData, setModalData] = useState(null)
  const windowDimensions = useWindowDimensions()

  useEffect(() => {
    storage.get("login").then(setData)
  }, [])

  const handleLogin = async () => {
    try {
      setLoading(true)
      const user = await signInWithEmailAndPassword(auth, email, password)
      user && router.replace("/")
    } catch (error) {
      const modal_data = data?.modal_errors.find(modal => modal.case === error.code && modal)
      Platform.OS === "web" ? presentModal(modal_data.title, modal_data.message) :
        Alert.alert(modal_data.title, modal_data.message, [{ text: "Close", onPress: () => modal_data.page !== "/login" && router.replace(modal_data.page) }])
      error.code === "auth/user-disabled" && setEmail("")
      error.code === "auth/user-disabled" && setPassword("")
    } finally {
      setLoading(false)
    }
  }

  const presentModal = (title, message, actionL, actionR, buttonL, buttonR) => {
    setModalData({ title: title, message: message, leftAction: actionL, rightAction: actionR, leftButtonText: buttonL, rightButtonText: buttonR })
    Animated.timing(fadeAnimation, { toValue: 1, duration: 100, useNativeDriver: true })
      .start(() => {
        setTimeout(() => Animated.timing(fadeAnimation, { toValue: 0, duration: 100, useNativeDriver: true }).start(), 3000)
      })
  }

  return <>
    <ImageBackground source={windowDimensions.width < 500 ? bImagePortrait : bImageLandscape}
      style={styles.backgroundImage}>
      <View style={styles.overlay} />
    </ImageBackground>
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" && "padding"}>
      <Animated.View style={[{ opacity: fadeAnimation }, windowDimensions.width < 750 ? styles.containerModalCenter : styles.containerModalRight]}>
        <InfoModal modalData={modalData} />
      </Animated.View>
      <Logo />
      <View style={[{ width: Platform.OS === "web" ? (windowDimensions.width < 750 ? "90%" : 550) : "95%" }, styles.inputContainer]}>
        <TextInput value={email} style={styles.input} placeholder="Email"
          placeholderTextColor={styles.inputPlaceholder.color} autoCapitalize="none" onChangeText={text => setEmail(text)} />
        <TextInput value={password} placeholder="Password" secureTextEntry style={styles.input}
          placeholderTextColor={styles.inputPlaceholder.color} autoCapitalize="none" onChangeText={text => setPassword(text)} />
      </View>
      <View style={[{ width: Platform.OS === "web" ? (windowDimensions.width < 750 ? "90%" : 550) : "95%" }, styles.buttonContainer]}>
        {loading ? <ActivityIndicator size="large" color="white" style={{ marginHorizontal: "auto" }} /> : <>
          <ButtonWeb text={"Login"} action={() => handleLogin()} />
          <ButtonWeb text={"Cancel"} action={() => router.back()} />
        </>
        }
      </View>
    </KeyboardAvoidingView>
  </>
}

export default Page

const styles = StyleSheet.create({
  containerModalRight: {
    position: "absolute",
    right: 0,
    width: Dimensions.get("window").width > 750 ? 390 : "auto",
    height: "100%",
  },
  containerModalCenter: {
    position: "absolute",
    width: "100%",
    top: 0
  },
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  overlay: {
    flex: 1,
    backgroundColor: light.black + alpha[60],
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: light.ternary + alpha[30],
    color: light.ternary,
    fontSize: 16,
    padding: 15,
    borderRadius: 10,
    marginTop: 10
  },
  inputPlaceholder: {
    color: light.ternary + alpha[50],
  },
  buttonContainer: {
    alignItems: "center",
    justifyContent: Platform.OS === "web" ? "space-between" : "center",
    flexDirection: Platform.OS === "web" ? "row" : "column",
    marginTop: 40,
    height: 60,
    marginHorizontal: "auto",
  },
})