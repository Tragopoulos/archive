/** React & Expo */
import { useRef } from "react"
import { StyleSheet, Platform, Animated, Text, Pressable } from "react-native"
/** Configs */
import { light } from "../../configs/themes"

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

const ButtonWeb = ({ action, text }) => {
  const opacityValue = useRef(new Animated.Value(1)).current

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(opacityValue, {
        toValue: 0.6,
        duration: 1,
        useNativeDriver: Platform.OS !== "web",
      }),
      Animated.timing(opacityValue, {
        toValue: 1,
        duration: 1,
        useNativeDriver: Platform.OS !== "web",
      }),
    ]).start(() => action())
  }

  const styles = StyleSheet.create({
    buttonShell: {
      width: "100%",
      maxWidth: 500,
      backgroundColor: light.logoBlue,
      borderRadius: 10,
      alignItems: "center",
      marginTop: 10,
    },
    buttonText: {
      color: light.clear,
      fontWeight: "bold",
      fontSize: 18,
      padding: 15,
    },
  })

  return <AnimatedPressable style={[styles.buttonShell, { opacity: opacityValue }]} onPress={handlePress}>
    <Text style={styles.buttonText}>{text}</Text>
  </AnimatedPressable>
}

export default ButtonWeb

