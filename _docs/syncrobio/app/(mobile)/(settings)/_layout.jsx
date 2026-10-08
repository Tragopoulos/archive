/** Expo & React */
import { Stack } from "expo-router"

const Layout = () => {
  return <Stack>
    <Stack.Screen name="settings" options={{ headerShown: false }} />
    <Stack.Screen name="info" options={{ headerShown: false }} />
    <Stack.Screen name="theme" options={{ headerShown: false }} />
    <Stack.Screen name="locale" options={{ headerShown: false }} />
  </Stack>
}

export default Layout

