import { light, alpha } from "../../themes/colors"
import { useRef } from "react"
import { StyleSheet, Animated, Text, Pressable } from "react-native"

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

const ButtonModal = ({ action, text }) => {
  const scaleValue = useRef(new Animated.Value(1)).current

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.98,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start(() => action())
  }

  return <AnimatedPressable onPress={handlePress} style={[styles.modalButtonShell, { transform: [{ scale: scaleValue }] }]}>
    <Text style={styles.modalButtonText}>{text}</Text>
  </AnimatedPressable>
}

export default ButtonModal

const styles = StyleSheet.create({
  modalButtonShell: {
    flex: 1,
    backgroundColor: light.ternary + alpha[50],
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
    marginHorizontal: 1
  },
  modalButtonText: {
    color: light.ternary,
  },
})