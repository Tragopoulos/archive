import { useState, useContext } from "react"
import { StyleSheet, View, Text } from "react-native"
import Svg, { Defs, LinearGradient, Stop, G, Circle, Path, Rect } from "react-native-svg"
import ThemeContext from "../../configs/themes"

const VIEW_W = 400
const VIEW_H = 96

const Logo = ({ width = "100%", height = "100%", style }) => {
    const { theme } = useContext(ThemeContext)
    const [w, setW] = useState(0)
    const scale = w / VIEW_W
    const fontSize = 60 * scale

    return (
        <View
            style={[{ width, height }, style]}
            onLayout={(e) => setW(e.nativeEvent.layout.width)}
        >
            <Svg width="100%" height="100%" viewBox={`70 12 ${VIEW_W} ${VIEW_H}`}>
                <Defs>
                    <LinearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <Stop offset="0%" stopColor="#FFA94D" stopOpacity={0} />
                        <Stop offset="60%" stopColor="#FFA94D" stopOpacity={0.25} />
                        <Stop offset="100%" stopColor="#FFA94D" stopOpacity={0.4} />
                    </LinearGradient>
                </Defs>

                <G transform="translate(120, 60)" fill="none" stroke="#FFA94D" strokeLinecap="round">
                    <Circle cx={0} cy={0} r={34} strokeOpacity={0.30} strokeWidth={1} />
                    <Circle cx={0} cy={0} r={42} strokeOpacity={0.18} strokeWidth={1} />
                    <Path d="M -34 0 A 34 34 0 0 1 22 -26" strokeWidth={2.5} />
                    <Circle cx={22} cy={-26} r={4} fill="#FFD68A" stroke="none" />
                </G>

                <Rect x={120} y={62} width={320} height={3} rx={1.5} fill="url(#accentGradient)" />

                <Circle cx={452} cy={30} r={4.5} fill="#FFD68A" />
            </Svg>

            {w > 0 && (
                <View style={[StyleSheet.absoluteFill, { justifyContent: "center", alignItems: "center" }]}>
                    <Text style={{
                        color: "#FFA94D",
                        fontFamily: theme.font,
                        fontSize,
                        fontWeight: "900",
                        letterSpacing: -scale,
                    }}>operations</Text>
                </View>
            )}
        </View>
    )
}

export default Logo
