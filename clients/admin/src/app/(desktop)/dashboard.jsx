/** React & Expo */
import { View, StyleSheet } from "react-native"
import { useContext, useMemo } from "react"
/** Configs */
import ThemeContext from "../../configs/themes"
/** Components */
import PageHeader from "../../components/desktop/page_header"

const createStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
    }
})

const Page = () => {
    const { theme } = useContext(ThemeContext)
    const styles = useMemo(() => createStyles(theme), [theme])

    return <View style={styles.container}>
        <PageHeader title="Dashboard" />
    </View>
}

export default Page