import { useRef } from "react"
import { StyleSheet, Animated, View, Text, Pressable, ImageBackground } from "react-native"
import { light, alpha } from "../../configs/themes"
import { Octicons } from "@expo/vector-icons"

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

const ButtonImage = ({ theme, selected, action }) => {
  const opacity = useRef(new Animated.Value(1)).current

  const styles = StyleSheet.create({
    pressable: {
      height: 100,
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
      backgroundColor: light.black + alpha[50],
    },
    textContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 10,
    },
    text: {
      color: light.white,
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
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => action())
    }
  }

  return <AnimatedPressable onPress={onPress} style={[{ opacity: opacity }, styles.pressable]}>
    <ImageBackground source={theme.image} style={styles.backgroundImage}>
      {theme.overlay ? <View style={styles.overlay} /> : null}
    </ImageBackground>
    <View style={styles.textContainer}>
      <Text style={styles.text}>{theme.name.charAt(0).toUpperCase() + theme.name.slice(1)}</Text>
      {selected ? <Octicons name="verified" style={styles.text} /> : null}
    </View>
  </AnimatedPressable>
}



export default ButtonImage