import { light, alpha } from "../configs/themes"
import { StyleSheet, Platform, Dimensions, useWindowDimensions, Text, View, ImageBackground } from "react-native"
import { useRouter } from "expo-router"
import Logo from "./components/logo"
import ButtonWeb from "./components/button_web"
import aImageLandscape from "../assets/media/prod_landscape_a.jpg"
import aImagePortrait from "../assets/media/prod_portrait_a.jpg"

const Page = () => {
  const router = useRouter()
  const windowDimensions = useWindowDimensions()
  const { width: carouselWidth, width: carouselHeight } = Dimensions.get("window")

  const handlePress = route => router.push(route)

  return <View style={styles.containerHero}>
    <ImageBackground style={styles.backgroundImage}
      source={Platform.OS === "web" ? windowDimensions.width < 500 ? aImagePortrait : aImageLandscape : aImagePortrait}>
      <View style={styles.overlay} />
    </ImageBackground>
    <Logo />
    <Text style={styles.subtitle}>Thank you for verifying your email address.</Text>
    <Text style={styles.subtitle}>You are ready to use the application now.</Text>
    <Text style={styles.subtitle}>Please press the button below to go to your dashboard.</Text>
    <View style={[styles.buttonContainer, { width: Platform.OS === "web" ? (windowDimensions.width < 800 ? "90%" : 700) : "95%" }]}>
      <ButtonWeb text={"Go to Dashboard"} action={() => handlePress("/")} />
    </View>
  </View>
}

export default Page

const styles = StyleSheet.create({
  containerHero: {
    width: "100%",
    height: Dimensions.get("window").height,
    justifyContent: "center",
    alignItems: "center",
    flex: Platform.OS !== "web" && 1,
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
    backgroundColor: light.black + alpha[70],
  },
  subtitle: {
    textAlign: "center",
    paddingHorizontal: 20,
    color: light.ternary,
    fontSize: 26,
  },
  buttonContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    height: 60,
    marginHorizontal: "auto",
  },
})