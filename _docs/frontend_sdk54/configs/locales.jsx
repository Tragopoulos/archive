import { createContext, useState } from "react"
import { el_gr } from "../../frontend_sdk54/locales/el_GR"
import { en_us } from "../../frontend_sdk54/locales/en_US"
/** Calendar */
// import { LocaleConfig } from "react-native-calendars"



// LocaleConfig.locales["en"] = {
//   monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
//   monthNamesShort: ["Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.", "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."],
//   dayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
//   dayNamesShort: ["Sun.", "Mon.", "Tue.", "Wed.", "Thu.", "Fri.", "Sat."],
//   today: "Today"
// }

// LocaleConfig.locales["el"] = {
//   monthNames: ["Ιανουάριος", "Φεβρουάριος", "Μάρτιος", "Απρίλιος", "Μάιος", "Ιούνιος", "Ιούλιος", "Αύγουστος", "Σεπτέμβριος", "Οκτώβριος", "Νοέμβριος", "Δεκέμβριος"],
//   monthNamesShort: ["Ιαν.", "Φεβ.", "Μαρ.", "Απρ.", "Μάι.", "Ιούν.", "Ιούλ.", "Αύγ.", "Σεπ.", "Οκτ.", "Νοέ.", "Δεκ."],
//   dayNames: ["Κυριακή", "Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο"],
//   dayNamesShort: ["Κυρ.", "Δευ.", "Τρί.", "Τετ.", "Πέμ.", "Παρ.", "Σάβ."],
//   today: "Σήμερα"
// }

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
