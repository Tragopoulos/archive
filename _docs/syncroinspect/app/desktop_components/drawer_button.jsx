/** React & Expo */
import { useEffect, useState, useContext, useRef } from "react"
import { StyleSheet, View, Text, Pressable } from "react-native"
import { MaterialCommunityIcons, FontAwesome5, Ionicons, Fontisto, AntDesign } from "@expo/vector-icons"
/** Configs */
import ThemeContext, { alpha } from "../../configs/themes"

const DrawerButton = ({ icon, iconFamily, text, badgeInfo, badgeNumber, onButtonClick }) => {
    const { theme, setTheme } = useContext(ThemeContext)
    const [isHovered, setIsHovered] = useState(false)
    const handleHoverIn = () => setIsHovered(true)
    const handleHoverOut = () => setIsHovered(false)

    const styles = StyleSheet.create({
        drawerButtonShell: {
            flexDirection: "row",
            justifyContent: "left",
            alignItems: "center",
            padding: 10,
            margin: 1,
            backgroundColor: theme.ternary,
        },
        drawerButtonShellHovered: {
            flexDirection: "row",
            justifyContent: "left",
            alignItems: "center",
            padding: 10,
            margin: 1,
            backgroundColor: theme.clear,
        },
        drawerButtonIcon: {
            flexDirection: "row",
            justifyContent: "left",
            color: theme.secondary,
            fontSize: 20,
            marginRight: 10
        },
        drawerButtonIconHovered: {
            flexDirection: "row",
            justifyContent: "left",
            color: theme.primary,
            fontSize: 20,
            marginRight: 10
        },
        drawerButtonText: {
            color: theme.secondary,
        },
        drawerButtonTextHovered: {
            color: theme.primary,
        },
        drawerButtonBadge: {
            width: 22,
            height: 22,
            borderRadius: 11,
            alignItems: "center",
            justifyContent: "center",
            marginLeft: "auto"
        },
        drawerButtonBadgeText: {
            color: theme.ternary,
        },
    })

    return <Pressable style={isHovered ? styles.drawerButtonShellHovered : styles.drawerButtonShell} onPress={() => onButtonClick()} onHoverIn={handleHoverIn} onHoverOut={handleHoverOut}>
        {iconFamily === "FontAwesome5" ? <FontAwesome5 name={icon} style={isHovered ? styles.drawerButtonIconHovered : styles.drawerButtonIcon} /> : null}
        {iconFamily === "Ionicons" ? <Ionicons name={icon} style={isHovered ? styles.drawerButtonIconHovered : styles.drawerButtonIcon} /> : null}
        {iconFamily === "Fontisto" ? <Fontisto name={icon} style={isHovered ? styles.drawerButtonIconHovered : styles.drawerButtonIcon} /> : null}
        {iconFamily === "MaterialCommunityIcons" ? <MaterialCommunityIcons name={icon} style={isHovered ? styles.drawerButtonIconHovered : styles.drawerButtonIcon} /> : null}
        {iconFamily === "AntDesign" ? <AntDesign name={icon} style={isHovered ? styles.drawerButtonIconHovered : styles.drawerButtonIcon} /> : null}
        <Text style={isHovered ? styles.drawerButtonTextHovered : styles.drawerButtonText}>{text}</Text>
        {badgeNumber > 0 ? <View style={[styles.drawerButtonBadge, { backgroundColor: badgeInfo ? theme.secondaryBlue : theme.secondaryRed }]}>
            <Text style={styles.drawerButtonBadgeText}>{badgeNumber}</Text>
        </View> : null}
    </Pressable>
}

export default DrawerButton