import { light, alpha } from "../../themes/colors"
import { useRef } from "react"
import { StyleSheet, Platform, Animated, Text, Pressable } from "react-native"

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

const ButtonWeb = ({ action, text }) => {
  const opacityValue = useRef(new Animated.Value(1)).current

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(opacityValue, {
        toValue: 0.6,
        duration: 1,
        useNativeDriver: true,
      }),
      Animated.timing(opacityValue, {
        toValue: 1,
        duration: 1,
        useNativeDriver: true,
      }),
    ]).start(() => action())
  }

  return <AnimatedPressable style={[styles.buttonShell, { opacity: opacityValue }]} onPress={handlePress}>
    <Text style={styles.buttonText}>{text}</Text>
  </AnimatedPressable>
}

export default ButtonWeb

const styles = StyleSheet.create({
  buttonShell: {
    width: Platform.OS === "web" ? "49%" : "100%",
    backgroundColor: light.secondary + alpha[90],
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 8,
  },
  buttonText: {
    color: "#d8e2ef",
    fontSize: 20,
    padding: 12,
  },
})