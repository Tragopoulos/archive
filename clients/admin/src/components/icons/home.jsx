import Svg, { Path } from "react-native-svg"

const Home = ({ size = 20, color = "currentColor" }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M3 11l9-8 9 8v10a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2V11z" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    </Svg>
)

export default Home
