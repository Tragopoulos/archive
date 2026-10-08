import { useRef, useContext } from "react"
import { StyleSheet, Platform, Animated, View, Text, Pressable, ImageBackground } from "react-native"
import { light, alpha } from "../../configs/themes"
import { Octicons } from "@expo/vector-icons"
/** Configs */
import LocaleContext from "../../configs/locales"

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

const ButtonImage = ({ theme, selected, action }) => {
  const { locale } = useContext(LocaleContext)
  const opacity = useRef(new Animated.Value(1)).current

  const styles = StyleSheet.create({
    pressable: {
      height: 150,
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
      backgroundColor: light.invert + alpha[50],
    },
    textContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 10,
    },
    text: {
      color: light.clear,
      fontSize: 24,
      fontWeight: "bold",
      padding: 10,
    }
  })

  const onPress = () => {
    if (!selected) {
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.5,
          duration: 200,
          useNativeDriver: Platform.OS !== "web",
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: Platform.OS !== "web",
        }),
      ]).start(() => action())
    }
  }

  return <AnimatedPressable onPress={onPress} style={[{ opacity: opacity }, styles.pressable]}>
    <ImageBackground source={theme.image} style={styles.backgroundImage}>
      {theme.overlay ? <View style={styles.overlay} /> : null}
    </ImageBackground>
    <View style={styles.textContainer}>
      <Text style={styles.text}>{locale[theme.name]}</Text>
      {selected ? <Octicons name="verified" style={styles.text} /> : null}
    </View>
  </AnimatedPressable>
}

export default ButtonImage