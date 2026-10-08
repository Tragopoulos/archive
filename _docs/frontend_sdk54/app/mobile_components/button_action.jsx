/** React & Expo */
import { cloneElement, useRef } from "react"
import { StyleSheet, Platform, Animated, Text, Pressable } from "react-native"

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

const ButtonAction = ({ action, text, color, stroke, fill, icon, disabled }) => {
  const profileOpacity = useRef(new Animated.Value(1)).current

  const styles = StyleSheet.create({
    shell: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      width: "40%",
      paddingVertical: 10,
      borderRadius: 10,
    },
    icon: {
      fontSize: 20,
      paddingRight: 5,
    },
    text: {
      fontWeight: "bold"
    }
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

  return <>
    <AnimatedPressable disabled={disabled} style={[styles.shell, { opacity: profileOpacity, borderColor: stroke, backgroundColor: fill }]} onPress={handleOnPress}>
      {icon && cloneElement(icon, { style: [styles.icon, { color: color }] })}
      <Text style={[styles.text, { color: color }]}>{text}</Text>
    </AnimatedPressable >
  </>
}

export default ButtonAction