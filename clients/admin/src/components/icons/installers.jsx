import React from "react"
import Svg, { Path } from "react-native-svg"

const Installers = ({ size = 20, color = "currentColor" }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M12 4v12 M8 12l4 4 4-4 M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
)

export default Installers