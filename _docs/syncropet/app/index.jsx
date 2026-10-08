/** React & Expo */
import { useEffect, useState, useContext } from "react"
import { StatusBar } from "expo-status-bar"
import * as SplashScreen from "expo-splash-screen"
import { StyleSheet, View, KeyboardAvoidingView, Platform, Dimensions, useWindowDimensions, Text, ImageBackground, TextInput, ActivityIndicator, Alert } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { useFonts } from "expo-font"
/** Firebase */
import { auth, firestore } from "../configs/firebase"
import { collection, getDocs } from "firebase/firestore"
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth"
/** Configs */
import storage from "../configs/storage"
import { request, getDeviceMetadata } from "../configs/services"
import LocaleContext from "../configs/locales"
/** Components */
import { light, alpha } from "../configs/themes"
import { useRouter } from "expo-router"
import Logo from "./components/logo"
import Carousel from "react-native-reanimated-carousel"
import Card from "./components/carousel_card"
import ButtonWeb from "./components/button_web"
import bgLandscape from "../assets/media/prod_landscape_a.jpg"
import bgPortrait from "../assets/media/prod_portrait_a.jpg"

/** Keeps the splash screen active */
SplashScreen.preventAutoHideAsync()

const Page = () => {
  const { locale } = useContext(LocaleContext)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [show, setShow] = useState("index")

  const windowDimensions = useWindowDimensions()
  const router = useRouter()

  useFonts({ "TwemojiMozilla": require("../assets/fonts/Twemoji.ttf") })

  const handlePress = action => setShow(action)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, "production"))
        const dbCollection = querySnapshot.docs.map(doc => { return { id: doc.id, ...doc.data() } })
        const index = dbCollection.find(doc => doc.id === "index")
        const register = dbCollection.find(doc => doc.id === "register")
        const login = dbCollection.find(doc => doc.id === "login")
        setData({ index, register, login })
      } catch (error) {
        //TODO: Error Handling
        console.error(error.code, error.message)
      } finally {
        /** Hides the splash screen 500ms after the data are loaded */
        setTimeout(() => SplashScreen.hideAsync(), 500)
      }
    }

    fetchData()

    /** AuthN Control */
    return onAuthStateChanged(auth, (user) => user && router.replace("/(mobile)/home"))
  }, [])

  const handleRegister = async () => {
    try {
      setLoading(true)
      const authn = await createUserWithEmailAndPassword(auth, email, password)
      if (authn.user) {
        const metadata = getDeviceMetadata()
        const response = await request("POST", "account", metadata)
        await storage.set("account", response)
      }
    } catch (error) {
      const modal_data = data?.register.modal_errors.find(modal => modal.case === error.code && modal)
      // Platform.OS === "web" ?
      //   presentModal(modal_data.title, modal_data.message) :
      Alert.alert(modal_data.title, modal_data.message, [{ text: "Close", onPress: () => modal_data.page !== "/register" && router.replace(modal_data.page) }])
      error.code === "auth/email-already-in-use" && (setEmail(""), setPassword(""))
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async () => {
    try {
      setLoading(true)
      const user = await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      const modal_data = data?.login.modal_errors.find(modal => modal.case === error.code && modal)
      // Platform.OS === "web" ? presentModal(modal_data.title, modal_data.message) :
      Alert.alert(modal_data.title, modal_data.message, [{ text: "Close", onPress: () => modal_data.page !== "/login" && router.replace(modal_data.page) }])
      error.code === "auth/user-disabled" && (setEmail(""), setPassword(""))
    } finally {
      setLoading(false)
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
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
      backgroundColor: light.black + alpha[70],
    },
    top: {
      flex: 1,
      alignItems: "center",
      justifyContent: "flex-end",
      maxHeight: 150,
    },
    middleCarousel: {
      flex: 1,
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
      justifyContent: "flex-start",
      maxHeight: 170,
      paddingHorizontal: 10,
    },
    subtitle: {
      textAlign: "center",
      color: light.clear,
      fontSize: 18,
    },
    input: {
      backgroundColor: light.clear + alpha[30],
      color: light.clear,
      fontSize: 18,
      padding: 15,
      borderRadius: 10,
      marginTop: 10,
    },
    inputPlaceholder: {
      color: light.clear + alpha[50],
    },
  })

  return <GestureHandlerRootView style={{ flex: 1 }}>
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" && "padding"}>
      <ImageBackground style={styles.bgImage} source={bgPortrait}>
        <View style={styles.overlay} />
      </ImageBackground>
      <View style={styles.top}>
        <Logo />
        <Text style={styles.subtitle}>{data?.index?.hero_title}</Text>
      </View>
      {show === "register" ?
        <View style={styles.middleInputs}>
          {loading ? <ActivityIndicator size="large" color="white" style={{ marginHorizontal: "auto" }} /> : <>
            <TextInput value={email} style={styles.input} placeholder={locale.email}
              placeholderTextColor={styles.inputPlaceholder.color} autoCapitalize="none" onChangeText={text => setEmail(text)} />
            <TextInput value={password} placeholder={locale.password} secureTextEntry style={styles.input}
              placeholderTextColor={styles.inputPlaceholder.color} autoCapitalize="none" onChangeText={text => setPassword(text)} />
          </>}
        </View> :
        show === "login" ?
          <View style={styles.middleInputs}>
            {loading ? <ActivityIndicator size="large" color="white" style={{ marginHorizontal: "auto" }} /> : <>
              <TextInput value={email} style={styles.input} placeholder={locale.email}
                placeholderTextColor={styles.inputPlaceholder.color} autoCapitalize="none" onChangeText={text => setEmail(text)} />
              <TextInput value={password} placeholder={locale.password} secureTextEntry style={styles.input}
                placeholderTextColor={styles.inputPlaceholder.color} autoCapitalize="none" onChangeText={text => setPassword(text)} />
            </>}
          </View> :
          <View style={styles.middleCarousel}>
            {Platform.OS !== "web" ? <Carousel
              style={styles.middleCarousel}
              {...{ vertical: false, width: Dimensions.get("window").width, height: Dimensions.get("window").width }}
              loop autoPlay withAnimation={{ type: "spring", config: { damping: 15 } }}
              autoPlayInterval={2000} data={data?.index.cards} renderItem={({ index, animationValue }) => (
                <Card animationValue={animationValue} index={index} data={data?.index.cards} />
              )} /> : null}
          </View>}
      {!loading ? <View style={styles.bottom}>
        {show === "register" ? <>
          <ButtonWeb text={locale.register} action={handleRegister} />
          <ButtonWeb text={locale.cancel} action={() => handlePress("cancel")} />
        </> :
          show === "login" ? <>
            <ButtonWeb text={locale.login} action={handleLogin} />
            <ButtonWeb text={locale.cancel} action={() => handlePress("cancel")} />
          </> :
            <>
              <ButtonWeb text={locale.login} action={() => handlePress("login")} />
              <ButtonWeb text={locale.register} action={() => handlePress("register")} />
            </>}
      </View> : null}
    </KeyboardAvoidingView>
  </GestureHandlerRootView>
}

export default Page