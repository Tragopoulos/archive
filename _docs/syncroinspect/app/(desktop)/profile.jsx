/** React & Expo */
import { useContext } from "react"
import { StyleSheet, View, Text } from "react-native"
/** Configs */
import ThemeContext from "../../configs/themes"

const Page = () => {
    const { theme } = useContext(ThemeContext)

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: theme.clear,
        },
    })

    return <View style={styles.container}>
        <Text>Profile Page</Text>
    </View>
}

export default Page