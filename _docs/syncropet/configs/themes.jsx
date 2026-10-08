import React, { createContext, useState } from "react"

const ThemeContext = createContext()

export const light = {
  /** Standard Colors */
  statusBar: "dark",
  black: "#000000", // standard
  white: "#ffffff", // standard
  logoBlue: "#3FA6DA", // standard
  logoBrown: "#A8967E", // standard

  /** Theming Colors */
  clear: "#F6F7F9", // almost white
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
  /** Standard Colors */
  statusBar: "light",
  black: "#000000", // standard
  white: "#ffffff", // standard
  logoBlue: "#3FA6DA", // standard
  logoBrown: "#A8967E", // standard

  /** Theming Colors */
  clear: "#1A1A1A", // almost black
  invert: "#F6F7F9", // almost white

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

export const monochrome_dark = {
  /** Standard Colors */
  statusBar: "light",
  black: "#000000", // standard
  white: "#ffffff", // standard
  logoBlue: "#F6F7F9", // standard
  logoBrown: "#F6F7F9", // standard

  /** Theming Colors */
  clear: "#1A1A1A", // almost black
  invert: "#F6F7F9", // almost white

  primary: "#919191", // light gray
  secondary: "#5F6B7C", // medium gray
  ternary: "#252A31", // dark gray
  smoke: "#373737", // very dark gray

  primaryBlue: "#3FA6DA", // light blue
  secondaryBlue: "#252A31", // medium blue
  ternaryBlue: "#0F6894", // dark blue

  primaryRed: "#E76A6E", // light red
  secondaryRed: "#252A31", // medium red
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

export const ThemeProvider = ({ children }) => {
  const [option, setOption] = useState("light")

  const setTheme = (newTheme) => setOption(newTheme)

  let theme

  switch (option) {
    case "light":
      theme = light
      break
    case "dark":
      theme = dark
      break
    case "monochrome_dark":
      theme = monochrome_dark
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