/** React & Expo */
import { useEffect, useState, useContext } from "react"
import { Platform, StyleSheet, KeyboardAvoidingView, ScrollView, View, Text, TextInput, Alert } from "react-native"
import { useRouter } from "expo-router"
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context"
/** phone */
// import PhoneInput, { getCountryByPhoneNumber } from "react-native-international-phone-number"
/** Configs */
import storage from "../configs/storage"
import { request } from "../configs/services"
import ThemeContext, { alpha } from "../configs/themes"
import LocaleContext from "../configs/locales"
/** Components */
import ButtonAction from "./mobile_components/button_action"
import Loading from "./mobile_components/loading"
// import ImageSelector from "./mobile_components/image_selector"

const Page = () => {
  const { theme } = useContext(ThemeContext)
  const { locale } = useContext(LocaleContext)
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const insets = useSafeAreaInsets()
  /** Image Picker */
  const [blob, setBlob] = useState("")
  const [photo, setPhoto] = useState("")
  const [photoName, setPhotoName] = useState("")
  const [photoType, setPhotoType] = useState("")
  /** Form */
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [zip, setZip] = useState("")
  const [country, setCountry] = useState("")
  /** Phone Number */
  const [phoneCountry, setPhoneCountry] = useState()
  const [phone, setPhone] = useState("")

  const styles = StyleSheet.create({
    container: {
      flex: 1,
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
    phoneInputStyles: {
      container: {
        backgroundColor: theme.ternary,
        borderWidth: 0,
      },
      flagContainer: {
        borderTopLeftRadius: 10,
        borderBottomLeftRadius: 10,
        backgroundColor: theme.ternary,
        justifyContent: "center",
      },
      caret: {
        color: theme.invert,
      },
      divider: {
        backgroundColor: theme.invert,
      },
      callingCode: {
        fontSize: 14,
        color: theme.invert,
      },
      input: {
        fontSize: 14,
        color: theme.invert,
      },
    },
    modalStyles: {
      modal: {
        backgroundColor: theme.clear,
        borderWidth: 0,
      },
      searchInput: {
        borderRadius: 10,
        borderWidth: 0,
        color: theme.invert,
        backgroundColor: theme.ternary,
      },
      countryButton: {
        borderWidth: 0,
        backgroundColor: theme.ternary,
      },
      callingCode: {
        color: theme.invert,
      },
      countryName: {
        color: theme.invert,
      }
    }
  })

  useEffect(() => {
    /** Get the account from the local storage */
    storage.get("account").then(account => {
      if (account && account.data) {
        const { name, address, city, zip, country, phone, avatar } = account.data
        // setName(name ? name : "")
        // setAddress(address ? address : "")
        // setCity(city ? city : "")
        // setZip(zip ? zip : "")
        // setCountry(country ? country : "")
        // setPhoneCountry(phone ? getCountryByPhoneNumber(phone) : "")
        // setPhone(phone ? (phone.substring(phone.indexOf(" ") + 1)) : "")
        // setPhoto(avatar ? avatar : "")
      }
    })
  }, [])

  const handleCancel = async () => router.back()
  const handleCountry = country => setPhoneCountry(country)
  const handlePhone = phone => setPhone(phone)

  const handleApprove = async () => {
    setLoading(true)
    /** Profile Photo */
    const file = blob !== "" ? blob : null
    /** Body of the request */
    const telephone = phoneCountry.callingCode && phone ? (phoneCountry.callingCode + phone).replace(/\s/g, "") : ""
    const body = { name, address, city, zip, country, phone: telephone, photoName, photoType }
    /** Requests the account update */
    const response = await request("PUT", "account", body, file)
    /** If the request was successful, updates the account in the local storage */
    if (response.status === 200) {
      const response = await request("GET", "account", null)
      /** Saves the account in the storage */
      await storage.set("account", response)
      /** Hides the loading page */
      setLoading(false)
      /** Exits the screen */
      setTimeout(() => router.back(), 500)
    } else {
      setLoading(false)
      Alert.alert(locale.update_error_title, locale.update_error_message, [{ text: locale.close, onPress: () => console.log("Closed Press") }])
    }
  }

  return <SafeAreaProvider style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom, backgroundColor: theme.clear }}>
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" && "padding"}>
      <ScrollView style={{ backgroundColor: theme.clear }}>
        <Text style={styles.title}>{locale.account_information}</Text>
        {/* <ImageSelector {...{ photo, setPhoto, setPhotoName, setPhotoType, setBlob }} /> */}
        <TextInput placeholder={locale.name} style={styles.input} placeholderTextColor={theme.invert + alpha[40]} autoCapitalize="words"
          value={name} onChangeText={text => setName(text)} />
        <TextInput placeholder={locale.address} style={styles.input} placeholderTextColor={theme.invert + alpha[40]} autoCapitalize="words"
          value={address} onChangeText={text => setAddress(text)} />
        <TextInput placeholder={locale.city} style={styles.input} placeholderTextColor={theme.invert + alpha[40]} autoCapitalize="words"
          value={city} onChangeText={text => setCity(text)} />
        <TextInput placeholder={locale.zip} style={styles.input} placeholderTextColor={theme.invert + alpha[40]}
          value={zip} onChangeText={text => setZip(text)} />
        <TextInput placeholder={locale.country} style={styles.input} placeholderTextColor={theme.invert + alpha[40]} autoCapitalize="words"
          value={country} onChangeText={text => setCountry(text)} />
        <View style={{ margin: 10, }}>
          {/* <PhoneInput value={phone} onChangePhoneNumber={handlePhone} selectedCountry={phoneCountry} onChangeSelectedCountry={handleCountry}
            placeholder={locale.phone} modalSearchInputPlaceholder={locale.phone_country_search} modalNotFoundCountryMessage={locale.phone_country_not_found}
            phoneInputStyles={styles.phoneInputStyles} modalStyles={styles.modalStyles} language={locale.language} /> */}
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