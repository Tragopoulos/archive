/** React & Expo */
import { useEffect, useState, useContext } from "react"
import { StyleSheet, ScrollView, View } from "react-native"
import { useRouter } from "expo-router"
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context"
/** Configs */
import storage from "../configs/storage"
import { request } from "../configs/services"
import ThemeContext from "../configs/themes"
import LocaleContext from "../configs/locales"
import { features } from "../configs/features"
/** Components */
import ButtonAction from "./components/button_action"
import ButtonImage from "./components/button_image"
import Loading from "./components/loading"

const Page = () => {
  const { theme, setTheme } = useContext(ThemeContext)
  const { locale } = useContext(LocaleContext)
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [account, setAccount] = useState()
  const [options, setOptions] = useState()
  const insets = useSafeAreaInsets()

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
    setOptions(features.menu.find(item => item.name === "preferences").categories.find(category => category.name === "settings_account_theme").options)
  }, [])

  const handleChange = nextOption => {
    /** Updates the account theme in the local storage */
    const nextAccount = { ...account, data: { ...account.data, theme: nextOption.name } }
    /** Saves the account in the state */
    setAccount(nextAccount)
    /** Updates the ThemeProvider */
    setTheme(nextOption.name)
  }

  const handleApprove = async () => {
    setLoading(true)
    /** Requests the account update */
    const response = await request("PUT", "account", { theme: account.data.theme })
    /** If the request was successful, updates the account in the local storage */
    if (response.status === 200) {
      await storage.set("account", account)
    } else {
      /** Returns to the previous theme */
      const previousAccount = await storage.get("account")
      previousAccount && setTheme(previousAccount.data.theme)
    }
    response && setLoading(false)
    response && setTimeout(() => router.back(), 500)
  }

  const handleCancel = async () => {
    const previousAccount = await storage.get("account")
    setAccount(previousAccount)
    setTheme(previousAccount?.data.theme)
    previousAccount && router.back()
  }

  return <SafeAreaProvider style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom, backgroundColor: theme.clear }}>
    <View style={{ flex: 1, backgroundColor: theme.clear }}>
      <ScrollView style={{ backgroundColor: theme.clear }}>
        {options?.map(option => <ButtonImage key={option.name} theme={option} action={() => handleChange(option)} selected={account?.data.theme == option.name} />)}
      </ScrollView>
      <View style={styles.approvalButtons}>
        <ButtonAction action={handleCancel} text={locale.cancel} color={theme.white} stroke={theme.secondaryRed} fill={theme.secondaryRed} />
        <ButtonAction action={handleApprove} text={locale.save} color={theme.white} stroke={theme.secondaryBlue} fill={theme.secondaryBlue} />
      </View>
      {loading && <Loading />}
    </View>
  </SafeAreaProvider>

}

export default Page