import { useCallback, useContext, useEffect, useMemo, useState } from "react"
import { StyleSheet, View, Text, Pressable, ScrollView, ActivityIndicator, Platform } from "react-native"
import ThemeContext, { alpha } from "../../configs/themes"
import LocaleContext from "../../configs/locales"
import { requestJson, requestText } from "../../configs/services"
import { isDev } from "../../configs/configs"
import PageHeader from "../../components/desktop/page_header"

const createStyles = (theme) => StyleSheet.create({
    container: { flex: 1, flexDirection: "row" },
    sidebar: {
        width: 320,
        borderRightWidth: 1,
        borderRightColor: theme.smoke,
        flex: 1,
        paddingVertical: 24,
    },
    sidebarHeader: {
        color: theme.secondary,
        fontSize: 11,
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 1,
        paddingHorizontal: 20,
        paddingBottom: 8,
    },
    emailRow: {
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    emailRowActive: {
        backgroundColor: theme.primaryBlue + alpha[20],
        borderLeftWidth: 3,
        borderLeftColor: theme.primaryBlue,
    },
    emailRowHover: {
        backgroundColor: theme.ternary,
    },
    emailSubject: {
        color: theme.invert,
        fontSize: 14,
        fontWeight: "600",
    },
    emailMeta: {
        color: theme.secondary,
        fontSize: 12,
        marginTop: 4,
    },
    main: {
        flex: 2,
        padding: 24,
    },
    previewContainer: {
        flex: 1,
        borderWidth: 1,
        borderColor: theme.smoke,
        borderRadius: 8,
        overflow: "hidden",
        backgroundColor: theme.clear,
    },
    previewIframe: {
        flex: 1,
        backgroundColor: theme.clear,
    },
    previewDiv: {
        flex: 1,
        backgroundColor: theme.clear,
    },
    feedback: {
        padding: 24,
        alignItems: "center",
        gap: 12,
    },
    feedbackText: {
        color: theme.secondary,
        fontSize: 14,
    },
    errorText: {
        color: theme.primaryRed,
        fontSize: 14,
    },
    header: {
        minHeight: 36,
        marginBottom: 16,
    },
})

const Page = () => {
    const { theme } = useContext(ThemeContext)
    const { locale } = useContext(LocaleContext)
    const styles = useMemo(() => createStyles(theme), [theme])

    const [emails, setEmails] = useState([])
    const [emailsError, setEmailsError] = useState("")
    const [selected, setSelected] = useState(null)
    const [loadState, setLoadState] = useState("idle")
    const [htmlContent, setHtmlContent] = useState("")
    const [loadError, setLoadError] = useState("")

    const isEmptyMailboxError = (message) => {
        if (typeof message !== "string") return false
        return message.trim().toLowerCase() === "failed to read emails"
    }

    useEffect(() => {
        let cancelled = false
            ; (async () => {
                const { status, data } = await requestJson("/api/emails", "GET")
                if (cancelled) return
                if (status >= 200 && status < 300 && Array.isArray(data?.emails)) {
                    setEmails(data.emails)
                    setEmailsError("")
                    setSelected(data.emails.length > 0 ? data.emails[0] : null)
                    if (data.emails.length === 0) {
                        setHtmlContent("")
                        setLoadState("idle")
                    }
                } else if (isEmptyMailboxError(data?.message)) {
                    setEmails([])
                    setEmailsError("")
                    setSelected(null)
                    setHtmlContent("")
                    setLoadError("")
                    setLoadState("idle")
                } else {
                    setEmailsError(data?.message || locale.failed_to_load_emails || "Failed to load emails.")
                }
            })()
        return () => { cancelled = true }
    }, [locale.failed_to_load_emails])

    const loadEmail = useCallback(async (email) => {
        if (!email) return
        setLoadState("loading")
        setLoadError("")
        try {
            const { status, data } = await requestText(`/api/emails/${email.id}/render`, "GET")
            if (status >= 200 && status < 300 && data) {
                setHtmlContent(data)
                setLoadState("ready")
            } else {
                setLoadError(locale.failed_to_render_email || "Failed to render email.")
                setLoadState("error")
            }
        } catch (err) {
            setLoadError(locale.failed_to_render_email || "Failed to render email.")
            setLoadState("error")
        }
    }, [locale.failed_to_render_email])

    useEffect(() => {
        if (selected) loadEmail(selected)
    }, [selected, loadEmail])

    const renderPreview = () => {
        if (loadState === "loading") {
            return (
                <View style={styles.feedback}>
                    <ActivityIndicator color={theme.primary} />
                    <Text style={styles.feedbackText}>{locale.loading}</Text>
                </View>
            )
        }

        if (loadState === "error") {
            return (
                <View style={styles.feedback}>
                    <Text style={styles.errorText}>{loadError}</Text>
                </View>
            )
        }

        if (loadState === "ready") {
            if (Platform.OS === "web") {
                if (isDev) {
                    return (
                        <div
                            style={{ flex: 1, overflow: "auto", backgroundColor: theme.clear }}
                            dangerouslySetInnerHTML={{ __html: htmlContent }}
                        />
                    )
                }
                return (
                    <iframe
                        srcDoc={htmlContent}
                        style={styles.previewIframe}
                        sandbox="allow-same-origin allow-scripts"
                    />
                )
            }
            return (
                <View style={styles.previewDiv}>
                    <Text style={{ color: theme.secondary }}>(Preview available on web only)</Text>
                </View>
            )
        }

        return null
    }

    return <View style={styles.container}>
        <ScrollView style={styles.sidebar}>
            <Text style={styles.sidebarHeader}>{locale.emails || "Emails"}</Text>
            {emailsError ? (
                <View style={{ paddingHorizontal: 20 }}>
                    <Text style={styles.errorText}>{emailsError}</Text>
                </View>
            ) : null}
            {emails.map((email) => {
                const active = selected && selected.id === email.id
                return <Pressable
                    key={email.id}
                    onPress={() => setSelected(email)}
                    style={({ hovered, pressed }) => [
                        styles.emailRow,
                        active && styles.emailRowActive,
                        !active && (pressed || hovered) && styles.emailRowHover,
                    ]}
                >
                    <Text style={styles.emailSubject} numberOfLines={1}>{email.subject}</Text>
                    <Text style={styles.emailMeta} numberOfLines={1}>{email.to}</Text>
                    <Text style={styles.emailMeta} numberOfLines={1}>{email.created_at}</Text>
                </Pressable>
            })}
        </ScrollView>

        <View style={styles.main}>
            {!selected && (
                <View style={styles.feedback}>
                    <Text style={styles.feedbackText}>{locale.select_email || "Select an email to preview."}</Text>
                </View>
            )}

            {selected && (
                <>
                    <View style={styles.header}>
                        <PageHeader title={selected.subject || "Email"} subtitle={selected.to}>
                            <Text style={{ color: theme.secondary, fontSize: 12 }}>
                                {selected.template}
                            </Text>
                        </PageHeader>
                    </View>

                    <View style={styles.previewContainer}>
                        {renderPreview()}
                    </View>
                </>
            )}
        </View>
    </View>
}

export default Page