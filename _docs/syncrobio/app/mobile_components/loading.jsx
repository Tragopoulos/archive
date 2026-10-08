/** Expo & React */
import { useEffect, useRef, useContext } from "react"
import { StyleSheet, Animated, View } from "react-native"
/** Configs */
import ThemeContext, { alpha } from "../../configs/themes"
/** Components */
import logo from "../../assets/logo.png"

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
      width: 50,
      height: 50,
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
            useNativeDriver: true,
          }
        ),
        Animated.timing(
          fadeAnim,
          {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }
        )
      ])
    ).start()
  }, [fadeAnim])

  return (
    <View style={styles.loading}>
      <Animated.Image source={logo} style={{ ...styles.spinner, opacity: fadeAnim }} resizeMode="contain" />
    </View>
  )
}



export default Loading
