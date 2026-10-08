/** React & Expo */
import { useState, useContext, useEffect } from "react"
import { Platform, StyleSheet, KeyboardAvoidingView, ScrollView, View, Text, TextInput, Button, Pressable, Alert } from "react-native"
import { Image } from "expo-image"
import { useRouter, useLocalSearchParams } from "expo-router"
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context"
/** Configs */
import storage from "../../configs/storage"
import { request } from "../../configs/services"
import ThemeContext, { alpha } from "../../configs/themes"
import LocaleContext from "../../configs/locales"
/** Components */
import ButtonAction from "../components/button_action"
import Loading from "../components/loading"
import ModalCalendar from "../components/modal_calendar"
import TextArea from "../components/textarea"
import ImageSelector from "../components/image_selector"
import Dropdown from "../components/dropdown"

const Page = () => {
  const { theme } = useContext(ThemeContext)
  const { locale } = useContext(LocaleContext)
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState()
  const { id } = useLocalSearchParams()
  /** Image Picker */
  const [blob, setBlob] = useState("")
  const [photo, setPhoto] = useState("")
  const [photoName, setPhotoName] = useState("")
  const [photoType, setPhotoType] = useState("")
  /** Form */
  const [name, setName] = useState("")
  const [gender, setGender] = useState("")
  const [kind, setKind] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [bio, setBio] = useState("")

  const optionsGender = [
    { value: "male", label: locale.male },
    { value: "female", label: locale.female },
    { value: "none", label: "-" },
  ]

  const optionsKind = [
    { value: "other", label: locale.other },
    { value: "cat", label: locale.cat },
    { value: "dog", label: locale.dog },
    { value: "bird", label: locale.bird },
    { value: "fish", label: locale.fish },
    { value: "rabbit", label: locale.rabbit },
    { value: "hamster", label: locale.hamster },
    { value: "turtle", label: locale.turtle },
    { value: "reptilian", label: locale.reptilian },
  ]

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
      backgroundColor: theme.clear
    },
    keyboardAvoidingView: {
      flex: 1,
    },
    scrollView: {
      backgroundColor: theme.clear,
    },
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
    input: {
      backgroundColor: theme.ternary,
      color: theme.invert,
      padding: 15,
      borderRadius: 10,
      margin: 10,
    },
    deleteButton: {
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
    },
  })

  useEffect(() => {
    getProfile()
  }, [])

  const getProfile = async () => {
    /** Gets the profiles from the storage */
    const profiles = await storage.get("profiles")
    /** Find the profile with the matching id */
    const data = profiles.find(profile => profile.id === id)
    /** Sets the profile */
    setName(data.profile.NAME)
    const selectedGender = optionsGender.find(option => option.value === data.profile.GENDER)
    setGender(selectedGender.label)
    const selectedKind = optionsKind.find(option => option.value === data.profile.KIND)
    setKind(selectedKind.label)
    const date = new Date(data.profile.DOB * 1000)
    const dateString = date.toISOString().split('T')[0]
    setDateOfBirth({ dateString })
    setBio(data.profile.BIO)
    setPhoto(data.profile.AVATAR)
  }

  const handleCancel = async () => router.back()

  const handleApprove = async () => {
    setName(name.trim())
    setBio(bio.trim())

    if (name === "" || gender === "" || kind === "") {
      Alert.alert(locale.error_occurred, locale.missing_fields, [{ text: locale.close, onPress: () => console.log("Closed Press") }])
    } else {
      setLoading(true)
      /** Profile Photo */
      const file = blob !== "" ? blob : null
      /** Body of the request */
      const body = { name, gender, kind, dateOfBirth: dateOfBirth.timestamp / 1000, bio, photoName, photoType }
      /** Requests the profile update */
      const response = await request("POST", "profile", body, file)
      /** If the request was successful, updates the account in the local storage */
      if (response.status === 201) {
        /** Hides the loading page */
        setLoading(false)
        /** Exits the screen */
        setTimeout(() => router.back(), 500)
      } else {
        setLoading(false)
        Alert.alert(locale.update_error_title, locale.update_error_message_profile, [{ text: locale.close, onPress: () => console.log("Closed Press") }])
      }
    }
  }

  const handleDelete = async () => {
    //TODO: Create an alert to confirm the deletion
    /** Requests the profile deletion */
    // once deleted router back
    console.log(id)
    setTimeout(() => router.back(), 500)
  }

  return <SafeAreaProvider style={styles.safeArea}>
    <KeyboardAvoidingView style={styles.keyboardAvoidingView} behavior={Platform.OS === "ios" && "padding"}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>{locale.edit_profile}</Text>
        <ImageSelector {...{ photo, setPhoto, setPhotoName, setPhotoType, setBlob }} />
        <TextInput placeholder={locale.name + " *"} style={styles.input} placeholderTextColor={theme.invert + alpha[40]}
          autoCapitalize="words" maxLength={40} value={name} onChangeText={text => setName(text)} />
        <Dropdown data={optionsKind} onChange={({ value }) => setKind(value)} placeholder={locale.kind + " *"} value={kind} setValue={setKind} />
        <Dropdown data={optionsGender} onChange={({ value }) => setGender(value)} placeholder={locale.gender + " *"} value={gender} setValue={setGender} />
        <ModalCalendar future={false} date={dateOfBirth} setDate={setDateOfBirth} />
        <TextArea placeholder={locale.bio} maxLength={1000} value={bio} onChangeText={setBio} />
        <View style={styles.deleteButton}>
          <ButtonAction action={handleDelete} text={locale.delete_profile} color={theme.secondaryRed} stroke={theme.clear} fill={theme.clear} />
        </View>
      </ScrollView>
      <View style={styles.approvalButtons}>
        <ButtonAction action={handleCancel} text={locale.cancel} color={theme.white} stroke={theme.secondaryRed} fill={theme.secondaryRed} />
        <ButtonAction action={handleApprove} text={locale.save} color={theme.white} stroke={theme.secondaryBlue} fill={theme.secondaryBlue} />
      </View>
      {loading && <Loading />}
    </KeyboardAvoidingView>
  </SafeAreaProvider>
}

export default Page
