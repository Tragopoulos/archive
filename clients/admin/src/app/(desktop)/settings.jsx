import { useContext, useMemo, useState } from "react"
import { View, Text, StyleSheet, Pressable } from "react-native"
import ThemeContext from "../../configs/themes"
import LocaleContext from "../../configs/locales"
import { requestJson } from "../../configs/services"
import { useNotifications } from "../../components/desktop/notifications"
import PageHeader from "../../components/desktop/page_header"

const createStyles = (theme) => StyleSheet.create({
    page: {
        flex: 1,
        padding: 24,
        gap: 16,
    },
    card: {
        maxWidth: 520,
        backgroundColor: theme.clear,
        borderWidth: 1,
        borderColor: theme.smoke,
        borderRadius: 10,
        padding: 20,
        gap: 16,
    },
    title: {
        color: theme.primary,
        fontSize: 12,
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    text: {
        color: theme.secondary,
        fontSize: 14,
        lineHeight: 20,
    },
    button: {
        height: 36,
        paddingHorizontal: 14,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        alignSelf: "flex-start",
    },
    buttonDanger: {
        backgroundColor: theme.primaryRed,
        borderColor: theme.primaryRed,
    },
    buttonDangerHover: {
        backgroundColor: "#b91c1c",
        borderColor: "#b91c1c",
    },
    buttonDangerText: {
        color: theme.white,
        fontSize: 14,
        fontWeight: "600",
    },
    buttonDisabled: {
        opacity: 0.5,
    },
})

const Page = () => {
    const { theme } = useContext(ThemeContext)
    const { locale } = useContext(LocaleContext)
    const notifications = useNotifications()
    const styles = useMemo(() => createStyles(theme), [theme])
    const [deletingLogs, setDeletingLogs] = useState(false)

    const handleDeleteGiteaLogs = async () => {
        setDeletingLogs(true)
        const { status, data } = await requestJson("/api/gitea/logs/delete", "POST")
        setDeletingLogs(false)
        if (status >= 200 && status < 300) {
            notifications.success((locale.gitea_logs_deleted || "Deleted {count} Gitea workflow logs.").replace("{count}", String(data?.deleted ?? 0)))
            return
        }
        if (data?.code === "gitea_not_configured") {
            notifications.error(locale.gitea_not_configured)
            return
        }
        notifications.error(data?.message || locale.failed_to_delete_gitea_logs)
    }

    return (
        <View style={styles.page}>
            <PageHeader title="Settings" />
            <View style={styles.card}>
                <Text style={styles.title}>{locale.delete_gitea_logs}</Text>
                <Text style={styles.text}>Delete stored Gitea workflow run logs for the configured repository.</Text>
                <Pressable
                    onPress={handleDeleteGiteaLogs}
                    disabled={deletingLogs}
                    style={({ hovered, pressed }) => [
                        styles.button,
                        styles.buttonDanger,
                        (pressed || hovered) && styles.buttonDangerHover,
                        deletingLogs && styles.buttonDisabled,
                    ]}
                >
                    <Text style={styles.buttonDangerText}>{deletingLogs ? locale.deleting : locale.delete_gitea_logs}</Text>
                </Pressable>
            </View>
        </View>
    )
}

export default Page
