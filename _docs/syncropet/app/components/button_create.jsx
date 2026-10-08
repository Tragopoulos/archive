/** React & Expo */
import { cloneElement, useRef, useContext } from "react"
import { StyleSheet, Platform, Animated, Text, Pressable, View } from "react-native"
/** Configs */
import ThemeContext from "../../configs/themes"

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

const ButtonCreate = ({ action, color, stroke, fill, icon, disabled }) => {
  const { theme } = useContext(ThemeContext)
  const profileOpacity = useRef(new Animated.Value(1)).current

  const styles = StyleSheet.create({
    shell: {
      position: "absolute",
      bottom: 20,
      right: 20,
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: theme.primaryBlue,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: theme.primaryBlue,
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowOpacity: 0.5,
      shadowRadius: 5,
      elevation: 10,
    },
    icon: {
      fontSize: 42,
      color: theme.clear,
    },
  })

  const handleOnPress = () => {
    Animated.sequence([
      Animated.timing(profileOpacity, {
        toValue: 0.6,
        duration: 100,
        useNativeDriver: Platform.OS !== "web",
      }),
      Animated.timing(profileOpacity, {
        toValue: 1,
        duration: 100,
        useNativeDriver: Platform.OS !== "web",
      }),
    ]).start(() => action())
  }

  return <AnimatedPressable disabled={disabled} style={[styles.shell, { opacity: profileOpacity, borderColor: stroke, backgroundColor: fill }]} onPress={handleOnPress}>
    {icon && cloneElement(icon, { style: [styles.icon, { color: color }] })}
  </AnimatedPressable >
}

export default ButtonCreate