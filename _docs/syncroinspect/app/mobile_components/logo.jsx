import { useContext } from "react"
import { StyleSheet, View, Text, Image } from "react-native"
import ThemeContext from "../../configs/themes"
import logo from "../../assets/icons/app.png"

const BASE_SIZE = 40

const Logo = ({ scale = 1 }) => {
  const { theme } = useContext(ThemeContext)

  const scaledSize = BASE_SIZE * scale

  const styles = StyleSheet.create({
    logoContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 10,
      zIndex: 200,
    },
    logoImage: {
      width: scaledSize,
      height: scaledSize,
      marginRight: 10 * scale,
    },
    drawerLogoTextSyncro: {
      color: theme.logoSecondary,
      fontSize: scaledSize,
      lineHeight: scaledSize,
      fontWeight: "bold",
    },
    drawerLogoTextSocial: {
      color: theme.logoPrimary,
      fontSize: scaledSize,
      lineHeight: scaledSize,
      fontWeight: "bold",
    },
  })

  return (
    <View style={styles.logoContainer}>
      <Image source={logo} style={styles.logoImage} contentFit="contain" />
      <Text style={styles.drawerLogoTextSyncro}>Syncro</Text>
      <Text style={styles.drawerLogoTextSocial}>Social</Text>
    </View>
  )
}

export default Logo
