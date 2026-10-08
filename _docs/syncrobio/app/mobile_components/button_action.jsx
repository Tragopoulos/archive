/** Expo & React */
import { cloneElement, useRef } from "react"
import { StyleSheet, Animated, Text, Pressable } from "react-native"

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

const ButtonAction = ({ action, text, color, stroke, fill, icon }) => {
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
    }
  })

  const handleOnPress = () => {
    Animated.sequence([
      Animated.timing(profileOpacity, {
        toValue: 0.6,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(profileOpacity, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => action())
  }

  return <AnimatedPressable style={[styles.shell, { opacity: profileOpacity, borderColor: stroke, backgroundColor: fill }]} onPress={handleOnPress}>
    {icon && cloneElement(icon, { style: [styles.icon, { color: color }] })}
    <Text style={[styles.text, { color: color }]}>{text}</Text>
  </AnimatedPressable >
}

export default ButtonAction