import { useCallback, useContext, useEffect, useMemo, useState } from "react"
import { StyleSheet, View, Text, Pressable, TextInput, ScrollView, ActivityIndicator, Switch } from "react-native"
import ThemeContext, { alpha } from "../../configs/themes"
import LocaleContext from "../../configs/locales"
import { requestJson } from "../../configs/services"
import { useNotifications } from "../../components/desktop/notifications"
import PageHeader from "../../components/desktop/page_header"

/** A field is considered secret when its key looks like a credential. The
 * value is still loaded and submitted normally, but the input is masked
 * until the user explicitly reveals it. */
const isSecretKey = (key) => {
    const k = key.toLowerCase()
    return k.includes("password") || k.includes("token") || k.includes("secret") || k === "mysql_url"
}

const envOrder = { ops: 0, test: 1, prod: 2 }
const envGroups = ["ops", "test", "prod"]

const serviceBinaries = {
    admin: "ADMIN",
    api: "API",
    logger: "LOGGER",
    mailer: "MAILER",
}

const serviceDescriptions = {
    admin: "Administration service for operations platform",
    api: "Core API service for operations platform",
    logger: "Centralized logging service",
    mailer: "Asynchronous email delivery service",
}

const createStyles = (theme) => StyleSheet.create({
    container: { flex: 1, flexDirection: "row" },
    sidebar: {
        width: 320,
        borderRightWidth: 1,
        borderRightColor: theme.smoke,
        flex: 1,
        paddingVertical: 24,
        scrollbarWidth: "thin",
        scrollbarColor: `${theme.secondaryBlue} ${theme.ternary}`,
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
    envSectionHeader: {
        color: theme.secondary,
        fontSize: 11,
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 0.8,
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 6,
    },
    envSectionSeparator: {
        height: 1,
        backgroundColor: theme.smoke,
        marginHorizontal: 20,
        marginTop: 8,
        marginBottom: 2,
    },
    appRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    appRowActive: {
        backgroundColor: theme.primaryBlue + alpha[20],
        borderLeftWidth: 3,
        borderLeftColor: theme.primaryBlue,
    },
    appRowHover: {
        backgroundColor: theme.ternary,
    },
    appLabel: {
        color: theme.invert,
        fontSize: 14,
        fontWeight: "600",
    },
    envBadge: {
        marginLeft: 8,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: theme.smoke,
    },
    envBadgeText: {
        color: theme.secondary,
        fontSize: 11,
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    main: {
        flex: 2,
        padding: 24,
    },
    header: {
        minHeight: 36,
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
    formScroll: {
        flex: 1,
        scrollbarWidth: "thin",
        scrollbarColor: `${theme.secondaryBlue} ${theme.ternary}`,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    infoLabel: {
        color: theme.secondary,
        fontSize: 12,
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        width: 250,
        flexShrink: 0,
    },
    infoValue: {
        color: theme.invert,
        fontSize: 14,
        flex: 1,
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
    timerText: {
        color: theme.secondary,
        fontSize: 13,
        fontVariantNumeric: "tabular-nums",
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
    buttonGhost: {
        backgroundColor: "transparent",
        borderColor: theme.smoke,
    },
    buttonGhostHover: {
        backgroundColor: theme.ternary,
    },
    buttonGhostText: {
        color: theme.primary,
        fontSize: 14,
        fontWeight: "600",
    },
    buttonRestart: {
        backgroundColor: "#B45309",
        borderColor: "#B45309",
    },
    buttonRestartHover: {
        backgroundColor: "#92400E",
        borderColor: "#92400E",
    },
    buttonRestartText: {
        color: theme.white,
        fontSize: 14,
        fontWeight: "600",
    },
    buttonDanger: {
        backgroundColor: theme.primaryRed,
        borderColor: theme.primaryRed,
    },
    buttonDangerHover: {
        backgroundColor: theme.secondaryRed,
        borderColor: theme.secondaryRed,
    },
    buttonDangerText: {
        color: theme.white,
        fontSize: 14,
        fontWeight: "600",
    },
    buttonDisabled: {
        opacity: 0.5,
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
    fieldRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
    },
    fieldLabel: {
        color: theme.secondary,
        fontSize: 12,
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        flex: 1,
    },
    revealButton: {
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: theme.smoke,
    },
    revealButtonText: {
        color: theme.primary,
        fontSize: 11,
        fontWeight: "600",
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
    inputDisabled: {
        opacity: 0.6,
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
    tabBar: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 16,
    },
    tab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.smoke,
        backgroundColor: theme.clear,
    },
    tabActive: {
        backgroundColor: theme.primaryBlue,
        borderColor: theme.primaryBlue,
    },
    tabText: {
        color: theme.secondary,
        fontSize: 13,
        fontWeight: "600",
    },
    tabTextActive: {
        color: theme.white,
    },
})

const Page = () => {
    const { theme } = useContext(ThemeContext)
    const { locale } = useContext(LocaleContext)
    const notifications = useNotifications()
    const styles = useMemo(() => createStyles(theme), [theme])

    useEffect(() => {
        if (typeof document === "undefined") return

        const style = document.createElement("style")
        style.textContent = `
            .services-scrollable::-webkit-scrollbar-button {
                display: none;
                width: 0;
                height: 0;
            }
        `
        document.head.appendChild(style)

        return () => {
            style.remove()
        }
    }, [])

    const [registry, setRegistry] = useState([])
    const [registryError, setRegistryError] = useState("")
    const [selected, setSelected] = useState(null) // { app, env, path, host }
    const [selectedHost, setSelectedHost] = useState("")
    const [loadState, setLoadState] = useState("idle") // idle | loading | ready | error
    const [loadError, setLoadError] = useState("")
    const [original, setOriginal] = useState(null)
    const [values, setValues] = useState(null)
    const [reveal, setReveal] = useState({})
    const [saving, setSaving] = useState(false)
    const [deploying, setDeploying] = useState(false)
    const [restarting, setRestarting] = useState(false)
    const [promoting, setPromoting] = useState(false)
    const [rollingBack, setRollingBack] = useState(false)
    const [deployment, setDeployment] = useState(null)
    /** Fetch the registry once. */
    useEffect(() => {
        let cancelled = false
            ; (async () => {
                const { status, data } = await requestJson("/api/configs", "GET")
                if (cancelled) return
                if (status >= 200 && status < 300 && Array.isArray(data?.configs)) {
                    const sorted = [...data.configs].sort((a, b) => {
                        if (a.env !== b.env) return (envOrder[a.env] ?? 99) - (envOrder[b.env] ?? 99)
                        return a.app.localeCompare(b.app)
                    })
                    setRegistry(sorted)
                    if (!selected && sorted.length > 0) setSelected(sorted[0])
                } else {
                    setRegistryError(data?.message || locale.failed_to_load_config)
                }
            })()
        return () => { cancelled = true }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (selected?.env === "prod") {
            setSelectedHost("AREA52")
        }
    }, [selected])

    /** Fetch the selected config whenever the selection changes. */
    const loadSelected = useCallback(async () => {
        if (!selected) return
        setLoadState("loading")
        setLoadError("")
        const qs = selected.env === "prod" && selectedHost ? `?host=${encodeURIComponent(selectedHost)}` : ""
        const { status, data } = await requestJson(`/api/configs/${selected.app}/${selected.env}${qs}`, "GET")
        if (status >= 200 && status < 300 && data?.config) {
            setOriginal({ config: data.config })
            setValues(data.config)
            setReveal({})
            setDeployment(data.deployment || null)
            setLoadState("ready")
        } else {
            if (data?.code === "gitea_not_configured") {
                setLoadError(locale.gitea_not_configured)
            } else {
                setLoadError(data?.message || locale.failed_to_load_config)
            }
            setLoadState("error")
        }
    }, [selected, locale, selectedHost])

    useEffect(() => { loadSelected() }, [loadSelected])

    const dirty = useMemo(() => {
        if (!values || !original) return false
        return JSON.stringify(values) !== JSON.stringify(original.config)
    }, [values, original])

    /** Group fields by their prefix for categorized rendering */
    const groupedFields = useMemo(() => {
        if (!values) return {}

        const groups = {}
        Object.keys(values).forEach(key => {
            // Match the first word (letters/numbers) before an underscore or space
            const match = key.match(/^([a-zA-Z0-9]+)[_\s](.*)$/)

            let category = "GENERAL"
            let label = key

            if (match) {
                category = match[1].toUpperCase()
                // Replace remaining underscores with spaces for a cleaner label
                label = match[2].replace(/_/g, " ").toUpperCase()
            } else {
                label = key.toUpperCase()
            }

            if (!groups[category]) groups[category] = []
            groups[category].push({ key, label })
        })

        return groups
    }, [values])

    const setField = (key, raw) => {
        setValues(prev => {
            const next = { ...prev }
            const orig = original?.config?.[key]

            if (typeof orig === "number") {
                if (raw === "") next[key] = 0
                else {
                    const n = Number(raw)
                    next[key] = Number.isNaN(n) ? raw : n
                }
            } else if (typeof orig === "boolean") {
                next[key] = Boolean(raw)
            } else {
                next[key] = raw
            }
            return next
        })
    }

    const toggleReveal = (key) => setReveal(r => ({ ...r, [key]: !r[key] }))

    const handleDiscard = () => {
        if (!original) return
        setValues(original.config)
    }

    const handleSave = async () => {
        if (!selected || !values) return
        setSaving(true)
        const qs = selected.env === "prod" && selectedHost ? `?host=${encodeURIComponent(selectedHost)}` : ""
        const { status, data } = await requestJson(
            `/api/configs/${selected.app}/${selected.env}${qs}`,
            "PUT",
            values,
        )
        setSaving(false)
        if (status >= 200 && status < 300) {
            setOriginal(prev => ({ ...(prev || {}), config: values }))
            if (data?.deployment) {
                setDeployment(data.deployment)
            } else {
                setDeployment(prev => prev ? { ...prev, latest_update: new Date().toISOString(), status: "Success" } : prev)
            }
            notifications.success(`${String(selected.app || "").toUpperCase()} ${envLabel(selected.env)} configuration deployed successfully.`)
            return
        }
        if (data?.code === "gitea_not_configured") {
            notifications.error(locale.gitea_not_configured)
            return
        }
        notifications.error(data?.details || data?.message || locale.failed_to_save_config)
    }

    const handleTriggerDeployment = async () => {
        if (!selected) return
        setDeploying(true)
        const qs = selected.env === "prod" && selectedHost ? `?host=${encodeURIComponent(selectedHost)}` : ""
        const { status, data } = await requestJson(`/api/configs/${selected.app}/${selected.env}/deploy${qs}`, "POST")
        setDeploying(false)

        if (status >= 200 && status < 300) {
            if (data?.deployment) {
                setDeployment(data.deployment)
            } else {
                setDeployment(prev => prev ? { ...prev, latest_update: new Date().toISOString(), status: "Success" } : prev)
            }
            notifications.success(`${String(selected.app || "").toUpperCase()} ${envLabel(selected.env)} binary deployed successfully.`)
            return
        }

        if (data?.code === "gitea_not_configured") {
            notifications.error(locale.gitea_not_configured)
            return
        }
        notifications.error(data?.message || locale.failed_to_trigger_deployment || "Failed to trigger deployment.")
    }

    const handleRestartService = async () => {
        if (!selected) return
        setRestarting(true)
        const qs = selected.env === "prod" && selectedHost ? `?host=${encodeURIComponent(selectedHost)}` : ""
        const { status, data } = await requestJson(`/api/configs/${selected.app}/${selected.env}/restart${qs}`, "POST")
        setRestarting(false)

        if (status >= 200 && status < 300) {
            if (data?.deployment) {
                setDeployment(data.deployment)
            } else {
                setDeployment(prev => prev ? { ...prev, latest_update: new Date().toISOString(), status: "Success" } : prev)
            }
            notifications.success(`${String(selected.app || "").toUpperCase()} ${envLabel(selected.env)} service restarted successfully.`)
            return
        }

        notifications.error(data?.details || data?.message || (locale.failed_to_restart_service || "Failed to restart service."))
    }

    const handlePromoteToProd = async () => {
        if (!selected || selected.app !== "core" || (selected.env !== "prod" && selected.env !== "test")) return
        setPromoting(true)

        const { status, data } = await requestJson(`/api/configs/core/promote?env=${selected.env}`, "POST")
        setPromoting(false)

        if (status >= 200 && status < 300) {
            if (data?.deployment) {
                setDeployment(data.deployment)
            } else {
                setDeployment(prev => prev ? { ...prev, latest_update: new Date().toISOString(), status: "Success" } : prev)
            }
            notifications.success(locale.promote_triggered || "Core binary promoted to production successfully.")
            return
        }

        if (data?.message?.includes("NO_BACKUP_FOUND") || data?.details?.includes("NO_BACKUP_FOUND")) {
            notifications.error(locale.rollback_no_backup || "No backup found on production hosts for rollback.")
            return
        }

        notifications.error(data?.details || data?.message || (locale.failed_to_promote || "Failed to promote core to production."))
    }

    const handleRollbackOne = async () => {
        if (!selected || selected.app !== "core" || (selected.env !== "prod" && selected.env !== "test")) return
        setRollingBack(true)

        const { status, data } = await requestJson(`/api/configs/core/rollback?env=${selected.env}`, "POST")
        setRollingBack(false)

        if (status >= 200 && status < 300) {
            if (data?.deployment) {
                setDeployment(data.deployment)
            } else {
                setDeployment(prev => prev ? { ...prev, latest_update: new Date().toISOString(), status: "Success" } : prev)
            }
            notifications.success(locale.rollback_triggered || "Core binary rolled back on production successfully.")
            return
        }

        if (data?.message?.includes("NO_BACKUP_FOUND") || data?.details?.includes("NO_BACKUP_FOUND")) {
            notifications.error(locale.rollback_no_backup || "No backup found on production hosts for rollback.")
            return
        }

        notifications.error(data?.details || data?.message || (locale.failed_to_rollback || "Failed to rollback core on production."))
    }

    const envLabel = (env) => locale[`env_${env}`] || env
    const groupedRegistry = useMemo(() => {
        const groups = { ops: [], test: [], prod: [] }
        registry.forEach((item) => {
            if (groups[item.env]) groups[item.env].push(item)
        })
        return groups
    }, [registry])

    const formatDeploymentTime = (value) => {
        if (!value) return "Unknown"
        const date = new Date(value)
        if (Number.isNaN(date.getTime())) return value

        const day = date.getUTCDate()
        const month = date.getUTCMonth() + 1
        const year = date.getUTCFullYear()
        const hours = String(date.getUTCHours()).padStart(2, "0")
        const minutes = String(date.getUTCMinutes()).padStart(2, "0")
        const seconds = String(date.getUTCSeconds()).padStart(2, "0")

        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds} UTC`
    }
    const deploymentStatus = (deploying || restarting)
        ? "Running"
        : (deployment?.deployment_status || deployment?.status || "Idle")
    const statusStyle = {
        idle: styles.statusIdle,
        running: styles.statusRunning,
        success: styles.statusSuccess,
        error: styles.statusError,
    }[String(deploymentStatus).toLowerCase()] || styles.statusIdle

    const renderConfig = () => {
        if (!selected) return null

        return (
            <View style={styles.configCard}>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{locale.description || "Description"}</Text>
                    <Text style={styles.infoValue}>{deployment?.description || serviceDescriptions[selected.app] || `${String(selected.app || "").toUpperCase()} service`}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{locale.environment || "Environment"}</Text>
                    <Text style={styles.infoValue}>{envLabel(selected.env)}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{locale.target_host || "Target Host"}</Text>
                    <Text style={styles.infoValue}>{selected.env === "prod" ? selectedHost : (deployment?.host || selected.host || "-")}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{locale.latest_update_binary || "Latest Update of Binary"}</Text>
                    <Text style={styles.infoValue}>{formatDeploymentTime(deployment?.latest_update_binary)}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{locale.latest_update_configuration || "Latest Update of Configuration"}</Text>
                    <Text style={styles.infoValue}>{formatDeploymentTime(deployment?.latest_update_configuration || deployment?.latest_update)}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{locale.binary_path || "Binary Path"}</Text>
                    <Text style={styles.infoValue}>{deployment?.binary_path || `/usr/local/bin/${serviceBinaries[selected.app] || ""}`}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{locale.configuration_path || "Configuration Path"}</Text>
                    <Text style={styles.infoValue}>{deployment?.configuration_path || selected.path}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{locale.deployment_status || "Deployment Status"}</Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                        <View style={[styles.statusDot, statusStyle]} />
                        <Text style={styles.timerText}>{deploymentStatus}</Text>
                    </View>
                </View>

                <View style={{ flex: 1, minHeight: 0 }}>
                    {loadState === "loading" && (
                        <View style={styles.feedback}>
                            <ActivityIndicator color={theme.primary} />
                            <Text style={styles.feedbackText}>{locale.loading}</Text>
                        </View>
                    )}

                    {loadState === "error" && (
                        <View style={styles.feedback}>
                            <Text style={styles.errorText}>{loadError}</Text>
                            <Pressable
                                onPress={loadSelected}
                                style={({ hovered, pressed }) => [
                                    styles.button,
                                    styles.buttonGhost,
                                    (pressed || hovered) && styles.buttonGhostHover,
                                ]}
                            >
                                <Text style={styles.buttonGhostText}>{locale.retry}</Text>
                            </Pressable>
                        </View>
                    )}

                    {loadState === "ready" && values && (
                        <>
                            <ScrollView style={styles.formScroll} className="services-scrollable" contentContainerStyle={{ paddingTop: 8, paddingBottom: 16 }}>
                                {Object.entries(groupedFields).map(([category, fields], index) => (
                                    <View key={category}>
                                        <Text style={[styles.sectionHeader, index === 0 && { marginTop: 24 }]}>
                                            {category}
                                        </Text>

                                        {fields.map(({ key, label }) => {
                                            const orig = original?.config?.[key]
                                            const value = values[key]
                                            const isNumber = typeof orig === "number"
                                            const isBoolean = typeof orig === "boolean"
                                            const secret = isSecretKey(key)
                                            const revealed = !!reveal[key]
                                            const display = value === null || value === undefined ? "" : String(value)

                                            return <View key={key} style={styles.field}>
                                                <View style={styles.fieldRow}>
                                                    <Text style={styles.fieldLabel}>{label}</Text>
                                                    {secret && (
                                                        <Pressable
                                                            onPress={() => toggleReveal(key)}
                                                            style={styles.revealButton}
                                                        >
                                                            <Text style={styles.revealButtonText}>
                                                                {revealed ? locale.hide : locale.reveal}
                                                            </Text>
                                                        </Pressable>
                                                    )}
                                                </View>

                                                {isBoolean ? (
                                                    <View style={{ alignItems: "flex-start" }}>
                                                        <Switch
                                                            value={!!value}
                                                            onValueChange={(v) => setField(key, v)}
                                                            disabled={saving}
                                                        />
                                                    </View>
                                                ) : (
                                                    <TextInput
                                                        value={display}
                                                        onChangeText={(v) => setField(key, v)}
                                                        secureTextEntry={secret && !revealed}
                                                        keyboardType={isNumber ? "numeric" : "default"}
                                                        inputMode={isNumber ? "numeric" : "text"}
                                                        autoCapitalize="none"
                                                        autoCorrect={false}
                                                        editable={!saving}
                                                        style={[styles.input, saving && styles.inputDisabled]}
                                                    />
                                                )}
                                            </View>
                                        })}
                                    </View>
                                ))}
                            </ScrollView>

                            <View style={{ flexDirection: "row", gap: 12, paddingTop: 16 }}>
                                {selected && (
                                    <Pressable
                                        onPress={handleRestartService}
                                        disabled={saving || deploying || restarting || loadState !== "ready"}
                                        style={({ hovered, pressed }) => [
                                            styles.button,
                                            styles.buttonRestart,
                                            (pressed || hovered) && styles.buttonRestartHover,
                                            (saving || deploying || restarting || loadState !== "ready") && styles.buttonDisabled,
                                        ]}
                                    >
                                        <Text style={styles.buttonRestartText}>
                                            {restarting ? (locale.restarting || "Restarting...") : (locale.restart_service || "Restart Service")}
                                        </Text>
                                    </Pressable>
                                )}

                                {selected.env === "prod" && (
                                    <Pressable
                                        onPress={handleTriggerDeployment}
                                        disabled={saving || deploying || restarting || loadState !== "ready"}
                                        style={({ hovered, pressed }) => [
                                            styles.button,
                                            styles.buttonPrimary,
                                            (pressed || hovered) && styles.buttonPrimaryHover,
                                            (saving || deploying || restarting || loadState !== "ready") && styles.buttonDisabled,
                                        ]}
                                    >
                                        <Text style={styles.buttonPrimaryText}>
                                            {deploying ? (locale.deploying || "Deploying...") : (locale.deploy_binary || "Deploy Binary")}
                                        </Text>
                                    </Pressable>
                                )}

                                <Pressable
                                    onPress={handleSave}
                                    disabled={!dirty || saving || deploying || restarting || loadState !== "ready"}
                                    style={({ hovered, pressed }) => [
                                        styles.button,
                                        styles.buttonPrimary,
                                        (pressed || hovered) && styles.buttonPrimaryHover,
                                        (!dirty || saving || deploying || restarting || loadState !== "ready") && styles.buttonDisabled,
                                    ]}
                                >
                                    <Text style={styles.buttonPrimaryText}>
                                        {saving ? locale.saving : (locale.deploy_configuration || "Deploy Config")}
                                    </Text>
                                </Pressable>

                                <Pressable
                                    onPress={handleDiscard}
                                    disabled={!dirty || saving || deploying || restarting}
                                    style={({ hovered, pressed }) => [
                                        styles.button,
                                        dirty ? styles.buttonDanger : styles.buttonGhost,
                                        dirty
                                            ? (pressed || hovered) && styles.buttonDangerHover
                                            : (pressed || hovered) && styles.buttonGhostHover,
                                        (!dirty || saving || deploying || restarting) && styles.buttonDisabled,
                                    ]}
                                >
                                    <Text style={dirty ? styles.buttonDangerText : styles.buttonGhostText}>{locale.discard_changes || "Discard Changes"}</Text>
                                </Pressable>
                            </View>

                            {selected.app === "core" && selected.env === "test" && (
                                <View style={{ flexDirection: "row", gap: 12, paddingTop: 12 }}>
                                    <Pressable
                                        onPress={handlePromoteToProd}
                                        disabled={saving || deploying || restarting || promoting || rollingBack || loadState !== "ready"}
                                        style={({ hovered, pressed }) => [
                                            styles.button,
                                            styles.buttonPrimary,
                                            (pressed || hovered) && styles.buttonPrimaryHover,
                                            (saving || deploying || restarting || promoting || rollingBack || loadState !== "ready") && styles.buttonDisabled,
                                        ]}
                                    >
                                        <Text style={styles.buttonPrimaryText}>
                                            {promoting ? (locale.promoting || "Promoting...") : (locale.promote_to_prod || "PROMOTE TO PROD")}
                                        </Text>
                                    </Pressable>

                                    <Pressable
                                        onPress={handleRollbackOne}
                                        disabled={saving || deploying || restarting || promoting || rollingBack || loadState !== "ready"}
                                        style={({ hovered, pressed }) => [
                                            styles.button,
                                            styles.buttonRestart,
                                            (pressed || hovered) && styles.buttonRestartHover,
                                            (saving || deploying || restarting || promoting || rollingBack || loadState !== "ready") && styles.buttonDisabled,
                                        ]}
                                    >
                                        <Text style={styles.buttonRestartText}>
                                            {rollingBack ? (locale.rolling_back || "Rolling back...") : (locale.rollback_one || "ROLLBACK ONE")}
                                        </Text>
                                    </Pressable>
                                </View>
                            )}
                        </>
                    )}
                </View>
            </View>
        )
    }

    return <View style={styles.container}>
        <ScrollView style={styles.sidebar} className="services-scrollable">
            <Text style={styles.sidebarHeader}>{locale.services}</Text>
            {registryError ? (
                <View style={{ paddingHorizontal: 20 }}>
                    <Text style={styles.errorText}>{registryError}</Text>
                </View>
            ) : null}
            {envGroups.map((env) => (
                <View key={env}>
                    <View style={styles.envSectionSeparator} />
                    <Text style={styles.envSectionHeader}>{String(envLabel(env)).toUpperCase()}</Text>
                    {groupedRegistry[env].map(item => {
                        const active = selected && selected.app === item.app && selected.env === item.env
                        return <Pressable
                            key={`${item.app}/${item.env}`}
                            onPress={() => { setSelected(item); if (item.env === "prod") setSelectedHost("AREA52") }}
                            style={({ hovered, pressed }) => [
                                styles.appRow,
                                active && styles.appRowActive,
                                !active && (pressed || hovered) && styles.appRowHover,
                            ]}
                        >
                            <Text style={styles.appLabel}>{String(item.app || "").toUpperCase()}</Text>
                        </Pressable>
                    })}
                </View>
            ))}
        </ScrollView>

        <View style={styles.main}>
            {!selected && (
                <View style={styles.feedback}>
                    <Text style={styles.feedbackText}>{locale.select_application}</Text>
                </View>
            )}

            {selected && (
                <>
                    <View style={styles.header}>
                        <PageHeader title={locale.configuration} />
                    </View>

                    {selected.env === "prod" && (
                        <View style={styles.tabBar}>
                            {["AREA52", "AREA53", "AREA54"].map((host) => {
                                const active = selectedHost === host
                                return <Pressable
                                    key={host}
                                    onPress={() => setSelectedHost(host)}
                                    style={({ hovered, pressed }) => [
                                        styles.tab,
                                        active && styles.tabActive,
                                        !active && (pressed || hovered) && { backgroundColor: theme.ternary },
                                    ]}
                                >
                                    <Text style={[styles.tabText, active && styles.tabTextActive]}>
                                        {host}
                                    </Text>
                                </Pressable>
                            })}
                        </View>
                    )}

                    {renderConfig()}
                </>
            )}
        </View>
    </View>
}

export default Page