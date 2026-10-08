/** React */
import { createContext, useState, useEffect } from "react"
import { Platform, useColorScheme } from "react-native"

const ThemeContext = createContext()

const systemFont = Platform.select({
  ios: "System",
  android: "Roboto",
  default: "sans-serif",
})

export const light = {
  name: "light",
  /** Font Family */
  fonts: {
    systemFont: systemFont,
  },

  /** Standard Colors */
  statusBar: "dark",
  black: "#000000", // standard
  white: "#ffffff", // standard
  logoPrimary: "#2DB3A3", // standard
  logoSecondary: "#B3A89F", // standard
  textLight: "#F7F7F7", // standard 
  textLink: "#4EA1F3", // standard 

  /** Theming Colors */
  clear: "#F7F7F7", // almost white
  invert: "#1A1A1A", // almost black

  primary: "#252A31", // dark gray
  secondary: "#5F6B7C", // medium gray
  ternary: "#F2F2F2", // light gray
  smoke: "#C8C8C8", // very light gray

  primaryBlue: "#0F6894", // dark blue
  secondaryBlue: "#147EB3", // medium blue
  ternaryBlue: "#3FA6DA", // light blue

  primaryRed: "#AC2F33", // dark red
  secondaryRed: "#CD4246", // medium red
  ternaryRed: "#E76A6E", // light red
}

export const dark = {
  name: "dark",
  /** Font Family */
  fonts: {
    systemFont: systemFont,
  },

  /** Standard Colors */
  statusBar: "light",
  black: "#000000", // standard
  white: "#ffffff", // standard
  logoPrimary: "#2DB3A3", // standard
  logoSecondary: "#B3A89F", // standard
  textLight: "#F7F7F7",
  textLink: "#4EA1F3", // standard 

  /** Theming Colors */
  clear: "#1A1A1A", // almost black
  invert: "#F7F7F7", // almost white

  primary: "#919191", // light gray
  secondary: "#5F6B7C", // medium gray
  ternary: "#252A31", // dark gray
  smoke: "#373737", // very dark gray

  primaryBlue: "#3FA6DA", // light blue
  secondaryBlue: "#147EB3", // medium blue
  ternaryBlue: "#0F6894", // dark blue

  primaryRed: "#E76A6E", // light red
  secondaryRed: "#CD4246", // medium red
  ternaryRed: "#AC2F33", // dark red
}

export const alpha = {
  10: "1A",
  20: "33",
  30: "4D",
  40: "66",
  50: "80",
  60: "99",
  70: "B3",
  80: "CC",
  90: "E6",
}

export const ThemeProvider = ({ children, initialTheme = null }) => {
  const systemColorScheme = useColorScheme()
  const defaultTheme = initialTheme || (systemColorScheme === "dark" || systemColorScheme === "light" ? systemColorScheme : "light")
  const [option, setOption] = useState(defaultTheme)

  /** Automatically sync with system theme changes */
  useEffect(() => {
    if (systemColorScheme === "dark" || systemColorScheme === "light") {
      setOption(systemColorScheme)
    }
  }, [systemColorScheme])

  const setTheme = (newTheme) => setOption(newTheme)

  let theme

  switch (option) {
    case "light":
      theme = light
      break
    case "dark":
      theme = dark
      break
    default:
      theme = light
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export default ThemeContext