/** React & Expo */
import { useEffect, useState, useContext, useRef } from "react"
import { useRouter } from "expo-router"
import { auth } from "../../configs/firebase"
import { View, Text, Pressable, Image, StyleSheet, ScrollView } from "react-native"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import logo from "../../assets/icons/app.png"
import DrawerButton from "./drawer_button"
import ThemeContext, { alpha } from "../../configs/themes"
import storage from "../../configs/storage"

const Drawer = ({ closeDrawer }) => {
    const { theme, setTheme } = useContext(ThemeContext)
    const [isHovered, setIsHovered] = useState(false)
    const router = useRouter()
    const handleHoverIn = () => setIsHovered(true)
    const handleHoverOut = () => setIsHovered(false)

    const navigateTo = (route) => {
        router.push(route)
        closeDrawer()
    }

    const signOut = async () => {
        try {
            await storage.delete("account")
            await auth.signOut()
        } catch (error) {
            //TODO: console.log("Error signing out: ", error)
        }
    }

    const styles = StyleSheet.create({
        /** Container */
        container: {
            flex: 1,
            flexDirection: "column",
        },
        /** Top View */
        top: {
            flexDirection: "row",
            marginHorizontal: 10,
            marginVertical: 10,
            alignItems: "center",
        },
        name: {
            marginLeft: 5,
            color: theme.secondary,
        },
        email: {
            marginLeft: 5,
            color: theme.secondary,
        },
        closeButtonShell: {
            height: 32,
            width: 32,
            alignItems: "center",
            justifyContent: "center",
            marginLeft: "auto",
            margin: 5,
            borderColor: theme.ternary,
            backgroundColor: theme.ternary,
            borderWidth: 1,
            borderRadius: 10,
        },
        closeButtonShellHovered: {
            height: 32,
            width: 32,
            alignItems: "center",
            justifyContent: "center",
            marginLeft: "auto",
            margin: 5,
            borderColor: theme.clear,
            backgroundColor: theme.clear,
            borderWidth: 1,
            borderRadius: 10,
        },
        closeButton: {
            fontSize: 20,
            color: theme.secondary,
        },
        closeButtonHovered: {
            fontSize: 20,
            color: theme.primary,
        },
        divider: {
            backgroundColor: theme.clear,
            height: 2,
            marginHorizontal: 10,
        },
        /** Middle View */
        middle: {
            flex: 1,
            paddingBottom: 70,
        },
        /** Bottom View */
        bottom: {
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            flexDirection: "row",
            alignItems: "center",
            paddingBottom: 20,
            paddingTop: 10,
            paddingHorizontal: 10,
        },
        logo: {
            width: 20,
            height: 20,
            marginTop: 3
        },
        logoSyncro: {
            color: theme.secondary,
            fontSize: 20,
        },
        logoSocial: {
            color: theme.secondaryRed,
            fontSize: 20,
        },
        r: {
            color: theme.secondary,
        },
        version: {
            color: theme.secondary,
            marginTop: 4,
            fontStyle: "italic"
        }
    })

    return <View style={styles.container}>
        <View style={styles.top}>
            <Image source={"https://avatars.githubusercontent.com/u/18228579?v=4"} style={styles.avatar} resizeMode="contain" />
            <View>
                <Text style={styles.name}>Fotios Tragopoulos</Text>
                <Text style={styles.email}>tragopoulos@icloud.com</Text>
            </View>
            <Pressable style={isHovered ? styles.closeButtonShellHovered : styles.closeButtonShell} onPress={closeDrawer} onHoverIn={handleHoverIn} onHoverOut={handleHoverOut}>
                <MaterialCommunityIcons name="close" style={isHovered ? styles.closeButtonHovered : styles.closeButton} />
            </Pressable>
        </View>
        <ScrollView style={styles.middle}>
            <View style={styles.divider} />
            <DrawerButton iconFamily={"FontAwesome5"} icon={"heartbeat"} text={"Dashboard"} badgeInfo badgeNumber={99} onButtonClick={() => navigateTo("/(desktop)/home")} />
            <DrawerButton iconFamily={"FontAwesome5"} icon={"file-medical-alt"} text={"Reports"} badgeNumber={0} onButtonClick={() => navigateTo("/(desktop)/reports")} />
            <DrawerButton iconFamily={"Ionicons"} icon={"shield-checkmark"} text={"Permissions"} badgeInfo badgeNumber={24} onButtonClick={() => navigateTo("/(desktop)/permissions")} />
            <DrawerButton iconFamily={"Fontisto"} icon={"doctor"} text={"Contacts"} badgeInfo badgeNumber={2} onButtonClick={() => navigateTo("/(desktop)/contacts")} />
            <DrawerButton iconFamily={"Ionicons"} icon={"notifications"} text={"Notifications"} badgeNumber={0} onButtonClick={() => navigateTo("/(desktop)/notifications")} />
            <DrawerButton iconFamily={"MaterialCommunityIcons"} icon={"account-settings"} text={"Profile"} badgeNumber={13} onButtonClick={() => navigateTo("/(desktop)/profile")} />
            <DrawerButton iconFamily={"Ionicons"} icon={"settings-sharp"} text={"Settings"} badgeNumber={0} onButtonClick={() => navigateTo("/(desktop)/settings")} />
            <View style={styles.divider} />
            <DrawerButton iconFamily={"Ionicons"} icon={"book-sharp"} text={"SyncroBio Docs"} onButtonClick={() => console.log("SyncroBio Documentation")} />
            <DrawerButton iconFamily={"AntDesign"} icon={"info-circle"} text={"About SyncroBio"} onButtonClick={() => console.log("About SyncroBio")} />
            <View style={styles.divider} />
            <DrawerButton text={"Sign out"} onButtonClick={signOut} />
        </ScrollView>
        <View style={styles.bottom}>
            <Image source={logo} style={styles.logo} resizeMode="contain" />
            <Text style={styles.logoSyncro}>Syncro</Text><Text style={styles.logoSocial}>Social</Text>
            <MaterialCommunityIcons name="registered-trademark" style={styles.r} />
            <Text style={styles.version}>version 1.1.1</Text>
        </View>
    </View >
}

export default Drawer