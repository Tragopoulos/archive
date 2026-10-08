/** React & Expo */
import { useContext, useMemo } from "react"
import { StyleSheet, Text, Pressable, View } from "react-native"
/** Configs */
import ThemeContext from "../../configs/themes"

const createStyles = (theme) => StyleSheet.create({
    buttonShell: {
        width: "100%",
        height: 48,
        backgroundColor: theme.clear,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: theme.invert,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 10,
    },
    buttonContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
        gap: 10,
    },
    buttonText: {
        color: theme.invert,
        fontSize: 18,
        fontFamily: theme.font,
    },
    imageWrapper: {
        height: 24,
        width: 24,
        alignItems: "center",
        justifyContent: "center",
    },
})

const ButtonBig = ({ action, text, icon: Icon }) => {
    const { theme } = useContext(ThemeContext)
    const styles = useMemo(() => createStyles(theme), [theme])

    return <Pressable style={({ pressed }) => [styles.buttonShell, { opacity: pressed ? 0.6 : 1 }]} onPress={action}>
        <View style={styles.buttonContent}>
            <View style={styles.imageWrapper}>
                <Icon size={24} color={theme.invert} />
            </View>
            <Text style={styles.buttonText}>{text}</Text>
        </View>
    </Pressable>
}

export default ButtonBig