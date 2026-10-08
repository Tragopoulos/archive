import { useContext, useEffect, useMemo, useState } from "react"
import { StyleSheet, View, Text, TextInput, Pressable, Modal, ActivityIndicator } from "react-native"
import ThemeContext, { alpha } from "../../configs/themes"
import LocaleContext from "../../configs/locales"

const ROLES = ["admin", "support"]

const createStyles = (theme) => StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: theme.black + alpha[60],
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
    },
    card: {
        width: "100%",
        maxWidth: 420,
        backgroundColor: theme.clear,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.smoke,
        padding: 24,
        gap: 16,
    },
    title: {
        color: theme.invert,
        fontSize: 20,
        fontWeight: "700",
    },
    fieldLabel: {
        color: theme.secondary,
        fontSize: 12,
        fontWeight: "600",
        marginBottom: 6,
        textTransform: "uppercase",
        letterSpacing: 0.5,
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
    roleRow: {
        flexDirection: "row",
        gap: 8,
    },
    roleChip: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.smoke,
        alignItems: "center",
        backgroundColor: theme.ternary,
    },
    roleChipActive: {
        borderColor: theme.primaryBlue,
        backgroundColor: theme.primaryBlue + alpha[20],
    },
    roleChipText: {
        color: theme.primary,
        fontSize: 14,
        fontWeight: "500",
    },
    roleChipTextActive: {
        color: theme.invert,
        fontWeight: "600",
    },
    error: {
        color: theme.primaryRed,
        fontSize: 13,
    },
    footer: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 8,
        marginTop: 8,
    },
    button: {
        height: 38,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 8,
    },
    buttonGhost: {
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: theme.smoke,
    },
    buttonGhostHover: {
        backgroundColor: theme.ternary,
    },
    buttonPrimary: {
        backgroundColor: theme.primaryBlue,
    },
    buttonPrimaryHover: {
        backgroundColor: theme.secondaryBlue,
    },
    buttonText: {
        fontSize: 14,
        fontWeight: "600",
    },
    buttonTextGhost: {
        color: theme.primary,
    },
    buttonTextPrimary: {
        color: theme.white,
    },
})

const ModalUser = ({ visible, mode, initial, onSubmit, onClose }) => {
    const { theme } = useContext(ThemeContext)
    const { locale } = useContext(LocaleContext)
    const styles = useMemo(() => createStyles(theme), [theme])

    const [email, setEmail] = useState("")
    const [name, setName] = useState("")
    const [role, setRole] = useState("support")
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        if (!visible) return
        setEmail(initial?.email || "")
        setName(initial?.name || "")
        setRole(initial?.role || "support")
        setError("")
        setSubmitting(false)
    }, [visible, initial])

    const isEdit = mode === "edit"

    const handleSubmit = async () => {
        const trimmedEmail = email.trim().toLowerCase()
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            setError(locale.invalid_email)
            return
        }
        if (!ROLES.includes(role)) {
            setError(locale.failed_to_save_user)
            return
        }
        setSubmitting(true)
        setError("")
        try {
            const result = await onSubmit({ email: trimmedEmail, name: name.trim(), role })
            if (result?.ok) {
                onClose()
                return
            }
            setError(result?.message || locale.failed_to_save_user)
        } finally {
            setSubmitting(false)
        }
    }

    return <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <View style={styles.backdrop}>
            <View style={styles.card}>
                <Text style={styles.title}>{isEdit ? locale.edit_user : locale.new_user}</Text>

                <View>
                    <Text style={styles.fieldLabel}>{locale.email}</Text>
                    <TextInput
                        value={email}
                        onChangeText={(v) => { setEmail(v); if (error) setError("") }}
                        placeholder="user@example.com"
                        placeholderTextColor={theme.secondary}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        inputMode="email"
                        autoComplete="email"
                        editable={!submitting}
                        style={[styles.input, submitting && styles.inputDisabled]}
                    />
                </View>

                <View>
                    <Text style={styles.fieldLabel}>{locale.name}</Text>
                    <TextInput
                        value={name}
                        onChangeText={(v) => { setName(v); if (error) setError("") }}
                        placeholder={locale.name}
                        placeholderTextColor={theme.secondary}
                        autoCapitalize="words"
                        autoComplete="name"
                        editable={!submitting}
                        style={[styles.input, submitting && styles.inputDisabled]}
                    />
                </View>

                <View>
                    <Text style={styles.fieldLabel}>{locale.role}</Text>
                    <View style={styles.roleRow}>
                        {ROLES.map(r => {
                            const active = role === r
                            const label = r === "admin" ? locale.role_admin : locale.role_support
                            return <Pressable
                                key={r}
                                disabled={submitting}
                                onPress={() => setRole(r)}
                                style={[styles.roleChip, active && styles.roleChipActive]}
                            >
                                <Text style={[styles.roleChipText, active && styles.roleChipTextActive]}>{label}</Text>
                            </Pressable>
                        })}
                    </View>
                </View>

                {error ? <Text style={styles.error}>{error}</Text> : null}

                <View style={styles.footer}>
                    <Pressable
                        onPress={onClose}
                        disabled={submitting}
                        style={({ hovered, pressed }) => [
                            styles.button,
                            styles.buttonGhost,
                            (pressed || hovered) && styles.buttonGhostHover,
                        ]}
                    >
                        <Text style={[styles.buttonText, styles.buttonTextGhost]}>{locale.cancel}</Text>
                    </Pressable>
                    <Pressable
                        onPress={handleSubmit}
                        disabled={submitting}
                        style={({ hovered, pressed }) => [
                            styles.button,
                            styles.buttonPrimary,
                            (pressed || hovered) && styles.buttonPrimaryHover,
                            submitting && { opacity: 0.7 },
                        ]}
                    >
                        {submitting && <ActivityIndicator size="small" color={theme.white} />}
                        <Text style={[styles.buttonText, styles.buttonTextPrimary]}>
                            {submitting ? locale.saving : locale.save}
                        </Text>
                    </Pressable>
                </View>
            </View>
        </View>
    </Modal>
}

export default ModalUser
