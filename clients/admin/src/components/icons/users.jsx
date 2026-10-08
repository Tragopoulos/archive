import Svg, { Path } from "react-native-svg"

const Users = ({ size = 20, color = "currentColor" }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0z M4 21a8 8 0 0 1 16 0" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
)

export default Users
