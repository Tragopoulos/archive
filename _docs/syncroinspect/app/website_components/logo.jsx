import { useContext } from "react"
import Svg, { Path, Circle, G } from "react-native-svg"
import ThemeContext from "../../configs/themes"

const Logo = ({ style }) => {
    const { theme } = useContext(ThemeContext)


    return (
        <Svg viewBox="0 0 1024 1024" style={style}>
            <G transform="matrix(8.982 0 0 8.9649 -475.9 -662.4)" fill="none" strokeWidth={16}>
                <Path d="M100 147l22 15" stroke={theme.logoPrimary} />
                <Path d="M121 110l-25 15" stroke={theme.logoPrimary} />
                <Circle transform="scale(-1)" cx="-83.99" cy="-132.29" r="20" stroke={theme.logoPrimary} strokeLinecap="round" />
                <Circle cx="140" cy="98" r="16" stroke={theme.logoSecondary} strokeLinecap="round" />
                <Circle cx="130" cy="168" r="12" stroke={theme.logoPrimary} strokeLinecap="round" />
            </G>
        </Svg>
    )
}

export default Logo