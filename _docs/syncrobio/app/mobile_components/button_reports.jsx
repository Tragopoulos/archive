import { light, dark, alpha } from "../../themes/colors"
import { Pressable, StyleSheet, Animated, Text } from "react-native"
import { useRef } from "react"
import { Ionicons } from "@expo/vector-icons"

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

const ButtonReports = ({ icon, title, buttonAction }) => {
  const opacity = useRef(new Animated.Value(1)).current

  const handlePress = () => {
    buttonAction()
    Animated.sequence([
      Animated.timing(opacity, {
        toValue: 0.2,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => console.log("button 1 pressed"))
  }

  return <AnimatedPressable style={[{ opacity: opacity }, styles.shell]} onPress={handlePress}>
    {icon ? <Ionicons name={icon} style={styles.icon} /> : null}
    {title ? <Text>{title}</Text> : null}
  </AnimatedPressable>
}

const styles = StyleSheet.create({
  shell: {
    backgroundColor: light.white,
    width: 50,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    margin: 5
  },
  icon: {
    fontSize: 24,
    color: light.primary,
  },
})

export default ButtonReports