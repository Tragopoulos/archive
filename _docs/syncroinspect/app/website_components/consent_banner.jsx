/** React & Expo */
import { useContext } from "react"
import { View, Text, StyleSheet, Pressable, Linking } from "react-native"
import { useRouter } from "expo-router"
/** Configs */
import ThemeContext from "../../configs/themes"
import LocaleContext from "../../configs/locales"

const ConsentBanner = ({ consent }) => {
    const { theme } = useContext(ThemeContext)
    const { locale } = useContext(LocaleContext)
    const router = useRouter()

    const handleLinkPress = (route) => {
        router.push(route)
    }

    const styles = StyleSheet.create({
        banner: {
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: 16,
            backgroundColor: theme.clear,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            zIndex: 200,
            elevation: 10,
            shadowColor: theme.black,
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
        },
        text: {
            color: theme.invert,
            flex: 1,
            marginRight: 12,
            fontSize: 14,
            lineHeight: 20,
        },
        link: {
            color: theme.textLink,
            textDecorationLine: "underline",
        },
        button: {
            backgroundColor: theme.textLink,
            paddingVertical: 8,
            paddingHorizontal: 14,
            borderRadius: 6,
        },
        buttonText: {
            color: theme.textLight,
            fontWeight: "600",
        },
    })

    return <View style={styles.banner}>
        <Text style={styles.text}>
            {locale.consent_banner_text}{" "}
            <Text style={styles.link} onPress={() => handleLinkPress("/terms")}>
                {locale.consent_banner_terms}
            </Text>
            {" "}{locale.consent_banner_and}{" "}
            <Text style={styles.link} onPress={() => handleLinkPress("/privacy")}>
                {locale.consent_banner_privacy}
            </Text>.
        </Text>
        <Pressable style={styles.button} onPress={consent}>
            <Text style={styles.buttonText}>{locale.consent_banner_button}</Text>
        </Pressable>
    </View>
}

export default ConsentBanner

