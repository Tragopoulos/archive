/** Expo & React */
import { Stack } from "expo-router"
import { ThemeProvider } from "../configs/themes"

const Layout = () => {
  return <ThemeProvider>
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="(mobile)" options={{ headerShown: false }} />
      <Stack.Screen name="verified" options={{ headerShown: false }} />
    </Stack>
  </ThemeProvider>
}

export default Layout

