/** React & Expo */
import { Stack } from "expo-router"
/** Configs */
import { ThemeProvider } from "../configs/themes"
import { LocaleProvider } from "../configs/locales"

const Layout = () => {
  return <ThemeProvider>
    <LocaleProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(mobile)" options={{ headerShown: false }} />
        <Stack.Screen name="verified" options={{ headerShown: false }} />
        <Stack.Screen name="settings_account_information" options={{ headerShown: false, headerTransparent: true }} />
        <Stack.Screen name="settings_account_password" options={{ headerShown: false, headerTransparent: true }} />
        <Stack.Screen name="settings_account_access" options={{ headerShown: false, headerTransparent: true }} />
        <Stack.Screen name="settings_account_download" options={{ headerShown: false, headerTransparent: true }} />
        <Stack.Screen name="settings_account_deactivate" options={{ headerShown: false, headerTransparent: true }} />
        <Stack.Screen name="settings_account_theme" options={{ headerShown: false, headerTransparent: true }} />
        <Stack.Screen name="settings_account_language" options={{ headerShown: false, headerTransparent: true }} />
        <Stack.Screen name="dashboard_profile_add" options={{ headerShown: false, headerTransparent: true }} />
        <Stack.Screen name="dashboard_profile_edit/[id]" options={{ headerShown: false, headerTransparent: true }} />
      </Stack>
    </LocaleProvider>
  </ThemeProvider>
}

export default Layout