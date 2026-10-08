import { StyleSheet } from "react-native"
import { colors, alpha } from "./colors"

export const styles = StyleSheet.create({
    /** Drawer */
    drawerTopContainer: {
        flexDirection: "row",
        marginHorizontal: 10,
        marginVertical: 10,
        alignItems: "center"
    },
    drawerAvatarName: {
        marginLeft: 5,
        color: colors.secondary,
    },
    drawerAvatarEmail: {
        marginLeft: 5,
        color: colors.secondary,
    },
    drawerCloseButtonShell: {
        height: 32,
        width: 32,
        alignItems: "center",
        justifyContent: "center",
        marginLeft: "auto",
        margin: 5,
        borderColor: colors.ternary,
        backgroundColor: colors.ternary,
        borderWidth: 1,
        borderRadius: 10,
    },
    divider: {
        backgroundColor: colors.clear,
        height: 2,
        marginHorizontal: 10,
    },
    drawerCloseButtonShellHovered: {
        height: 32,
        width: 32,
        alignItems: "center",
        justifyContent: "center",
        marginLeft: "auto",
        margin: 5,
        borderColor: colors.clear,
        backgroundColor: colors.clear,
        borderWidth: 1,
        borderRadius: 10,
    },
    drawerCloseButton: {
        fontSize: 20,
        color: colors.secondary,
    },
    drawerCloseButtonHovered: {
        fontSize: 20,
        color: colors.primary,
    },
    drawerButtonShell: {
        flexDirection: "row",
        justifyContent: "left",
        alignItems: "center",
        padding: 10,
        margin: 1,
        backgroundColor: colors.ternary,
    },
    drawerButtonShellHovered: {
        flexDirection: "row",
        justifyContent: "left",
        alignItems: "center",
        padding: 10,
        margin: 1,
        backgroundColor: colors.clear,
    },
    drawerButtonIcon: {
        flexDirection: "row",
        justifyContent: "left",
        color: colors.secondary,
        fontSize: 20,
        marginRight: 10
    },
    drawerButtonIconHovered: {
        flexDirection: "row",
        justifyContent: "left",
        color: colors.primary,
        fontSize: 20,
        marginRight: 10
    },
    drawerButtonText: {
        color: colors.secondary,
    },
    drawerButtonTextHovered: {
        color: colors.primary,
    },
    drawerButtonBadge: {
        width: 22,
        height: 22,
        borderRadius: 11,
        alignItems: "center",
        justifyContent: "center",
        marginLeft: "auto"
    },
    drawerButtonBadgeText: {
        color: colors.ternary,
    },
    drawerVersionContainer: {
        flexDirection: "row",
        justifyContent: "left",
        marginTop: "auto",
        marginHorizontal: "auto",
        marginBottom: 20,
    },
    drawerLogoImage: {
        width: 20,
        height: 20,
        marginTop: 3
    },
    drawerLogoTextSyncro: {
        color: colors.secondary,
        fontSize: 20,
    },
    drawerLogoTextBio: {
        color: colors.secondaryRed,
        fontSize: 20,
    },
    drawerRegisteredTrademark: {
        color: colors.secondary,
    },
    drawerVersionNumber: {
        color: colors.secondary,
        marginTop: 4,
        fontStyle: "italic"
    },
    /** Reports */
    reportList: {
        marginTop: 30,
        maxWidth: 1200,
        width: "80%",
    },
    /** Collapsible */
    collapsible: {
        marginBottom: 10,
        borderRadius: 10,
        overflow: "hidden",
    },
    collapsibleHeader: {
        height: "auto",
        paddingVertical: 15,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: colors.clear,
    },
    collapsibleHeaderLeft: {
        flexDirection: "row",
        alignItems: "center",
        marginLeft: 20,
    },
    collapsibleHeaderMiddle: {
        flexDirection: "column",
        marginLeft: 20,
    },
    collapsibleLabName: {
        color: colors.primary,
    },
    collapsibleLabAddress: {
        paddingVertical: 4,
        color: colors.secondary,
    },
    collapsibleLabContact: {
        color: colors.secondary,
    },
    collapsibleTimestamp: {
        color: colors.secondary,
        marginRight: 20,
    },
    containerReport: {
        alignItems: "center",
    },
    reportName: {
        color: colors.primary,
        marginTop: 20,
    },
    containerResult: {
        marginVertical: 10,
        alignItems: "center",
        padding: 10,
    },
    resultName: {
        color: colors.secondary,
        marginVertical: 10,
    },
    resultGradient: {
        width: "100%",
        height: 10,
        marginBottom: 10,
    },
    gradientUnits: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        color: colors.secondary,
    },
    gradientUnitValue: {
        color: colors.secondary,
    },
    gradientUnitCurrent: {
        color: colors.secondary,
        flexDirection: "row",
        alignSelf: "flex-start",
        marginBottom: -5
    },
    /** Contacts Page */
    containerContacts: {
        marginTop: 30,
        maxWidth: 1200,
        width: "80%",
        backgroundColor: colors.secondary,
        height: "100%",
    },
})