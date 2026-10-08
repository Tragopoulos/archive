import Svg, { Path } from "react-native-svg"

const MailIcon = ({ size = 20, color = "currentColor" }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* Outer envelope body */}
        <Path
            d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z"
            stroke={color}
            strokeWidth="2"
        />
        {/* Inner details (flap lines) */}
        <Path
            d="M20 6l-8 5-8-5"
            stroke={color}
            strokeWidth="2"
        />
    </Svg>
)

export default MailIcon