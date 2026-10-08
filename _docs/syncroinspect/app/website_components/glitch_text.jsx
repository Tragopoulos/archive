import { useEffect, useRef, useContext } from "react"
import { View, Text, Animated, StyleSheet, Platform } from "react-native"
import ThemeContext from "../../configs/themes"

const GlitchText = ({ children, style }) => {
    const { theme } = useContext(ThemeContext)
    const mainAnim = useRef(new Animated.Value(0)).current
    const topAnim = useRef(new Animated.Value(0)).current
    const bottomAnim = useRef(new Animated.Value(0)).current

    useEffect(() => {
        const createGlitchAnimation = () => {
            const mainAnimation = Animated.timing(mainAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: Platform.OS !== "web",
            })

            const topAnimation = Animated.timing(topAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: Platform.OS !== "web",
            })

            const bottomAnimation = Animated.timing(bottomAnim, {
                toValue: 1,
                duration: 1500,
                useNativeDriver: Platform.OS !== "web",
            })

            return Animated.loop(
                Animated.parallel([mainAnimation, topAnimation, bottomAnimation])
            )
        }

        const animation = createGlitchAnimation()
        animation.start()

        return () => animation.stop()
    }, [mainAnim, topAnim, bottomAnim])

    const mainTransform = [
        {
            translateX: mainAnim.interpolate({
                inputRange: [0, 0.02, 0.04, 0.6, 0.62, 0.64, 1],
                outputRange: [0, 2, -2, -2, 0, 2, 0],
            }),
        },
        {
            skewX: mainAnim.interpolate({
                inputRange: [0, 0.02, 0.04, 0.6, 0.62, 0.64, 1],
                outputRange: ["0deg", "0deg", "0deg", "0deg", "5deg", "0deg", "0deg"],
            }),
        },
    ]

    const topTransform = [
        {
            translateX: topAnim.interpolate({
                inputRange: [0, 0.02, 0.04, 0.6, 0.62, 0.64, 1],
                outputRange: [0, 2, -2, -2, 13, 2, 0],
            }),
        },
        {
            translateY: topAnim.interpolate({
                inputRange: [0, 0.02, 0.04, 0.6, 0.62, 0.64, 1],
                outputRange: [0, -2, 2, 2, -1, -2, 0],
            }),
        },
        {
            skewX: topAnim.interpolate({
                inputRange: [0, 0.02, 0.04, 0.6, 0.62, 0.64, 1],
                outputRange: ["0deg", "0deg", "0deg", "0deg", "-13deg", "0deg", "0deg"],
            }),
        },
    ]

    const bottomTransform = [
        {
            translateX: bottomAnim.interpolate({
                inputRange: [0, 0.02, 0.04, 0.6, 0.62, 0.64, 1],
                outputRange: [0, -2, -2, -2, -22, -2, 0],
            }),
        },
        {
            translateY: bottomAnim.interpolate({
                inputRange: [0, 0.02, 0.04, 0.6, 0.62, 0.64, 1],
                outputRange: [0, 0, 0, 0, 5, 0, 0],
            }),
        },
        {
            skewX: bottomAnim.interpolate({
                inputRange: [0, 0.02, 0.04, 0.6, 0.62, 0.64, 1],
                outputRange: ["0deg", "0deg", "0deg", "0deg", "21deg", "0deg", "0deg"],
            }),
        },
    ]

    const glitchStyles = StyleSheet.create({
        container: {
            position: "relative"
        },
        mainText: {
            ...style
        },
        glitchLayer: {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
        },
        topGlitch: {
            ...style,
            color: theme.invert,
            opacity: 0.8
        },
        bottomGlitch: {
            ...style,
            color: theme.primary,
            opacity: 0.8
        },
    })

    return (
        <View style={glitchStyles.container}>
            <Animated.View style={{ transform: mainTransform }}>
                <Text style={glitchStyles.mainText}>{children}</Text>
            </Animated.View>

            <Animated.View style={[glitchStyles.glitchLayer, { transform: topTransform }]}>
                <Text style={glitchStyles.topGlitch}>{children}</Text>
            </Animated.View>

            <Animated.View style={[glitchStyles.glitchLayer, { transform: bottomTransform }]}>
                <Text style={glitchStyles.bottomGlitch}>{children}</Text>
            </Animated.View>
        </View>
    )
}

export default GlitchText
