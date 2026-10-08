import { useEffect, useRef, useContext } from "react"
import { Modal, View, Text, Animated, StyleSheet, Platform } from "react-native"
import ThemeContext, { alpha } from "../../configs/themes"
import ButtonSmall from "./button_small"

const FadeModal = ({ visible, title, subtitle, buttons = [] }) => {
    const { theme } = useContext(ThemeContext)

    const fadeAnim = useRef(new Animated.Value(0)).current

    useEffect(() => {
        if (visible) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: Platform.OS !== "web",
            }).start()

            if (buttons.length === 0) {
                const timer = setTimeout(() => handleClose(), 2000)
                return () => clearTimeout(timer)
            }
        } else {
            fadeAnim.setValue(0)
        }
    }, [visible])

    const handleClose = (action) => {
        /** Call action immediately to update parent state */
        action?.()

        /** Then animate out */
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: Platform.OS !== "web",
        }).start()
    }

    const styles = StyleSheet.create({
        backdrop: {
            flex: 1,
            backgroundColor: theme.black + alpha[50],
            justifyContent: "center",
            alignItems: "center",
        },
        card: {
            height: 300,
            width: 360,
            margin: 20,
            backgroundColor: theme.clear,
            borderRadius: 16,
            padding: 20,
            shadowColor: theme.black + alpha[80],
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 6,
            elevation: 5,

            flexDirection: "column",
            justifyContent: "space-between", // push title/subtitle up, buttons down
        },
        topSection: {
            alignItems: "center",
        },
        middleSection: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
        },
        title: {
            fontSize: 20,
            color: theme.invert,
            fontWeight: "600",
            marginBottom: 10,
            textAlign: "center",
        },
        subtitle: {
            color: theme.invert,
            textAlign: "center",
        },
        buttonRow: {
            flexDirection: "row",
            justifyContent: "space-evenly",
        },
    })

    if (!visible) return null

    return (
        <Modal transparent animationType="none" visible={visible}>
            <View style={styles.backdrop}>
                <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
                    <View style={styles.topSection}>
                        {title && <Text style={styles.title}>{title}</Text>}
                    </View>
                    <View style={styles.middleSection}>
                        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                    </View>
                    {buttons.length > 0 && <View style={styles.buttonRow}>
                        {buttons?.map((button, index) =>
                            <ButtonSmall key={index} variant={button.variant} label={button.label} onPress={() => handleClose(button.onPress)} />
                        )}
                    </View>
                    }
                </Animated.View>
            </View>
        </Modal>
    )
}

export default FadeModal
