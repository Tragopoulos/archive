/** React & Expo */
import { StyleSheet, View, Text } from "react-native"
import { Image } from "expo-image"
/** Configs */
import { light } from "../../configs/themes"
/** Assets */
import logo from "../../assets/media/logo.png"

const Logo = () => {

  const styles = StyleSheet.create({
    logoContainer: {
      flexDirection: "row",
      zIndex: 200,
    },
    logo: {
      width: 46,
      height: 46,
      marginRight: 5,
    },
    drawerLogoTextSyncro: {
      color: light.logoBrown,
      fontSize: 40,
      lineHeight: 44,
      fontWeight: "bold"
    },
    drawerLogoTextPet: {
      color: light.logoBlue,
      fontSize: 40,
      lineHeight: 44,
      fontWeight: "bold"
    },
  })

  return <View style={styles.logoContainer}>
    <Image source={logo} style={styles.logo} />
    {/* <Text style={styles.logoText}>SyncroPet</Text> */}
    <Text style={styles.drawerLogoTextSyncro}>Syncro</Text><Text style={styles.drawerLogoTextPet}>Pet</Text>
  </View>
}

export default Logo