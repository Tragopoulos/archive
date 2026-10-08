import Svg, { Circle, Path } from "react-native-svg"

const AtSign = ({ size = 24, color = "currentColor" }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
        <Circle cx={12} cy={12} r={4} />
        <Path d="M16 8 v5 a3 3 0 0 0 6 0 v-1 a10 10 0 1 0 -3.92 7.94" />
    </Svg>
)

export default AtSign
