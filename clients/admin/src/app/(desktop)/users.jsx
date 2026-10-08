import { useCallback, useContext, useEffect, useMemo, useState } from "react"
import { StyleSheet, View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native"
import ThemeContext, { alpha } from "../../configs/themes"
import LocaleContext from "../../configs/locales"
import { requestJson } from "../../configs/services"
import ModalUser from "../../components/desktop/modal_user"
import PageHeader from "../../components/desktop/page_header"

const createStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        gap: 16,
    },
    header: {
        minHeight: 36,
    },
    primaryButton: {
        height: 36,
        paddingHorizontal: 14,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.primaryBlue,
    },
    primaryButtonHover: {
        backgroundColor: theme.secondaryBlue,
    },
    primaryButtonText: {
        color: theme.white,
        fontSize: 14,
        fontWeight: "600",
    },
    card: {
        flex: 1,
        backgroundColor: theme.clear,
        borderWidth: 1,
        borderColor: theme.smoke,
        borderRadius: 10,
        overflow: "hidden",
    },
    tableHeader: {
        flexDirection: "row",
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: theme.ternary,
        borderBottomWidth: 1,
        borderBottomColor: theme.smoke,
    },
    headerCell: {
        color: theme.secondary,
        fontSize: 12,
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.smoke,
    },
    cell: {
        color: theme.invert,
        fontSize: 14,
    },
    cellMuted: {
        color: theme.secondary,
        fontSize: 13,
    },
    colEmail: {
        flex: 2,
    },
    colName: {
        flex: 2,
    },
    colRole: {
        flex: 1,
    },
    colCreated: {
        flex: 1,
    },
    colActions: {
        width: 220,
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 8,
    },
    rolePill: {
        alignSelf: "flex-start",
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 999,
        borderWidth: 1,
    },
    rolePillAdmin: {
        borderColor: theme.primaryBlue,
        backgroundColor: theme.primaryBlue + alpha[20],
    },
    rolePillSupport: {
        borderColor: theme.smoke,
        backgroundColor: theme.ternary,
    },
    rolePillTextAdmin: {
        color: theme.invert,
        fontSize: 12,
        fontWeight: "600",
    },
    rolePillTextSupport: {
        color: theme.primary,
        fontSize: 12,
        fontWeight: "500",
    },
    actionButton: {
        height: 32,
        paddingHorizontal: 12,
        borderRadius: 6,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    actionButtonGhost: {
        borderColor: theme.smoke,
        backgroundColor: "transparent",
    },
    actionButtonGhostHover: {
        backgroundColor: theme.ternary,
    },
    actionButtonDanger: {
        borderColor: theme.primaryRed,
        backgroundColor: "transparent",
    },
    actionButtonDangerHover: {
        backgroundColor: theme.primaryRed + alpha[20],
    },
    actionButtonDangerSolid: {
        borderColor: theme.primaryRed,
        backgroundColor: theme.primaryRed,
    },
    actionText: {
        fontSize: 13,
        fontWeight: "600",
    },
    actionTextGhost: {
        color: theme.primary,
    },
    actionTextDanger: {
        color: theme.primaryRed,
    },
    actionTextDangerSolid: {
        color: theme.white,
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
})

const formatDate = (value) => {
    if (!value) return "—"
    const d = new Date(value)
    if (isNaN(d.getTime())) return "—"
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" })
}

/** Normalize the list response: accept either an array or {users: [...]}. */
const extractUsers = (data) => {
    if (Array.isArray(data)) return data
    if (Array.isArray(data?.users)) return data.users
    return []
}

