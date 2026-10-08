/** React & Expo */
import { useContext, useState, useCallback } from "react"
import { StyleSheet, ScrollView, View, Pressable, Text } from "react-native"
import { useRouter, useFocusEffect } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
/** Configs */
import ThemeContext, { alpha } from "../../configs/themes"
import LocaleContext from "../../configs/locales"
// import storage from "../../configs/storage"
// import { request } from "../../configs/services"
/** Components */
// import ButtonCreate from "../components/button_create"
// import AccordionProfile from "../components/accordion_profile"
import Loading from "../mobile_components/loading"

const Page = () => {
  // const [loading, setLoading] = useState()
  const { theme } = useContext(ThemeContext)
  const { locale } = useContext(LocaleContext)
  const router = useRouter()
  // const [profiles, setProfiles] = useState([])

  // useFocusEffect(useCallback(() => { getProfiles() }, []))

  const getProfiles = async () => {
    // /** Shows loading page */
    // setLoading(true)
    // /** Get Profiles from the backend */
    // const response = await request("GET", "profile", null)
    // if (response?.status === 200) {
    //   /** Sort profiles alphabetically by profile.name */
    //   const profilesList = response?.data.profiles ? response.data.profiles.sort((a, b) => (a.profile.NAME || "").localeCompare(b.profile.NAME || "")) : []
    //   /** Sets the profiles */
    //   setProfiles(profilesList)
    //   /** Saves the profiles in the storage */
    //   await storage.set("profiles", profilesList)
    //   /** Hides the loading page */
    //   setLoading(false)
    // }
  }

  // const addProfile = () => router.push("dashboard_profile_add")

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.clear,
    },
    content: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    placeholder: {
      color: theme.smoke,
      textAlign: "center",
      paddingHorizontal: 30,
      fontSize: 26,
      fontStyle: "italic",
      lineHeight: 50,
    },
    header: {
      height: "auto",
      padding: 20,
      backgroundColor: theme.ternary,
    },
    headerContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-start",
      gap: 10,
    },
    avatarContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.secondary + alpha[30],
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 10,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
    },
    avatarPlaceholder: {
      fontSize: 24,
      color: theme.invert,
    },
    profileName: {
      fontSize: 20,
      color: theme.invert,
    },
    profileDetails: {
      fontSize: 12,
      color: theme.primary,
    },
  })

  // return loading ? <Loading /> :
  //   <View style={styles.container}>
  //     {profiles.length < 1 ? <View style={styles.content}>
  //       <Text style={styles.placeholder}>{locale.dashboard_placeholder}</Text>
  //     </View> :
  //       <ScrollView>
  //         {profiles?.map(profile => <AccordionProfile key={profile?.id} data={profile} />)}
  //       </ScrollView>}
  //     <ButtonCreate color={theme.white} stroke={theme.secondaryBlue} fill={theme.secondaryBlue}
  //       icon={<Ionicons name="add" style={styles.addButtonIcon} />}
  //       action={addProfile} />
  //   </View>


  return <ScrollView style={styles.container}>
  </ScrollView>
}

export default Page