/** React & Expo */
import { createContext, useState } from "react"
/** Configs */
import { en_us } from "../locales/en_US"
import { el_gr } from "../locales/el_GR"

const LocaleContext = createContext()

export const LocaleProvider = ({ children }) => {
  const [option, setOption] = useState("english")

  const setLocale = (newLocale) => setOption(newLocale)

  let locale

  switch (option) {
    case "english":
      locale = en_us
      break
    case "greek":
      locale = el_gr
      break
    default:
      locale = en_us
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  )
}

export default LocaleContext
