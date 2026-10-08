/** React & Expo */
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { StyleSheet, View, Text, Pressable, ScrollView, TextInput } from "react-native"
/** Configs */
import ThemeContext, { alpha } from "../../configs/themes"
import LocaleContext from "../../configs/locales"
import { requestJson } from "../../configs/services"
import { useAuth } from "../../configs/auth"
/** Components */
import PageHeader from "../../components/desktop/page_header"
import { useNotifications } from "../../components/desktop/notifications"

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
    installerRow: {
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    installerRowActive: {
        backgroundColor: theme.primaryBlue + alpha[20],
        borderLeftWidth: 3,
        borderLeftColor: theme.primaryBlue,
    },
    installerRowHover: {
        backgroundColor: theme.ternary,
    },
    installerName: {
        color: theme.invert,
        fontSize: 14,
        fontWeight: "600",
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: theme.smoke,
    },
    statusIdle: {
        backgroundColor: theme.smoke,
    },
    statusRunning: {
        backgroundColor: "#F59E0B",
        borderColor: "#F59E0B",
    },
    statusSuccess: {
        backgroundColor: "#22C55E",
        borderColor: "#22C55E",
    },
    statusError: {
        backgroundColor: theme.primaryRed,
        borderColor: theme.primaryRed,
    },
    statusRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: theme.smoke,
    },
    summaryCard: {
        backgroundColor: theme.ternary,
        borderWidth: 1,
        borderColor: theme.smoke,
        borderRadius: 10,
        padding: 16,
        marginBottom: 16,
    },
    summaryHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
    },
    summaryTitle: {
        color: theme.invert,
        fontSize: 16,
        fontWeight: "700",
    },
    summarySubtitle: {
        color: theme.secondary,
        fontSize: 12,
        marginTop: 4,
    },
    detailGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
        marginTop: 12,
    },
    detailCard: {
        flexBasis: "48%",
        minWidth: 160,
        backgroundColor: theme.clear,
        borderWidth: 1,
        borderColor: theme.smoke,
        borderRadius: 8,
        padding: 12,
    },
    detailLabel: {
        color: theme.secondary,
        fontSize: 11,
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginBottom: 6,
    },
    detailValue: {
        color: theme.invert,
        fontSize: 13,
        fontWeight: "500",
    },
    noticeCard: {
        borderWidth: 1,
        borderColor: theme.primaryRed,
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        backgroundColor: theme.primaryRed + alpha[8],
    },
    outputCard: {
        backgroundColor: theme.clear,
        borderWidth: 1,
        borderColor: theme.smoke,
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    outputTitle: {
        color: theme.primary,
        fontSize: 12,
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    outputText: {
        color: theme.secondary,
        fontSize: 12,
        fontFamily: theme.font,
        lineHeight: 18,
    },
    timerText: {
        color: theme.secondary,
        fontSize: 13,
        fontVariantNumeric: "tabular-nums",
    },
    main: {
        flex: 2,
        padding: 24,
    },
    configCard: {
        flex: 1,
        backgroundColor: theme.clear,
        borderWidth: 1,
        borderColor: theme.smoke,
        borderRadius: 8,
        overflow: "hidden",
        padding: 20,
    },
    sectionHeader: {
        color: theme.primary,
        fontSize: 12,
        fontWeight: "700",
        marginTop: 24,
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.smoke,
        paddingBottom: 6,
        letterSpacing: 1,
    },
    field: {
        marginBottom: 16,
    },
    fieldLabel: {
        color: theme.secondary,
        fontSize: 12,
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginBottom: 6,
    },
    input: {
        height: 40,
        borderWidth: 1,
        borderColor: theme.smoke,
        borderRadius: 8,
        paddingHorizontal: 12,
        color: theme.invert,
        backgroundColor: theme.ternary,
        fontFamily: theme.font,
        fontSize: 14,
    },
    infoRow: {
        flexDirection: "row",
        marginBottom: 8,
    },
    infoLabel: {
        color: theme.secondary,
        fontSize: 12,
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        width: 140,
    },
    infoValue: {
        color: theme.invert,
        fontSize: 14,
        flex: 1,
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
    successText: {
        color: theme.primaryBlue,
        fontSize: 13,
    },
    header: {
        minHeight: 36,
    },
    button: {
        height: 32,
        paddingHorizontal: 14,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
    },
    buttonPrimary: {
        backgroundColor: theme.primaryBlue,
        borderColor: theme.primaryBlue,
    },
    buttonPrimaryHover: {
        backgroundColor: theme.secondaryBlue,
        borderColor: theme.secondaryBlue,
    },
    buttonPrimaryText: {
        color: theme.white,
        fontSize: 14,
        fontWeight: "600",
    },
    buttonDisabled: {
        opacity: 0.5,
    },
})

const INSTALLERS = [
    {
        name: "GITEA_GO_INSTALL",
        labelKey: "installer_go_label",
        descriptionKey: "installer_go_description",
        latestUpdate: null,
        status: "idle",
        version: "",
        inputs: [
            { name: "go_version", label: "Go Version", type: "string", required: false, placeholder: "e.g. 1.26.5" },
        ],
    },
    {
        name: "GITEA_NODEJS_INSTALL",
        labelKey: "installer_node_label",
        descriptionKey: "installer_node_description",
        latestUpdate: null,
        status: "idle",
        version: "",
        inputs: [
            { name: "nodejs_version", label: "Node.js Version", type: "string", required: false, placeholder: "e.g. 24.19.0" },
        ],
    },
    {
        name: "GITEA_TERRAFORM_INSTALL",
        labelKey: "installer_terraform_label",
        descriptionKey: "installer_terraform_description",
        latestUpdate: null,
        status: "idle",
        version: "",
        inputs: [
            { name: "terraform_version", label: "Terraform Version", type: "string", required: false, placeholder: "e.g. 1.15.8" },
        ],
    },
]

const Page = () => {
    const { theme } = useContext(ThemeContext)
    const { locale } = useContext(LocaleContext)
    const { authState } = useAuth()
    const notifications = useNotifications()
    const styles = useMemo(() => createStyles(theme), [theme])
    const [installers, setInstallers] = useState(INSTALLERS)
    const [selectedName, setSelectedName] = useState(INSTALLERS[0]?.name || "")
    const [inputValues, setInputValues] = useState({})
    const [triggering, setTriggering] = useState(false)
    const [runStatus, setRunStatus] = useState("idle")
    const [elapsed, setElapsed] = useState(0)
    const timerRef = useRef(null)

    const selected = useMemo(() => installers.find((installer) => installer.name === selectedName) || null, [installers, selectedName])

    const handleInputChange = (name, value) => {
        setInputValues(prev => ({ ...prev, [name]: value }))
    }

    const mergeInstaller = useCallback((name, nextInstaller) => {
        if (!nextInstaller || typeof nextInstaller !== "object") return

        setInstallers((prev) => prev.map((installer) => {
            if (installer.name !== name) return installer
            return {
                ...installer,
                ...nextInstaller,
                inputs: installer.inputs,
            }
        }))
    }, [])

    const fetchInstallerStatus = useCallback(async (name) => {
        const { status, data } = await requestJson(`/api/installers/${name}/status`, "GET")
        if (status === 200 && data?.status === "ok" && data?.installer) {
            mergeInstaller(name, data.installer)
            return data.installer
        }
        return null
    }, [mergeInstaller])

    const refreshInstallers = useCallback(async () => {
        const states = await Promise.all(INSTALLERS.map((installer) => fetchInstallerStatus(installer.name)))
        return states.filter(Boolean)
    }, [fetchInstallerStatus])

    const handleTrigger = useCallback(async () => {
        if (!selected) return
        setTriggering(true)
        setRunStatus("running")

        const { status, data } = await requestJson(`/api/installers/${selected.name}/trigger`, "POST", { inputs: inputValues })
        if (status === 200 && data?.status === "ok") {
            const updatedInstaller = data?.installer && typeof data.installer === "object" ? data.installer : null
            if (updatedInstaller) {
                mergeInstaller(selected.name, updatedInstaller)
                setRunStatus(updatedInstaller.status || "running")
            } else {
                setRunStatus("running")
            }
            notifications.success(locale.installer_triggered || "Installer triggered successfully.")
        } else {
            setRunStatus("error")
            notifications.error(data?.message || locale.operation_failed || "Failed to trigger installer")
        }

        setTriggering(false)
    }, [selected, inputValues, locale.operation_failed, mergeInstaller])

    useEffect(() => {
        if (authState !== "authed") return
        refreshInstallers()
    }, [authState, refreshInstallers])

    useEffect(() => {
        if (selected && selected.inputs) {
            const nextInputs = {}
            selected.inputs.forEach((inp) => {
                nextInputs[inp.name] = ""
            })
            setInputValues(nextInputs)
        }
    }, [selectedName])

    useEffect(() => {
        if (!selected) {
            setRunStatus("idle")
            return
        }
        setRunStatus(selected.status || "idle")
    }, [selected])

    useEffect(() => {
        if (authState !== "authed") return
        const hasRunning = installers.some((installer) => installer.status === "running")
        if (!hasRunning) return

        const id = setInterval(() => {
            refreshInstallers()
        }, 3000)

        return () => clearInterval(id)
    }, [authState, installers, refreshInstallers])

    useEffect(() => {
        if (runStatus === "running") {
            timerRef.current = setInterval(() => {
                setElapsed((prev) => prev + 1)
            }, 1000)
        } else {
            if (timerRef.current) clearInterval(timerRef.current)
            if (runStatus !== "running") setElapsed(0)
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [runStatus])

    const formatElapsed = (seconds) => {
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${m}:${s.toString().padStart(2, "0")}`
    }

    const formatLatestUpdate = (value) => {
        if (!value) return "-"
        const parsed = new Date(value)
        if (Number.isNaN(parsed.getTime())) return value
        return parsed.toLocaleString()
    }

    const formatDateTime = (value) => {
        if (!value) return "-"
        const parsed = new Date(value)
        if (Number.isNaN(parsed.getTime())) return value
        return parsed.toLocaleString()
    }

    const formatOutput = (output) => {
        if (!output) return null
        const lines = output
            .split(/\r?\n/)
            .map((line) => line.trimEnd())
            .filter((line) => line.length > 0)

        if (!lines.length) return null
        return lines.slice(-16).join("\n")
    }

    const currentStatus = selected?.status || runStatus
    const statusLabel = locale[`status_${currentStatus}`] || currentStatus
    const outputPreview = selected?.output ? formatOutput(selected.output) : null
    const outputLineCount = selected?.output
        ? selected.output.split(/\r?\n/).filter((line) => line.length > 0).length
        : 0

    const statusStyle = {
        idle: styles.statusIdle,
        running: styles.statusRunning,
        success: styles.statusSuccess,
        error: styles.statusError,
    }[currentStatus] || styles.statusIdle

    const renderConfig = () => {
        if (!selected) return null

        return <View style={styles.configCard}>
            <View style={styles.summaryCard}>
                <View style={styles.summaryHeader}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.summaryTitle}>{locale[selected.labelKey] || selected.name}</Text>
                        <Text style={styles.summarySubtitle}>{locale[selected.descriptionKey] || "-"}</Text>
                    </View>
                    <View style={[styles.statusDot, statusStyle]} />
                </View>

                <View style={styles.detailGrid}>
                    <View style={styles.detailCard}>
                        <Text style={styles.detailLabel}>{locale.status}</Text>
                        <Text style={styles.detailValue}>
                            {currentStatus === "running"
                                ? `${statusLabel} · ${formatElapsed(elapsed)}`
                                : statusLabel}
                        </Text>
                    </View>
                    <View style={styles.detailCard}>
                        <Text style={styles.detailLabel}>{locale.version}</Text>
                        <Text style={styles.detailValue}>{selected.version || "-"}</Text>
                    </View>
                    <View style={styles.detailCard}>
                        <Text style={styles.detailLabel}>{locale.latest_update}</Text>
                        <Text style={styles.detailValue}>{formatLatestUpdate(selected.latestUpdate)}</Text>
                    </View>
                    <View style={styles.detailCard}>
                        <Text style={styles.detailLabel}>{locale.started_at || "Started"}</Text>
                        <Text style={styles.detailValue}>{formatDateTime(selected.startedAt || selected.started_at)}</Text>
                    </View>
                </View>
            </View>

            {selected.error ? <View style={styles.noticeCard}>
                <Text style={styles.errorText}>{selected.error}</Text>
            </View> : null}

            {outputPreview ? <View style={styles.outputCard}>
                <Text style={styles.outputTitle}>
                    {locale.run_output || "Latest output"} ({outputLineCount} {locale.lines || "lines"})
                </Text>
                <Text style={styles.outputText}>{outputPreview}</Text>
            </View> : null}

            {selected.inputs && selected.inputs.length > 0 && <Text style={[styles.sectionHeader, { marginTop: 24 }]}>{locale.requested_values || "Requested values"}</Text>}

            {selected.inputs?.map((inp) => (
                <View key={inp.name} style={styles.field}>
                    <Text style={styles.fieldLabel}>{inp.label || inp.name}</Text>
                    <TextInput
                        value={inputValues[inp.name] ?? ""}
                        onChangeText={(v) => handleInputChange(inp.name, v)}
                        placeholder={inp.placeholder || ""}
                        placeholderTextColor={theme.secondary + alpha[40]}
                        autoCapitalize="none"
                        autoCorrect={false}
                        style={styles.input}
                        editable={!triggering && runStatus !== "running"}
                    />
                </View>
            ))}

            <Pressable
                onPress={handleTrigger}
                disabled={triggering || runStatus === "running"}
                style={({ hovered, pressed }) => [
                    styles.button,
                    styles.buttonPrimary,
                    (pressed || hovered) && styles.buttonPrimaryHover,
                    (triggering || runStatus === "running") && styles.buttonDisabled,
                ]}
            >
                <Text style={styles.buttonPrimaryText}>
                    {triggering ? locale.installing : locale.trigger_installer}
                </Text>
            </Pressable>
        </View>
    }

    return <View style={styles.container}>
        <ScrollView style={styles.sidebar}>
            <Text style={styles.sidebarHeader}>{locale.installers}</Text>
            {installers.map((installer) => {
                const active = selected && selected.name === installer.name
                return <Pressable
                    key={installer.name}
                    onPress={() => setSelectedName(installer.name)}
                    style={({ hovered, pressed }) => [
                        styles.installerRow,
                        active && styles.installerRowActive,
                        !active && (pressed || hovered) && styles.installerRowHover,
                    ]}
                >
                    <Text style={styles.installerName}>{locale[installer.labelKey] || installer.name}</Text>
                </Pressable>
            })}
        </ScrollView>

        <View style={styles.main}>
            {selected && (
                <>
                    <View style={styles.header}>
                        <PageHeader title={locale.configuration} />
                    </View>

                    {renderConfig()}
                </>
            )}
        </View>
    </View>
}

export default Page
