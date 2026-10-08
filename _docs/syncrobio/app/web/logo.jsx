import { StyleSheet, View, Image, Text } from "react-native"
import { light } from "../../themes/colors"
import logo from "../../assets/logo.png"

const Logo = () => {

  return <View style={styles.logoContainer}>
    <Image source={logo} style={styles.logo} />
    <Text style={styles.logoText}>SyncroBio</Text>
  </View>
}

export default Logo

const styles = StyleSheet.create({
  logoContainer: {
    flexDirection: "row",
    zIndex: 200,
    marginBottom: 20,
  },
  logo: {
    width: 46,
    height: 46,
    marginRight: 5,
  },
  logoText: {
    color: light.ternary,
    fontSize: 40,
    lineHeight: 42,
  },
})