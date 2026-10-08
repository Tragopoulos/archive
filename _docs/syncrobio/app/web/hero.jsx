import { light, alpha } from "../../configs/themes"
import { StyleSheet, Platform, Dimensions, useWindowDimensions, Text, View, ImageBackground } from "react-native"
import { useRouter } from "expo-router"
import Logo from "./logo"
import Carousel from "react-native-reanimated-carousel"
import Card from "./carousel_card"
import ButtonWeb from "../web/button_web"
import aImageLandscape from "../../assets/images/prod_landscape_a.jpeg"
import aImagePortrait from "../../assets/images/prod_portrait_a.jpeg"

const Hero = ({ data }) => {
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
    <Text style={styles.subtitle}>{data?.hero_title}</Text>
    {Platform.OS !== "web" ? <Carousel {...{ vertical: false, width: carouselWidth, height: carouselHeight }}
      loop autoPlay withAnimation={{ type: "spring", config: { damping: 17 } }}
      autoPlayInterval={2000} data={data?.cards}
      renderItem={({ index, animationValue }) => (
        <Card animationValue={animationValue} index={index} data={data?.cards} />
      )}
    /> : null}
    <View style={[styles.buttonContainer, { width: Platform.OS === "web" ? (windowDimensions.width < 800 ? "90%" : 700) : "95%" }]}>
      <ButtonWeb text={"Login"} action={() => handlePress("/login")} />
      <ButtonWeb text={"Register"} action={() => handlePress("/register")} />
    </View>
  </View>
}

export default Hero

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
    justifyContent: Platform.OS === "web" ? "space-between" : "center",
    flexDirection: Platform.OS === "web" ? "row" : "column",
    marginTop: 40,
    height: 60,
    marginHorizontal: "auto",
  },
})