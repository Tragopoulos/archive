import { useContext, useMemo } from "react"
import { StyleSheet, Text, View } from "react-native"
import ThemeContext from "../../configs/themes"

const createStyles = (theme) => StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 12,
    },
    titleBlock: {
        flex: 1,
        minWidth: 0,
    },
    title: {
        color: theme.secondary,
        fontSize: 11,
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 1,
        paddingBottom: 8,
    },
    subtitle: {
        color: theme.secondary,
        fontSize: 13,
        marginTop: 4,
    },
    actions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        flexShrink: 0,
    },
})

const PageHeader = ({ title, subtitle, children }) => {
    const { theme } = useContext(ThemeContext)
    const styles = useMemo(() => createStyles(theme), [theme])

    return <View style={styles.container}>
        <View style={styles.titleBlock}>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text numberOfLines={2} style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {children ? <View style={styles.actions}>{children}</View> : null}
    </View>
}

export default PageHeader