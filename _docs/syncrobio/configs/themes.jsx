import React, { createContext, useState } from "react"

const ThemeContext = createContext()

export const light = {
  statusBar: "dark",

  clear: "#F6F7F9",
  invert: "#1C2127",

  black: "#000000",
  white: "#FFFFFF",

  primary: "#1C2127",
  secondary: "#5F6B7C",
  ternary: "#F2F2F2",

  primaryBlue: "#0F6894",
  secondaryBlue: "#147EB3",
  ternaryBlue: "#3FA6DA",

  primaryRed: "#AC2F33",
  secondaryRed: "#CD4246",
  ternaryRed: "#E76A6E",

  logoDark: "#242C40",
}

export const dark = {
  statusBar: "light",

  clear: "#1C2127",
  invert: "#F6F7F9",

  black: "#000000",
  white: "#FFFFFF",

  primary: "#919191",
  secondary: "#5F6B7C",
  ternary: "#252A31",

  primaryBlue: "#0F6894",
  secondaryBlue: "#147EB3",
  ternaryBlue: "#3FA6DA",

  primaryRed: "#E76A6E",
  secondaryRed: "#CD4246",
  ternaryRed: "#AC2F33",

  logoDark: "#242C40",
  a: "#CD4246",
}

export const monochrome = {
  statusBar: "light",

  clear: "#1C2127",
  invert: "#F6F7F9",

  primary: "#919191",
  secondary: "#5F6B7C",
  ternary: "#252A31",

  primaryBlue: "#5F6B7C",
  secondaryBlue: "#147EB3",
  ternaryBlue: "#3FA6DA",

  primaryRed: "#E76A6E",
  secondaryRed: "#CD4246",
  ternaryRed: "#AC2F33",

  logoDark: "#242C40",
  a: "#CD4246",
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
      break;
    case "dark":
      theme = dark
      break;
    case "monochrome":
      theme = monochrome
      break;
    default:
      theme = light
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext