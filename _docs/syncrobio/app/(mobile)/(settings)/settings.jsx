/** Expo & React */
import { useEffect, useState, useContext } from "react"
import { StyleSheet, View, Text, ScrollView, Image } from "react-native"
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"
/** Firebase */
import { signOut } from "firebase/auth"
import { auth } from "../../../configs/firebase"
/** Configs */
import ThemeContext from "../../../configs/themes"
import { settings } from "../../../configs/services"
import storage from "../../../configs/storage"
/** Components */
import AccordionSettings from "../../mobile_components/accordion_settings"
import ButtonSettings from "../../mobile_components/button_settings"
import AccordionProfile from "../../mobile_components/accordion_profile"
import logo from "../../../assets/logo.png"

const Page = () => {
  const { theme } = useContext(ThemeContext)
  const [account, setAccount] = useState(null)

  useEffect(() => {
    getAccount()
  }, [])

  const getAccount = async () => {
    const userData = await storage.get("account")
    setAccount(userData)
  }

  const handleSignOut = async () => {
    try {
      const deleted = await storage.delete("account")
      deleted && await signOut(auth)
    } catch (error) {
      console.log(error)
    }
  }

  const styles = StyleSheet.create({
    accordion: {
      marginTop: 10,
    },
    buttonRow: {
      flexDirection: "row",
      justifyContent: "space-evenly",
      marginTop: 10
    },
    drawerVersionContainer: {
      flexDirection: "row",
      justifyContent: "left",
      paddingHorizontal: 10,
      paddingVertical: 10
    },
    drawerLogoImage: {
      width: 24,
      height: 24,
      marginTop: 3
    },
    drawerLogoTextSyncro: {
      color: theme.secondary,
      fontSize: 24,
    },
    drawerLogoTextBio: {
      color: theme.secondaryRed,
      fontSize: 24,
      fontWeight: "bold"
    },
    drawerRegisteredTrademark: {
      color: theme.secondary,
    },
    drawerVersionNumber: {
      color: theme.secondary,
      marginTop: 4,
      fontStyle: "italic"
    },
  })

  return <View style={{ flex: 1, backgroundColor: theme.clear }}>
    <ScrollView>
      <AccordionProfile settings={settings.profile} account={account} />
      <View style={styles.buttonRow}>
        <ButtonSettings title="Contact" icon={<Ionicons name="paper-plane-outline" size={24} color={theme.invert} />} />
        <ButtonSettings title="Notifications" icon={<Ionicons name="mail-unread-outline" size={24} color={theme.invert} />} />
        <ButtonSettings title="Sign Out" icon={<Ionicons name="log-out-outline" size={24} color={theme.invert} />} action={handleSignOut} />
      </View>
      <View style={styles.accordion}>
        {settings.menu.map(setting => <AccordionSettings key={setting.name} setting={setting} />)}
      </View>
    </ScrollView>
    <View style={styles.drawerVersionContainer}>
      <Image source={logo} style={styles.drawerLogoImage} resizeMode="contain" />
      <Text style={styles.drawerLogoTextSyncro}>Syncro</Text><Text style={styles.drawerLogoTextBio}>Bio</Text>
      <MaterialCommunityIcons name="registered-trademark" style={styles.drawerRegisteredTrademark} />
      <Text style={styles.drawerVersionNumber}>version 1.0.1</Text>
    </View>
  </View>
}

export default Page