import Svg, { Path, Rect } from "react-native-svg"

const Applications = ({ size = 20, color = "currentColor" }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect x="3" y="4" width="18" height="6" rx="1.5" stroke={color} strokeWidth="2" />
        <Rect x="3" y="14" width="18" height="6" rx="1.5" stroke={color} strokeWidth="2" />
        <Path d="M7 7h.01 M7 17h.01" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
)

export default Applications
