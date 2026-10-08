/** React & Expo */
import { useContext } from "react"
import { StyleSheet, View, Text, ImageBackground } from "react-native"
import { Octicons, MaterialCommunityIcons } from "@expo/vector-icons"
/** Configs */
import { light } from "../../configs/themes"
import { request } from "../../configs/services"
import storage from "../../configs/storage"
/** Components */
import ButtonAction from "./button_action"
/** Assets */
import bgImage from "../../assets/media/verification_bg.jpg"

const BannerVerification = ({ setAccount, setVerified, setLoading }) => {

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
    },
    bgImage: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
    },
    banner: {
      backgroundColor: light.primaryBlue,
      borderRadius: 10,
      marginHorizontal: 10,
      marginBottom: 10,
      padding: 20
    },
    text: {
      color: light.clear,
      paddingBottom: 15
    },
    actionButtons: {
      paddingTop: 15,
      flexDirection: "row",
      justifyContent: "center",
      gap: 20,
    }
  })

  const handleVerificationCheck = async () => {
    setLoading(true)
    const response = await request("GET", "account", null)
    response?.data.verified && setAccount(response)
    response?.data.verified && await storage.set("account", response)
    response?.data.verified && setVerified(response?.data.verified)
    setLoading(false)
  }

  const handleVerificationResend = async () => {
    setLoading(true)
    const response = await request("PUT", "email_verification", null)
    response && setLoading(false)
  }

  const verification = [
    "Dear User,",
    "Thank you for registering to SyncroPet.",
    "For the purpose of account security, we have sent a verification email to your registered email address. This email contains a unique link that will confirm your account.",
    "In case you do not find the email in your inbox, we recommend checking your spam or junk folder as it may have been directed there. If the email is not located in these folders, you may need to request a new verification email by clicking the button below.",
    "Upon successful verification of your account, you will gain full access to the app and its features. In the meantime, we encourage you to explore the app and familiarize yourself with its functionality.",
    "Thank you for choosing SyncroPet. We are committed to providing you with the best service possible."
  ]

  return <View style={styles.container}>
    <ImageBackground style={styles.bgImage} source={bgImage} />
    <View style={styles.banner}>
      {verification.map((line, index) => <Text key={"ver_" + index} style={styles.text}>{line}</Text>)}
      <View style={styles.actionButtons}>
        <ButtonAction action={handleVerificationResend} text="Resend" color={light.clear} stroke={light.logoBlue} fill={light.logoBlue}
          icon={<MaterialCommunityIcons name="email-sync-outline" />} />
        <ButtonAction action={handleVerificationCheck} text="Check" color={light.clear} stroke={light.logoBlue} fill={light.logoBlue}
          icon={<Octicons name="verified" />} />
      </View>
    </View>
  </View>

}

export default BannerVerification

