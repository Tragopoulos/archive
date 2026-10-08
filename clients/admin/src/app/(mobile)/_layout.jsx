/** React & Expo */
import { Tabs } from "expo-router"

const Layout = () => {

    return <Tabs>
        <Tabs.Screen name="dashboard" />
        <Tabs.Screen name="support" />
        <Tabs.Screen name="notifications" />
    </Tabs>
}

export default Layout