/** React & Expo */
import { useState, useContext, useMemo, useEffect } from "react"
import { StyleSheet, View, Text, Pressable } from "react-native"
import { usePathname } from "expo-router"
/** Configs */
import ThemeContext from "../../configs/themes"
import { useAuth } from "../../configs/auth"
import storage from "../../configs/storage"
/** Components */
import SidebarButton from "./button_sidebar"
/** Icons */
import IconHome from "../icons/home"
import IconUsers from "../icons/users"
import IconApplications from "../icons/applications"
import IconInstallers from "../icons/installers"
import IconSettings from "../icons/settings"
import IconChevron from "../icons/chevron"
import IconLogout from "../icons/logout"
import MailIcon from "../icons/emails"

const EXPANDED_WIDTH = 240
const COLLAPSED_WIDTH = 64
const COLLAPSED_STORAGE_KEY = "admin.sidebar.collapsed"

const readCollapsedState = () => {
    if (typeof window === "undefined") {
        return false
    }

    try {
        const rawValue = window.localStorage.getItem(COLLAPSED_STORAGE_KEY)

        return rawValue != null ? JSON.parse(rawValue) : false
    } catch (error) {
        return false
    }
}

const NAV_ITEMS = [
    { href: "/dashboard", label: "Dashboard", icon: IconHome },
    { href: "/users", label: "Users", icon: IconUsers },
    { href: "/services", label: "Services", icon: IconApplications },
    { href: "/installers", label: "Installers", icon: IconInstallers },
    { href: "/mailer", label: "Mailer", icon: MailIcon },
    { href: "/settings", label: "Settings", icon: IconSettings },
]

const createStyles = (theme) => StyleSheet.create({
    container: {
        backgroundColor: theme.clear,
        borderRightWidth: 1,
        borderRightColor: theme.smoke,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 16,
        gap: 8,
    },
    headerCollapsed: {
        justifyContent: "center",
    },
    headerExpanded: {
        justifyContent: "space-between",
    },
    brand: {
        color: theme.invert,
        fontWeight: "800",
        fontSize: 18,
        letterSpacing: -0.5,
    },
    collapseToggle: {
        padding: 6,
        borderRadius: 6,
    },
    collapseToggleHover: {
        backgroundColor: theme.ternary,
    },
    nav: {
        flex: 1,
    },
    account: {
        borderTopWidth: 1,
        borderTopColor: theme.smoke,
        padding: 12,
        gap: 6,
    },
    accountEmail: {
        color: theme.secondary,
        fontSize: 12,
        paddingHorizontal: 4,
    },
    signOut: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    signOutCollapsed: {
        justifyContent: "center",
    },
    signOutExpanded: {
        justifyContent: "flex-start",
    },
    signOutHover: {
        backgroundColor: theme.ternary,
    },
    signOutLabel: {
        color: theme.primary,
        fontSize: 14,
        fontWeight: "500",
    },
})

const Sidebar = () => {
    const { theme } = useContext(ThemeContext)
    const { user, signOut } = useAuth()
    const pathname = usePathname()
    const [collapsed, setCollapsed] = useState(() => readCollapsedState())
    const width = collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH
    const styles = useMemo(() => createStyles(theme), [theme])

    useEffect(() => {
        ; (async () => {
            const savedCollapsed = await storage.get(COLLAPSED_STORAGE_KEY)

            if (typeof savedCollapsed === "boolean") {
                setCollapsed(savedCollapsed)
            }
        })()
    }, [])

    useEffect(() => {
        storage.set(COLLAPSED_STORAGE_KEY, collapsed)
    }, [collapsed])

    return (
        <View style={[styles.container, { width }]}>
            <View style={[styles.header, collapsed ? styles.headerCollapsed : styles.headerExpanded]}>
                {!collapsed && <Text style={styles.brand}>OPERATIONS</Text>}
                <Pressable onPress={() => setCollapsed(c => !c)} style={({ hovered, pressed }) => [styles.collapseToggle, (pressed || hovered) && styles.collapseToggleHover]}>
                    <IconChevron color={theme.primary} dir={collapsed ? "right" : "left"} />
                </Pressable>
            </View>

            {/* Navigation items */}
            <View style={styles.nav}>
                {NAV_ITEMS.map(item => <SidebarButton
                    key={item.href}
                    item={item}
                    collapsed={collapsed}
                    active={pathname === item.href || pathname.startsWith(item.href + "/")}
                    theme={theme}
                />
                )}
            </View>

            {/* Account section */}
            <View style={styles.account}>
                {!collapsed && user?.email && <Text numberOfLines={1} style={styles.accountEmail}>{user.email}</Text>}
                <Pressable
                    onPress={signOut}
                    style={({ hovered, pressed }) => [
                        styles.signOut,
                        collapsed ? styles.signOutCollapsed : styles.signOutExpanded,
                        (pressed || hovered) && styles.signOutHover,
                    ]}
                >
                    <IconLogout color={theme.primary} />
                    {!collapsed && <Text style={styles.signOutLabel}>Sign out</Text>}
                </Pressable>
            </View>
        </View>
    )
}

export default Sidebar
