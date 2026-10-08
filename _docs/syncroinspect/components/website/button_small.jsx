import { useContext } from "react"
import { Pressable, Text, StyleSheet } from "react-native"
import ThemeContext from "../../configs/themes"

const ButtonSmall = ({ label, onPress, variant = "default", style, textStyle, minWidthSize = 120 }) => {
    const { theme } = useContext(ThemeContext)

    const styles = StyleSheet.create({
        btnBase: {
            paddingVertical: 12,
            paddingHorizontal: 20,
            borderRadius: 10,
            margin: 5,
            borderWidth: 1,
            minWidth: minWidthSize,
            alignItems: "center",
            justifyContent: "center",
            transitionDuration: "200ms",
        },
        default: {
            backgroundColor: "transparent",
            borderColor: theme.invert
        },
        defaultFilled: {
            backgroundColor: theme.invert,
            borderColor: theme.invert
        },
        inverted: {
            backgroundColor: theme.invert,
            borderColor: theme.invert
        },
        invertedOutlined: {
            backgroundColor: "transparent",
            borderColor: theme.invert
        },
        secondary: {
            backgroundColor: theme.invert,
            borderColor: theme.invert
        },
        error: {
            backgroundColor: theme.secondaryRed,
            borderColor: theme.secondaryRed
        },
    })

    const getButtonStyle = (pressed, hovered) => {
        switch (variant) {
            case "primary":
                return styles.default
            case "secondary":
                return styles.secondary
            case "error":
                return hovered || pressed ? { ...styles.error, opacity: 0.9 } : styles.error
            case "inverted":
                return hovered || pressed ? styles.invertedOutlined : styles.inverted
            default:
                return hovered || pressed ? styles.defaultFilled : styles.default
        }
    }

    const getTextColor = (pressed, hovered) => {
        switch (variant) {
            case "primary":
                return theme.invert
            case "secondary":
                return theme.clear
            case "error":
                return theme.textLight
            case "inverted":
                return hovered || pressed ? theme.invert : theme.clear
            default:
                return hovered || pressed ? theme.clear : theme.invert
        }
    }

    return (
        <Pressable onPress={onPress} style={({ pressed, hovered }) => [styles.btnBase, getButtonStyle(pressed, hovered), style]}>
            {({ pressed, hovered }) => <Text style={[{ color: getTextColor(pressed, hovered), fontWeight: "700" }, textStyle]}>{label}</Text>}
        </Pressable>
    )
}

export default ButtonSmall
