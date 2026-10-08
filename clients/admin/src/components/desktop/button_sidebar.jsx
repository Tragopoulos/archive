import { useMemo } from "react"
import { StyleSheet, Text, Pressable, View } from "react-native"
import { useRouter } from "expo-router"

const createStyles = (theme) => StyleSheet.create({
    wrapper: {
        width: "100%",
    },
    pressable: {
        minHeight: 40,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginHorizontal: 10,
        marginVertical: 2,
        borderRadius: 8,
        textDecorationLine: "none",
    },
    pressableActive: {
        backgroundColor: theme.smoke,
    },
    pressableHover: {
        backgroundColor: theme.ternary,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
    },
    rowCollapsed: {
        justifyContent: "center",
    },
    rowExpanded: {
        justifyContent: "flex-start",
    },
    iconWrapper: {
        width: 24,
        height: 24,
        flexShrink: 0,
        flexGrow: 0,
        alignItems: "center",
        justifyContent: "center",
    },
    label: {
        fontSize: 14,
        marginLeft: 12,
        flexShrink: 1,
    },
    labelActive: {
        fontWeight: "600",
    },
    labelInactive: {
        fontWeight: "500",
    },
})

const SidebarButton = ({ item, collapsed, active, theme }) => {
    const Icon = item.icon
    const color = active ? theme.invert : theme.primary
    const router = useRouter()
    const styles = useMemo(() => createStyles(theme), [theme])

    return <View style={styles.wrapper}>
        <Pressable
            onPress={() => router.push(item.href)}
            style={({ hovered, pressed }) => [styles.pressable, active ? styles.pressableActive : (pressed || hovered) && styles.pressableHover,]}>
            <View style={[styles.row, collapsed ? styles.rowCollapsed : styles.rowExpanded]}>
                <View style={styles.iconWrapper}>
                    <Icon color={color} size={20} />
                </View>
                {!collapsed && (
                    <Text numberOfLines={1} style={[styles.label, active ? styles.labelActive : styles.labelInactive, { color }]}>
                        {item.label}
                    </Text>
                )}
            </View>
        </Pressable>
    </View>
}

export default SidebarButton
