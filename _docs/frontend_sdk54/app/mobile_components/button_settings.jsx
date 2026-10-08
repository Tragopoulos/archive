import { StyleSheet, Platform, Animated, Text, Pressable } from "react-native"
import { useRef, useContext } from "react"
import ThemeContext from "../../configs/themes"

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

const ButtonSettings = ({ title, icon, action }) => {
  const { theme } = useContext(ThemeContext)
  const opacity = useRef(new Animated.Value(1)).current

  const styles = StyleSheet.create({
    shell: {
      width: "30%",
      height: 100,
      backgroundColor: theme.ternary,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 10
    },
    text: {
      paddingTop: 10,
      color: theme.invert
    },
  })

  const profilePressed = () => {
    Animated.sequence([
      Animated.timing(opacity, {
        toValue: 0.2,
        duration: 100,
        useNativeDriver: Platform.OS !== "web",
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 100,
        useNativeDriver: Platform.OS !== "web",
      }),
    ]).start(() => action())
  }

  return <AnimatedPressable style={[styles.shell, { opacity: opacity }]} onPress={profilePressed}>
    {icon}
    <Text style={styles.text}>{title}</Text>
  </AnimatedPressable>
}



export default ButtonSettings