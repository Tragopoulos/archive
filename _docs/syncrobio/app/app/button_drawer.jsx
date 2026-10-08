import { styles } from "../../themes/themes"
import { useState } from "react"
import { View, Text, Pressable } from "react-native"
import { MaterialCommunityIcons, FontAwesome5, Ionicons, Fontisto, AntDesign } from "@expo/vector-icons"
import { colors } from "../../themes/colors"

const ButtonDrawer = ({ icon, iconFamily, text, badgeInfo, badgeNumber, onButtonClick }) => {
  const [isHovered, setIsHovered] = useState(false)
  const handleHoverIn = () => setIsHovered(true)
  const handleHoverOut = () => setIsHovered(false)

  return <Pressable style={isHovered ? styles.drawerButtonShellHovered : styles.drawerButtonShell} onPress={() => onButtonClick()} onHoverIn={handleHoverIn} onHoverOut={handleHoverOut}>
    {iconFamily === "FontAwesome5" ? <FontAwesome5 name={icon} style={isHovered ? styles.drawerButtonIconHovered : styles.drawerButtonIcon} /> : null}
    {iconFamily === "Ionicons" ? <Ionicons name={icon} style={isHovered ? styles.drawerButtonIconHovered : styles.drawerButtonIcon} /> : null}
    {iconFamily === "Fontisto" ? <Fontisto name={icon} style={isHovered ? styles.drawerButtonIconHovered : styles.drawerButtonIcon} /> : null}
    {iconFamily === "MaterialCommunityIcons" ? <MaterialCommunityIcons name={icon} style={isHovered ? styles.drawerButtonIconHovered : styles.drawerButtonIcon} /> : null}
    {iconFamily === "AntDesign" ? <AntDesign name={icon} style={isHovered ? styles.drawerButtonIconHovered : styles.drawerButtonIcon} /> : null}
    <Text style={isHovered ? styles.drawerButtonTextHovered : styles.drawerButtonText}>{text}</Text>
    {badgeNumber > 0 ? <View style={[styles.drawerButtonBadge, { backgroundColor: badgeInfo ? colors.secondaryBlue : colors.secondaryRed }]}>
      <Text style={styles.drawerButtonBadgeText}>{badgeNumber}</Text>
    </View> : null}
  </Pressable>
}

export default ButtonDrawer