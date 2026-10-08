/** Expo & React */
import { useEffect, useState, useContext } from "react"
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs"
import { withLayoutContext } from "expo-router"
/** Configs */
import ThemeContext from "../../../configs/themes"

const { Navigator } = createMaterialTopTabNavigator()
export const MaterialTopTabs = withLayoutContext(Navigator)

const Layout = () => {
  const { theme } = useContext(ThemeContext)

  return <MaterialTopTabs screenOptions={{
    tabBarIndicatorStyle: { backgroundColor: theme.primaryBlue },
    tabBarLabelStyle: { textTransform: "capitalize" },
  }} >
    <MaterialTopTabs.Screen name="viewers" options={{ title: "Viewers" }} />
    <MaterialTopTabs.Screen name="medical_labs" options={{ title: "Medical Labs" }} />
    <MaterialTopTabs.Screen name="health_professionals" options={{ title: "Practitioners" }} />
  </MaterialTopTabs>
}

export default Layout