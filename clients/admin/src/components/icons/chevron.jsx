import Svg, { Path } from "react-native-svg"

const Chevron = ({ size = 16, color = "currentColor", dir = "left" }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ transform: [{ rotate: dir === "left" ? "0deg" : "180deg" }] }}>
        <Path d="M15 18l-6-6 6-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
)

export default Chevron
