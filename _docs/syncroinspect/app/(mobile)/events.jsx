/** React & Expo */
import { useContext } from "react"
import { StyleSheet, ScrollView } from "react-native"
/** Configs */
import ThemeContext from "../../configs/themes"

const Page = () => {
  const { theme } = useContext(ThemeContext)

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.clear,
    },
  })

  return <ScrollView style={styles.container}>
  </ScrollView>
}

export default Page