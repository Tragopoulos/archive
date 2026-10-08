/** Expo & React */
import { useEffect, useState, useContext } from "react"
/** Configs */
import ThemeContext from "../../../configs/themes"
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs"
import { withLayoutContext } from "expo-router"

const { Navigator } = createMaterialTopTabNavigator()
export const MaterialTopTabs = withLayoutContext(Navigator)

const Layout = () => {
  const { theme } = useContext(ThemeContext)

  return <MaterialTopTabs screenOptions={{
    tabBarIndicatorStyle: { backgroundColor: theme.primaryBlue },
    tabBarLabelStyle: { textTransform: "capitalize" },
  }} >
    <MaterialTopTabs.Screen name="pending" options={{ title: "Pending" }} />
    <MaterialTopTabs.Screen name="history" options={{ title: "History" }} />
  </MaterialTopTabs>
}

export default Layout