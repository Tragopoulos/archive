/** Expo & React */
import { useEffect, useState, useContext } from "react"
import { StyleSheet, ScrollView, View, Image, Text } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
/** Configs */
import storage from "../../../configs/storage"
import { request, settings } from "../../../configs/services"
import ThemeContext from "../../../configs/themes"
/** Components */
import ButtonAction from "../../mobile_components/button_action"
import Loading from "../../mobile_components/loading"

const Page = () => {
  const { theme } = useContext(ThemeContext)
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [account, setAccount] = useState()

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.clear,
    },
    scrollContainer: {
      backgroundColor: theme.clear,
      paddingLeft: 20,
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
      backgroundColor: theme.ternary,
      justifyContent: "center",
      alignItems: "center",
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      resizeMode: "contain",
    },
    avatarPlaceholder: {
      fontSize: 24,
      color: theme.invert,
    },
    label: {
      color: theme.secondary,
      fontSize: 16,
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
  })

  useEffect(() => {
    /** Get the account from the local storage */
    storage.get("account").then(setAccount)
  }, [])

  console.log(account)

  const handleApprove = async () => {
    router.back()
  }

  const handleCancel = async () => {
    router.back()
  }

  return <View style={styles.container}>
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.headerContainer}>

        <View>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.profileName}>{account?.data.email}</Text>
        </View>
        <View style={styles.avatarContainer}>
          {account?.data.avatar !== "" ?
            <Image style={styles.avatar} source={{ uri: account?.data.avatar }} /> :
            <Ionicons name="image-outline" style={styles.avatarPlaceholder} />
          }
        </View>
      </View>
      <Text style={styles.label}>Name:</Text>
      <Text style={styles.profileName}>{account?.data.email}</Text>
      <Text style={styles.label}>Surname:</Text>
      <Text style={styles.profileName}>{account?.data.email}</Text>
      <Text style={styles.label}>Phone:</Text>
      <Text style={styles.profileName}>{account?.data.email}</Text>
      <Text style={styles.label}>Address:</Text>
      <Text style={styles.profileName}>{account?.data.email}</Text>

      <Text style={styles.label}>City:</Text>
      <Text style={styles.profileName}>{account?.data.email}</Text>
      <Text style={styles.label}>ZIP:</Text>
      <Text style={styles.profileName}>{account?.data.email}</Text>
      <Text style={styles.label}>Country:</Text>
      <Text style={styles.profileName}>{account?.data.email}</Text>

    </ScrollView>
    <View style={styles.approvalButtons}>
      <ButtonAction action={handleCancel} text="Cancel" color={theme.clear} stroke={theme.secondaryRed} fill={theme.secondaryRed} />
      <ButtonAction action={handleApprove} text="Save" color={theme.clear} stroke={theme.secondaryBlue} fill={theme.secondaryBlue} />
    </View>
    {loading && <Loading />}
  </View >
}

export default Page