/** React & Expo */
import { useEffect, useState, useContext } from "react"
import { useRouter } from "expo-router"
import { StyleSheet, View, Text, Image, Pressable } from "react-native"
/** Configs */
import ThemeContext from "../../configs/themes"
/** Components */
import logo from "../../assets/icons/app.png"


const NavBar = ({ openDrawer }) => {
    const { theme, setTheme } = useContext(ThemeContext)
    const router = useRouter()

    const styles = StyleSheet.create({
        navbarShell: {
            flexDirection: "row",
            width: "100%",
            height: 50,
            paddingHorizontal: 10,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "space-between",
        },
        navbarLogoContainer: {
            flexDirection: "row",
            justifyContent: "left",
            marginHorizontal: 5
        },
        navbarLogoImage: {
            width: 32,
            height: 32,
            marginVertical: 4,
        },
        navbarLogoTextSyncro: {
            color: theme.secondary,
            fontSize: 32,
        },
        navbarLogoTextBio: {
            color: theme.secondaryRed,
            fontSize: 32,
        },
        navbarLink: {
            color: theme.secondary,
            fontSize: 20,
            marginHorizontal: 10
        },
        navbarRightContainer: {
            flexDirection: "row",
            justifyContent: "right",
            alignItems: "center",
        },
        avatar: {
            width: 36,
            height: 36,
            borderRadius: 20,
            borderColor: theme.secondary,
            borderWidth: 2
        },
    })

    return <View style={styles.navbarShell}>
        <Pressable style={styles.navbarLogoContainer} onPress={() => router.push("/(desktop)/home")}>
            <Image source={logo} style={styles.navbarLogoImage} resizeMode="contain" />
            <Text style={styles.navbarLogoTextSyncro}>Syncro</Text><Text style={styles.navbarLogoTextBio}>Bio</Text>
        </Pressable>
        <View style={styles.navbarRightContainer}>
            <Pressable onPress={openDrawer} >
                <Image source={"https://avatars.githubusercontent.com/u/18228579?v=4"} style={styles.avatar} resizeMode="contain" />
            </Pressable>
        </View>
    </View>
}

export default NavBar

