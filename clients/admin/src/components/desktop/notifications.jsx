import { createContext, useCallback, useContext, useMemo, useState } from "react"
import { View, Text, StyleSheet } from "react-native"
import ThemeContext, { alpha } from "../../configs/themes"

const NotificationsContext = createContext({
    notify: () => { },
    success: () => { },
    error: () => { },
    info: () => { },
})

const createStyles = (theme) => StyleSheet.create({
    overlay: {
        position: "absolute",
        top: 16,
        right: 16,
        zIndex: 10000,
        gap: 10,
        maxWidth: 420,
    },
    toast: {
        borderRadius: 8,
        borderWidth: 1,
        paddingHorizontal: 14,
        paddingVertical: 10,
        shadowColor: theme.black,
        shadowOpacity: 0.2,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 3 },
        elevation: 6,
    },
    toastInfo: {
        backgroundColor: theme.primaryBlue + alpha[10],
        borderColor: theme.primaryBlue + alpha[40],
    },
    toastSuccess: {
        backgroundColor: "#22C55E" + alpha[10],
        borderColor: "#22C55E" + alpha[40],
    },
    toastError: {
        backgroundColor: theme.primaryRed + alpha[10],
        borderColor: theme.primaryRed + alpha[40],
    },
    message: {
        color: theme.invert,
        fontSize: 13,
        lineHeight: 18,
    },
})

const NotificationHost = ({ items }) => {
    const { theme } = useContext(ThemeContext)
    const styles = useMemo(() => createStyles(theme), [theme])

    if (!items.length) return null

    return (
        <View pointerEvents="box-none" style={styles.overlay}>
            {items.map((item) => (
                <View
                    key={item.id}
                    pointerEvents="none"
                    style={[
                        styles.toast,
                        item.type === "success"
                            ? styles.toastSuccess
                            : item.type === "error"
                                ? styles.toastError
                                : styles.toastInfo,
                    ]}
                >
                    <Text style={styles.message}>{item.message}</Text>
                </View>
            ))}
        </View>
    )
}

export const NotificationsProvider = ({ children }) => {
    const [items, setItems] = useState([])

    const remove = useCallback((id) => {
        setItems((prev) => prev.filter((item) => item.id !== id))
    }, [])

    const notify = useCallback((message, options = {}) => {
        if (!message) return

        const type = options.type || "info"
        const duration = Math.min(5000, Math.max(1000, Number(options.duration) || 5000))
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

        setItems((prev) => [...prev, { id, type, message: String(message) }])

        setTimeout(() => remove(id), duration)
    }, [remove])

    const value = useMemo(() => ({
        notify,
        success: (message, options = {}) => notify(message, { ...options, type: "success" }),
        error: (message, options = {}) => notify(message, { ...options, type: "error" }),
        info: (message, options = {}) => notify(message, { ...options, type: "info" }),
    }), [notify])

    return (
        <NotificationsContext.Provider value={value}>
            {children}
            <NotificationHost items={items} />
        </NotificationsContext.Provider>
    )
}

export const useNotifications = () => useContext(NotificationsContext)