const Page = () => {
    const { theme } = useContext(ThemeContext)
    const { locale } = useContext(LocaleContext)
    const styles = useMemo(() => createStyles(theme), [theme])

    const [users, setUsers] = useState([])
    const [loadState, setLoadState] = useState("loading") // loading | ready | error
    const [loadError, setLoadError] = useState("")
    const [modal, setModal] = useState({ visible: false, mode: "create", initial: null })
    const [pendingDelete, setPendingDelete] = useState(null)
    const [deleting, setDeleting] = useState(false)
    const [rowError, setRowError] = useState("")

    const load = useCallback(async () => {
        setLoadState("loading")
        setLoadError("")
        const { status, data } = await requestJson("/api/users", "GET")
        if (status >= 200 && status < 300) {
            setUsers(extractUsers(data))
            setLoadState("ready")
        } else {
            setLoadError(data?.message || locale.failed_to_load_users)
            setLoadState("error")
        }
    }, [locale])

    useEffect(() => { load() }, [load])

    const openCreate = () => setModal({ visible: true, mode: "create", initial: null })
    const openEdit = (u) => setModal({ visible: true, mode: "edit", initial: u })
    const closeModal = () => setModal(m => ({ ...m, visible: false }))

    /** Submit handler for both create and edit. Returns {ok, message}. */
    const handleSubmit = async ({ email, name, role }) => {
        if (modal.mode === "edit") {
            const { status, data } = await requestJson(
                `/api/users/${modal.initial.id}`,
                "PATCH",
                { email, name, role },
            )
            if (status >= 200 && status < 300) {
                await load()
                return { ok: true }
            }
            if (data?.code === "last_admin") return { ok: false, message: locale.cannot_demote_last_admin }
            if (status === 409) return { ok: false, message: data?.message || locale.duplicate_email }
            return { ok: false, message: data?.message || locale.failed_to_save_user }
        }
        const { status, data } = await requestJson("/api/users", "POST", { email, name, role })
        if (status >= 200 && status < 300) {
            await load()
            return { ok: true }
        }
        if (status === 409) return { ok: false, message: locale.duplicate_email }
        return { ok: false, message: data?.message || locale.failed_to_save_user }
    }

    const confirmDelete = async (u) => {
        setDeleting(true)
        setRowError("")
        const { status, data } = await requestJson(`/api/users/${u.id}`, "DELETE")
        setDeleting(false)
        if (status >= 200 && status < 300) {
            setPendingDelete(null)
            await load()
            return
        }
        if (data?.code === "last_admin") { setRowError(locale.cannot_delete_last_admin); return }
        if (data?.code === "self_delete") { setRowError(locale.cannot_delete_self); return }
        setRowError(data?.message || locale.failed_to_delete_user)
    }

    return <View style={styles.container}>
        <View style={styles.header}>
            <PageHeader title={locale.users}>
                <Pressable
                    onPress={openCreate}
                    style={({ hovered, pressed }) => [
                        styles.primaryButton,
                        (pressed || hovered) && styles.primaryButtonHover,
                    ]}
                >
                    <Text style={styles.primaryButtonText}>+ {locale.new_user}</Text>
                </Pressable>
            </PageHeader>
        </View>

        <View style={styles.card}>
            <View style={styles.tableHeader}>
                <Text style={[styles.headerCell, styles.colName]}>{locale.name}</Text>
                <Text style={[styles.headerCell, styles.colEmail]}>{locale.email}</Text>
                <Text style={[styles.headerCell, styles.colRole]}>{locale.role}</Text>
                <Text style={[styles.headerCell, styles.colCreated]}>{locale.created}</Text>
                <Text style={[styles.headerCell, styles.colActions, { textAlign: "right" }]}>{locale.actions}</Text>
            </View>

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
                        onPress={load}
                        style={({ hovered, pressed }) => [
                            styles.actionButton,
                            styles.actionButtonGhost,
                            (pressed || hovered) && styles.actionButtonGhostHover,
                        ]}
                    >
                        <Text style={[styles.actionText, styles.actionTextGhost]}>{locale.retry}</Text>
                    </Pressable>
                </View>
            )}

            {loadState === "ready" && users.length === 0 && (
                <View style={styles.feedback}>
                    <Text style={styles.feedbackText}>{locale.no_users}</Text>
                </View>
            )}

            {loadState === "ready" && users.length > 0 && (
                <ScrollView>
                    {users.map(u => {
                        const isPending = pendingDelete?.id === u.id
                        const admin = u.role === "admin"
                        return <View key={u.id} style={styles.row}>
                            <Text numberOfLines={1} style={[styles.cell, styles.colName]}>{u.name || "—"}</Text>
                            <Text numberOfLines={1} style={[styles.cell, styles.colEmail]}>{u.email}</Text>
                            <View style={styles.colRole}>
                                <View style={[styles.rolePill, admin ? styles.rolePillAdmin : styles.rolePillSupport]}>
                                    <Text style={admin ? styles.rolePillTextAdmin : styles.rolePillTextSupport}>
                                        {admin ? locale.role_admin : locale.role_support}
                                    </Text>
                                </View>
                            </View>
                            <Text style={[styles.cellMuted, styles.colCreated]}>
                                {formatDate(u.created_at || u.CreatedAt)}
                            </Text>
                            <View style={styles.colActions}>
                                {isPending ? <>
                                    <Pressable
                                        onPress={() => { setPendingDelete(null); setRowError("") }}
                                        disabled={deleting}
                                        style={({ hovered, pressed }) => [
                                            styles.actionButton,
                                            styles.actionButtonGhost,
                                            (pressed || hovered) && styles.actionButtonGhostHover,
                                        ]}
                                    >
                                        <Text style={[styles.actionText, styles.actionTextGhost]}>{locale.cancel}</Text>
                                    </Pressable>
                                    <Pressable
                                        onPress={() => confirmDelete(u)}
                                        disabled={deleting}
                                        style={({ hovered, pressed }) => [
                                            styles.actionButton,
                                            styles.actionButtonDangerSolid,
                                            (pressed || hovered) && { opacity: 0.85 },
                                            deleting && { opacity: 0.7 },
                                        ]}
                                    >
                                        <Text style={[styles.actionText, styles.actionTextDangerSolid]}>
                                            {deleting ? locale.deleting : locale.confirm}
                                        </Text>
                                    </Pressable>
                                </> : <>
                                    <Pressable
                                        onPress={() => openEdit(u)}
                                        style={({ hovered, pressed }) => [
                                            styles.actionButton,
                                            styles.actionButtonGhost,
                                            (pressed || hovered) && styles.actionButtonGhostHover,
                                        ]}
                                    >
                                        <Text style={[styles.actionText, styles.actionTextGhost]}>{locale.edit}</Text>
                                    </Pressable>
                                    <Pressable
                                        onPress={() => { setPendingDelete(u); setRowError("") }}
                                        style={({ hovered, pressed }) => [
                                            styles.actionButton,
                                            styles.actionButtonDanger,
                                            (pressed || hovered) && styles.actionButtonDangerHover,
                                        ]}
                                    >
                                        <Text style={[styles.actionText, styles.actionTextDanger]}>{locale.delete}</Text>
                                    </Pressable>
                                </>}
                            </View>
                        </View>
                    })}
                </ScrollView>
            )}

            {rowError ? (
                <View style={[styles.feedback, { paddingVertical: 12 }]}>
                    <Text style={styles.errorText}>{rowError}</Text>
                </View>
            ) : null}
        </View>

        <ModalUser
            visible={modal.visible}
            mode={modal.mode}
            initial={modal.initial}
            onSubmit={handleSubmit}
            onClose={closeModal}
        />
    </View>
}

export default Page
