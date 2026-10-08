/** Expo & React */
import { useContext } from "react"
import { StyleSheet, View, Text } from "react-native"
/** Configs */
import ThemeContext, { alpha } from "../../configs/themes"
import ButtonAction from "./button_action"
import mock from "../../configs/mock.json"
import { request } from "../../configs/services"
import storage from "../../configs/storage"
import { Octicons, MaterialCommunityIcons } from "@expo/vector-icons"

const BannerVerification = ({ setLoading, setAccount }) => {
  const { theme } = useContext(ThemeContext)

  const styles = StyleSheet.create({
    banner: {
      backgroundColor: theme.primaryRed + alpha[50],
      borderRadius: 10,
      marginHorizontal: 10,
      marginBottom: 10,
      padding: 16
    },
    text: {
      color: theme.invert,
      paddingBottom: 10
    },
    actionButtons: {
      paddingTop: 10,
      flexDirection: "row",
      justifyContent: "center",
      gap: 10,
    }
  })

  const handleVerificationCheck = async () => {
    setLoading(true)
    const response = await request("GET", "account", null)
    const saved = await storage.set("settings", response)
    saved && setAccount(response)
    saved && setLoading(false)
  }

  const handleVerificationResend = async () => {
    setLoading(true)
    const response = await request("POST", "logs", { operation: "EXEC02R" })
    console.log("Reverified Pressed")
    setLoading(false)
  }

  return <View style={styles.banner}>
    {mock?.verification.map((line, index) => <Text key={"ver_" + index} style={styles.text}>{line}</Text>)}
    <View style={styles.actionButtons}>
      <ButtonAction action={handleVerificationResend} text="Resend" color={theme.black} stroke={theme.white} fill={theme.white}
        icon={<MaterialCommunityIcons name="email-sync-outline" />} />
      <ButtonAction action={handleVerificationCheck} text="Check" color={theme.black} stroke={theme.white} fill={theme.white}
        icon={<Octicons name="verified" />} />
    </View>
  </View>
}

export default BannerVerification