import { useEffect, useState, useRef } from "react"
import { StyleSheet, Animated, Pressable, View } from "react-native"
/** Configs */
import { light, dark, alpha } from "../../themes/colors"
import storage from "../../configs/storage"
/** Components */
import NavBar from "./navbar"
import Drawer from "./drawer"
import Overview from "./page_overview"
import Reports from "./page_reports"
import Permissions from "./page_permissions"
import Contacts from "./page_contacts"
import Notifications from "./page_notifications"
import Profile from "./page_profile"
import Settings from "./page_settings"

const DesktopDashboard = () => {
  const [tab, setTab] = useState(0)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const animatedValue = useRef(new Animated.Value(400)).current
  useFonts({ UbuntuLight, UbuntuRegular, UbuntuMedium, UbuntuBold })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:3001/settings")
        const data = await response.json()
        storage.set("settings", data)
        const tab = await storage.get("tab")
        setTab(Number(tab) || 0)
      } catch (error) {
        //TODO: Error Handling
        console.error(error.code, error.message)
      }
    }
    fetchData()
  }, [])

  const openDrawer = () => {
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start()
    setDrawerOpen(true)
  }

  const closeDrawer = () => {
    Animated.timing(animatedValue, {
      toValue: 400,
      duration: 250,
      useNativeDriver: true,
    }).start()
    setDrawerOpen(false)
  }

  const changeTab = tab => {
    storage.set("tab", tab)
    setTab(tab)
    closeDrawer()
  }

  return (
    <View style={[styles.dashboardContainer,]} >
      <NavBar openDrawer={openDrawer} changeTab={tab => changeTab(tab)} />
      <Animated.View style={[styles.drawerContainer, { transform: [{ translateX: animatedValue }] }]}>
        <Drawer closeDrawer={closeDrawer} changeTab={tab => changeTab(tab)} />
      </Animated.View>
      {drawerOpen ? <Pressable onPress={closeDrawer} style={styles.drawerOverlay} /> : null}
      <View style={styles.tabView}>
        {tab === 0 ? <Overview /> : null}
        {tab === 1 ? <Reports /> : null}
        {tab === 2 ? <Permissions /> : null}
        {tab === 3 ? <Contacts /> : null}
        {tab === 4 ? <Notifications /> : null}
        {tab === 5 ? <Profile /> : null}
        {tab === 6 ? <Settings /> : null}
      </View>
    </View>
  )
}

export default DesktopDashboard

const styles = StyleSheet.create({
  dashboardContainer: {
    flex: 1,
    overflow: "hidden",
    height: "100%",
    backgroundColor: light.ternary,
  },
  drawerContainer: {
    width: 320,
    height: "100vh",
    backgroundColor: light.ternary,
    position: "absolute",
    right: 0,
    top: 0,
    shadowColor: light.black,
    shadowOffset: { width: -10, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 15,
    zIndex: 200
  },
  drawerOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: light.black + alpha[60],
    zIndex: 100
  },
  tabView: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
})