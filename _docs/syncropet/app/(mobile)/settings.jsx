/** React & Expo */
import { useEffect, useState, useContext } from "react"
import { StyleSheet, View, Text, ScrollView } from "react-native"
import { Image } from "expo-image"
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"
/** Firebase */
import { signOut } from "firebase/auth"
import { auth } from "../../configs/firebase"
/** Configs */
import ThemeContext from "../../configs/themes"
import LocaleContext from "../../configs/locales"
import storage from "../../configs/storage"
import { features } from "../../configs/features"
/** Components */
import AccordionAccount from "../components/accordion_account"
import ButtonSettings from "../components/button_settings"
import AccordionSettings from "../components/accordion_settings"
import logo from "../../assets/media/logo.png"

const Page = () => {
  const { theme } = useContext(ThemeContext)
  const { locale } = useContext(LocaleContext)
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
      width: 30,
      height: 30,
    },
    drawerLogoTextSyncro: {
      color: theme.logoBrown,
      fontSize: 24,
    },
    drawerLogoTextPet: {
      color: theme.logoBlue,
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
      <AccordionAccount settings={features.profile} account={account} />
      <View style={styles.buttonRow}>
        <ButtonSettings title={locale.contact} icon={<Ionicons name={features.quick_buttons.left.icon} size={24} color={theme.invert} />} />
        <ButtonSettings title={locale.notifications} icon={<Ionicons name={features.quick_buttons.middle.icon} size={24} color={theme.invert} />} />
        <ButtonSettings title={locale.sign_out} icon={<Ionicons name={features.quick_buttons.right.icon} size={24} color={theme.invert} />} action={handleSignOut} />
      </View>
      <View style={styles.accordion}>
        {features.menu.map(setting => <AccordionSettings key={setting.name} setting={setting} />)}
      </View>
    </ScrollView>
    <View style={styles.drawerVersionContainer}>
      <Image source={logo} style={styles.drawerLogoImage} />
      <Text style={styles.drawerLogoTextSyncro}>Syncro</Text><Text style={styles.drawerLogoTextPet}>Pet</Text>
      <MaterialCommunityIcons name="registered-trademark" style={styles.drawerRegisteredTrademark} />
      <Text style={styles.drawerVersionNumber}>version 1.0.1</Text>
    </View>
  </View>
}

export default Page