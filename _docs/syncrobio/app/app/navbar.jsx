import { light, dark, alpha } from "../../themes/colors"
import { StyleSheet, useColorScheme, View, Text, Image, Pressable } from "react-native"
import logo from "../../assets/icon.svg"

const NavBar = ({ openDrawer, changeTab }) => {
  return <View style={styles.navbarShell}>
    <Pressable style={styles.navbarLogoContainer} onPress={() => changeTab(0)}>
      <Image source={logo} style={styles.navbarLogoImage} resizeMode="contain" />
      <Text style={styles.navbarLogoTextSyncro}>Syncro</Text><Text style={styles.navbarLogoTextBio}>Bio</Text>
    </Pressable>
    <View style={styles.navbarRightContainer}>
      <Pressable onPress={() => changeTab(4)}>
        <Text style={styles.navbarLink}>23:35</Text>
      </Pressable>
      <Pressable onPress={openDrawer} >
        <Image source={"https://avatars.githubusercontent.com/u/18228579?v=4"} style={styles.avatar} resizeMode="contain" />
      </Pressable>
    </View>
  </View>
}

export default NavBar

const styles = StyleSheet.create({
  navbarShell: {
    flexDirection: "row",
    width: "100%",
    height: 50,
    paddingHorizontal: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  navbarLogoContainer: {
    flexDirection: "row",
    justifyContent: "left",
    marginHorizontal: 5
  },
  navbarLogoImage: {
    width: 32,
    height: 32,
    marginVertical: 4,
  },
  navbarLogoTextSyncro: {
    color: light.secondary,
    fontSize: 32,
  },
  navbarLogoTextBio: {
    color: light.secondaryRed,
    fontSize: 32,
  },
  navbarLink: {
    color: light.secondary,
    fontSize: 20,
    marginHorizontal: 10
  },
  navbarRightContainer: {
    flexDirection: "row",
    justifyContent: "right",
    alignItems: "center",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 20,
    borderColor: light.secondary,
    borderWidth: 2
  },
})