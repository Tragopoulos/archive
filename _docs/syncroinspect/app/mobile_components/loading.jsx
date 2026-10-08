/** React & Expo */
import { useEffect, useRef, useContext } from "react"
import { StyleSheet, Platform, Animated, View } from "react-native"
/** Configs */
import ThemeContext, { alpha } from "../../configs/themes"
/** Components */
import logo from "../../assets/icons/icon.png"

const Loading = () => {
  const { theme } = useContext(ThemeContext)
  const fadeAnim = useRef(new Animated.Value(1)).current

  const styles = StyleSheet.create({
    loading: {
      width: "100%",
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.clear + alpha[90],
      position: "absolute",
    },
    spinner: {
      width: 100,
      height: 100,
    },
  })

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(
          fadeAnim,
          {
            toValue: 0.1,
            duration: 1000,
            useNativeDriver: Platform.OS !== "web",
          }
        ),
        Animated.timing(
          fadeAnim,
          {
            toValue: 1,
            duration: 1000,
            useNativeDriver: Platform.OS !== "web",
          }
        )
      ])
    ).start()
  }, [fadeAnim])

  return (
    <View style={styles.loading}>
      <Animated.Image source={logo} style={{ ...styles.spinner, opacity: fadeAnim }} />
    </View>
  )
}



export default Loading
