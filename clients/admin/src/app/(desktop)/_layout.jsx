/** React & Expo */
import { Slot } from "expo-router"
import { View } from "react-native"
import { useContext } from "react"
/** Configs */
import ThemeContext from "../../configs/themes"
/** Components */
import Sidebar from "../../components/desktop/sidebar"

const Layout = () => {
    const { theme } = useContext(ThemeContext)
    return (
        <View style={{ flex: 1, flexDirection: "row", backgroundColor: theme.clear }}>
            <Sidebar />
            <View style={{ flex: 1, backgroundColor: theme.ternary }}>
                <Slot />
            </View>
        </View>
    )
}

export default Layout