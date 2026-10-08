/** Expo & React */
import { useContext } from "react"
import { StyleSheet, View, Text } from "react-native"
/** Configs */
import ThemeContext from "../../configs/themes"

const TextBox = ({ data }) => {
  const { theme } = useContext(ThemeContext)

  const styles = StyleSheet.create({
    container: {
      marginHorizontal: 20,
      marginBottom: 10,
      padding: 16
    },
    title: {
      color: theme.invert,
      fontSize: 16,
      fontWeight: "bold",
      paddingBottom: 20
    },
    text: {
      color: theme.invert,
    }
  })

  return <View style={styles.container}>
    <Text style={styles.title}>{data.title}</Text>
    <Text style={styles.text}>{data.subtitle}</Text>
  </View>
}

export default TextBox