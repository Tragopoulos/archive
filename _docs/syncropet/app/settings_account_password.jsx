/** React & Expo */
import { useEffect, useState, useContext } from "react"
import { StyleSheet, ScrollView, View, Text, TextInput, Pressable, Alert } from "react-native"
import { useRouter } from "expo-router"
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
/** Firebase */
import { auth } from "../configs/firebase"
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth"
/** Configs */
import storage from "../configs/storage"
import { request } from "../configs/services"
import ThemeContext, { alpha } from "../configs/themes"
import LocaleContext from "../configs/locales"
/** Components */
import ButtonAction from "./components/button_action"
import ButtonImage from "./components/button_image"
import Loading from "./components/loading"

const Page = () => {
  const { theme } = useContext(ThemeContext)
  const { locale } = useContext(LocaleContext)
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const insets = useSafeAreaInsets()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState()
  const [showNewPassword, setShowNewPassword] = useState()
  const [showConfirmPassword, setShowConfirmPassword] = useState()
  const [match, setMatch] = useState()

  const styles = StyleSheet.create({
    approvalButtons: {
      backgroundColor: theme.clear,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 30,
      paddingTop: 10,
      paddingBottom: 10,
    },
    title: {
      fontSize: 20,
      fontWeight: "bold",
      paddingLeft: 20,
      color: theme.invert
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.ternary,
      color: theme.invert,
      padding: 15,
      borderRadius: 10,
      margin: 10,
    },
    input: {
      flex: 1,
      paddingRight: 30,
      color: theme.invert,
    },
    iconButton: {
      position: "absolute",
      right: 10,
      fontSize: 24,
    },
  })

  useEffect(() => {
    setMatch(newPassword.length > 5 && newPassword === confirmPassword)
  }, [newPassword, confirmPassword])

  const handleCancel = async () => router.back()

  const handleApprove = async () => {
    setLoading(true)
    /** Requests the password update */
    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword)
      const reauth = await reauthenticateWithCredential(auth.currentUser, credential)
      if (reauth) {
        await updatePassword(auth.currentUser, newPassword)
        setTimeout(() => router.back(), 500)
        setLoading(false)
      }
    } catch (error) {
      //TODO: Handle error
      console.log(error)
      setLoading(false)
      Alert.alert("Error", "Requires recent login", [{ text: "Close", onPress: () => { } }])
    }
  }

  return <SafeAreaProvider style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom, backgroundColor: theme.clear }}>
    <View style={{ flex: 1, backgroundColor: theme.clear }}>
      <ScrollView style={{ backgroundColor: theme.clear }}>
        <Text style={styles.title}>{locale.change_password}</Text>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder={locale.current_password}
            style={styles.input}
            placeholderTextColor={theme.invert + alpha[40]}
            autoCapitalize="none"
            value={currentPassword}
            onChangeText={text => setCurrentPassword(text)}
            secureTextEntry={!showCurrentPassword}
          />
          <Pressable style={styles.iconButton} onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
            <Ionicons name={showCurrentPassword ? "eye" : "eye-off"} size={24} color={theme.invert} />
          </Pressable>
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder={locale.new_password}
            style={styles.input}
            placeholderTextColor={theme.invert + alpha[40]}
            autoCapitalize="none"
            value={newPassword}
            onChangeText={text => setNewPassword(text)}
            secureTextEntry={!showNewPassword}
          />
          <Pressable style={styles.iconButton} onPress={() => setShowNewPassword(!showNewPassword)}>
            <Ionicons name={showNewPassword ? "eye" : "eye-off"} size={24} color={theme.invert} />
          </Pressable>
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder={locale.confirm_password}
            style={styles.input}
            placeholderTextColor={theme.invert + alpha[40]}
            autoCapitalize="none"
            value={confirmPassword}
            onChangeText={text => setConfirmPassword(text)}
            secureTextEntry={!showConfirmPassword}
          />
          <Pressable style={styles.iconButton} onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
            <Ionicons name={showConfirmPassword ? "eye" : "eye-off"} size={24} color={theme.invert} />
          </Pressable>
        </View>
        {!match ? <Text style={{ paddingLeft: 20, color: theme.invert }}>{locale.error_password}</Text> : null}
      </ScrollView>
      <View style={styles.approvalButtons}>
        <ButtonAction action={handleCancel} text="Cancel" color={theme.white} stroke={theme.secondaryRed} fill={theme.secondaryRed} />
        <ButtonAction action={handleApprove} text="Save" disabled={!match} color={!match ? theme.clear : theme.white}
          stroke={!match ? theme.clear : theme.secondaryBlue} fill={!match ? theme.clear : theme.secondaryBlue} />
      </View>
      {loading && <Loading />}
    </View>
  </SafeAreaProvider>

}

export default Page