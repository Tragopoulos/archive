/** Expo & React */
import { useEffect, useState, useContext } from "react"
import { StyleSheet, ScrollView, View } from "react-native"
import { useRouter } from "expo-router"
/** Configs */
import storage from "../../../configs/storage"
import { request, settings } from "../../../configs/services"
import ThemeContext from "../../../configs/themes"
/** Components */
import ButtonAction from "../../mobile_components/button_action"
import ButtonImage from "../../mobile_components/button_image"
import Loading from "../../mobile_components/loading"

const Page = () => {
  const { theme } = useContext(ThemeContext)
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [account, setAccount] = useState()
  const [options, setOptions] = useState()

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
  })

  useEffect(() => {
    /** Get the account from the local storage */
    storage.get("account").then(setAccount)
    /** Get the options available */
    setOptions(settings.menu.find(item => item.name === "Preferences").categories.find(category => category.action === "locale").options)
  }, [])

  const handleChange = nextOption => {
    const nextAccount = { ...account, data: { ...account.data, theme: nextOption.name } }
    setAccount(nextAccount)
  }

  const handleApprove = async () => {
    router.back()
  }

  const handleCancel = async () => {
    router.back()
  }

  return <View style={{ flex: 1, backgroundColor: theme.clear }}>
    <ScrollView style={{ backgroundColor: theme.clear }}>
      {options?.map(option => <ButtonImage key={option.name} theme={option} action={() => handleChange(option)} selected={account?.data.language == option.code} />)}
    </ScrollView>
    <View style={styles.approvalButtons}>
      <ButtonAction action={handleCancel} text="Cancel" color={theme.clear} stroke={theme.secondaryRed} fill={theme.secondaryRed} />
      <ButtonAction action={handleApprove} text="Save" color={theme.clear} stroke={theme.secondaryBlue} fill={theme.secondaryBlue} />
    </View>
    {loading && <Loading />}
  </View>
}

export default Page