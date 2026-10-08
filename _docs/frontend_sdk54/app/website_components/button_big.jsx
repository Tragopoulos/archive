/** React & Expo */
import { useRef, useContext } from "react"
import { StyleSheet, Platform, Animated, Text, Pressable, Image, View } from "react-native"
/** Configs */
import ThemeContext from "../../configs/themes"

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

const ButtonBig = ({ action, text, icon }) => {
  const { theme } = useContext(ThemeContext)
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
      minHeight: 48,
      height: 48,
      backgroundColor: theme.clear,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.invert,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 10,
    },
    buttonContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 20,
      gap: 10,
    },
    buttonText: {
      color: theme.invert,
      fontWeight: "500",
      fontSize: 18,
    },
    imageWrapper: {
      height: 24,
      width: 24,
      overflow: "hidden",
      alignItems: "center",
      justifyContent: "center",
    },
    image: {
      height: 24,
    },
  })

  return <AnimatedPressable style={[styles.buttonShell, { opacity: opacityValue }]} onPress={handlePress}>
    <View style={styles.buttonContent}>
      <View style={styles.imageWrapper}>
        <Image style={styles.image} source={icon} resizeMode="contain" />
      </View>
      <Text style={styles.buttonText}>{text}</Text>
    </View>
  </AnimatedPressable>
}

export default ButtonBig