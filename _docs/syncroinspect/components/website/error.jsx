import { useContext } from "react"
import { View, Text, StyleSheet } from "react-native"
import ThemeContext from "../../configs/themes"
import LocaleContext from "../../configs/locales"
import GlitchText from "./glitch_text"
import Logo from "./logo"
import ButtonSmall from "./button_small"
import Svg, { Path } from "react-native-svg"

const SomethingWentWrong = ({ title, subtitle, errorCode, troubleshooting, buttons }) => {
    const { theme } = useContext(ThemeContext)
    const { locale } = useContext(LocaleContext)

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 24,
            backgroundColor: theme.clear,
        },
        logo: {
            width: 100,
            height: 100,
            marginBottom: 24,
        },
        title: {
            fontSize: 28,
            fontWeight: "700",
            color: theme.invert,
        },
        subtitle: {
            fontSize: 16,
            color: theme.invert,
            textAlign: "center",
            marginVertical: 24,
            maxWidth: 320,
        },
        errorCode: {
            fontSize: 18,
            color: theme.invert,
            textAlign: "center",
            fontFamily: "monospace",
            marginTop: 24,
        },
        actions: {
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 2,
        },
        list: {
            marginTop: 20,
        },
        item: {
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 8,
        },
        text: {
            marginLeft: 8,
            fontSize: 14,
            color: theme.invert,
            flexShrink: 1,
        },
    })

    return <View style={styles.container}>
        <Logo style={styles.logo} />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <View style={styles.actions}>
            {buttons && buttons.map((button, index) => (
                <ButtonSmall key={index} label={button.label} onPress={button.onPress} variant={button.variant} minWidthSize={150} />
            ))}
        </View>
        {troubleshooting ? <View style={styles.list}>
            <View style={styles.item}>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                    <Path d="M12 8v8m-4-4h8M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke={theme.invert} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
                <Text style={styles.text}>{locale.troubleshooting_1}</Text>
            </View>

            <View style={styles.item}>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                    <Path d="M12 6v6h4.5" stroke={theme.invert} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M21 12a9 9 0 11-9-9" stroke={theme.invert} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
                <Text style={styles.text}>{locale.troubleshooting_2}</Text>
            </View>

            <View style={styles.item}>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                    <Path d="M3 7h18M3 12h18M3 17h18" stroke={theme.invert} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
                <Text style={styles.text}>{locale.troubleshooting_3}</Text>
            </View>
        </View> : null}
        <GlitchText style={styles.errorCode}>{errorCode}</GlitchText>
    </View>
}

export default SomethingWentWrong