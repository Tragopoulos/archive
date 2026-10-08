import { styles } from "../../themes/themes"
import { useState } from "react"
import { auth } from "../../configs/firebase"
import { View, Text, Pressable, Image } from "react-native"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import logo from "../../assets/icon.svg"
import ButtonDrawer from "./button_drawer"

const Drawer = ({ closeDrawer, changeTab }) => {
  const [isHovered, setIsHovered] = useState(false)
  const handleHoverIn = () => setIsHovered(true)
  const handleHoverOut = () => setIsHovered(false)

  const signOut = async () => {
    try {
      await auth.signOut()
    } catch (error) {
      //TODO: console.log("Error signing out: ", error)
    }
  }

  return <View style={styles.drawerContainer}>
    <View style={styles.drawerTopContainer}>
      <Image source={"https://avatars.githubusercontent.com/u/18228579?v=4"} style={styles.avatar} resizeMode="contain" />
      <View>
        <Text style={styles.drawerAvatarName}>Fotios Tragopoulos</Text>
        <Text style={styles.drawerAvatarEmail}>tragopoulos@icloud.com</Text>
      </View>
      <Pressable style={isHovered ? styles.drawerCloseButtonShellHovered : styles.drawerCloseButtonShell} onPress={closeDrawer} onHoverIn={handleHoverIn} onHoverOut={handleHoverOut}>
        <MaterialCommunityIcons name="close" style={isHovered ? styles.drawerCloseButtonHovered : styles.drawerCloseButton} />
      </Pressable>
    </View>
    <View style={styles.divider} />
    <ButtonDrawer iconFamily={"FontAwesome5"} icon={"heartbeat"} text={"Dashboard"} badgeInfo badgeNumber={99} onButtonClick={() => changeTab(0)} />
    <ButtonDrawer iconFamily={"FontAwesome5"} icon={"file-medical-alt"} text={"Reports"} badgeNumber={0} onButtonClick={() => changeTab(1)} />
    <ButtonDrawer iconFamily={"Ionicons"} icon={"shield-checkmark"} text={"Permissions"} badgeInfo badgeNumber={24} onButtonClick={() => changeTab(2)} />
    <ButtonDrawer iconFamily={"Fontisto"} icon={"doctor"} text={"Contacts"} badgeInfo badgeNumber={2} onButtonClick={() => changeTab(3)} />
    <ButtonDrawer iconFamily={"Ionicons"} icon={"notifications"} text={"Notifications"} badgeNumber={0} onButtonClick={() => changeTab(4)} />
    <ButtonDrawer iconFamily={"MaterialCommunityIcons"} icon={"account-settings"} text={"Profile"} badgeNumber={13} onButtonClick={() => changeTab(5)} />
    <ButtonDrawer iconFamily={"Ionicons"} icon={"settings-sharp"} text={"Settings"} badgeNumber={0} onButtonClick={() => changeTab(6)} />
    <View style={styles.divider} />
    <ButtonDrawer iconFamily={"Ionicons"} icon={"book-sharp"} text={"SyncroBio Docs"} onButtonClick={() => console.log("SyncroBio Documentation")} />
    <ButtonDrawer iconFamily={"AntDesign"} icon={"infocirlce"} text={"About SyncroBio"} onButtonClick={() => console.log("About SyncroBio")} />
    <View style={styles.divider} />
    <ButtonDrawer text={"Sign out"} onButtonClick={signOut} />
    <View style={styles.drawerVersionContainer}>
      <Image source={logo} style={styles.drawerLogoImage} resizeMode="contain" />
      <Text style={styles.drawerLogoTextSyncro}>Syncro</Text><Text style={styles.drawerLogoTextBio}>Bio</Text>
      <MaterialCommunityIcons name="registered-trademark" style={styles.drawerRegisteredTrademark} />
      <Text style={styles.drawerVersionNumber}>version 1.1.1</Text>
    </View>
  </View >
}

export default Drawer