import React, { createContext, useState } from "react"
/** Calendar */
import { LocaleConfig } from "react-native-calendars"

export const english = {
  "language": "en",
  "home": "Home",
  "dashboard": "Dashboard",
  "messages": "Chat",
  "events": "Events",
  "settings": "Settings",
  "contact": "Contact",
  "notifications": "Notifications",
  "sign_out": "Sign Out",
  "personal_information": "Personal Information",
  "settings_account_information": "Account Information",
  "settings_account_password": "Change Password",
  "settings_account_access": "Account Access",
  "settings_account_download": "Download an archive of your data",
  "settings_account_deactivate": "Deactivate your account",
  "preferences": "Preferences",
  "settings_account_theme": "Change theme",
  "light": "Light",
  "dark": "Dark",
  "monochrome_dark": "Monochrome Dark",
  "settings_account_language": "Change language",
  "english": "English",
  "greek": "Greek",
  "help": "Help",
  "help_center": "Help Center",
  "report_issue": "Report an Issue",
  "propose_feature": "Propose a Feature",
  "legal": "Legal",
  "terms_of_service": "Terms of Service",
  "privacy_policy": "Privacy Policy",
  "name": "Name",
  "address": "Address",
  "city": "City",
  "zip": "Zip",
  "country": "Country of residence",
  "phone": "Phone number",
  "phone_country_search": "Search for your country",
  "phone_country_not_found": "Sorry, country not found :(",
  "update_error_title": "Update Unsuccessful",
  "update_error_message": "There was a problem updating your account. Please try again later.",
  "update_error_message_profile": "There was a problem updating your profile. Please try again later.",
  "close": "Close",
  "email": "Email",
  "password": "Password",
  "current_password": "Current Password",
  "new_password": "New Password",
  "confirm_password": "Confirm Password",
  "register": "Register",
  "login": "Login",
  "cancel": "Cancel",
  "save": "Save",
  "delete": "Delete",
  "error_password": "Passwords must be more than 6 characters long and must match.",
  "bio": "Bio",
  "dateOfBirth": "Date of Birth",
  "add_profile": "Add Profile",
  "edit_profile": "Edit Profile",
  "delete_profile": "Delete Profile",
  "error_occurred": "An error occurred",
  "missing_fields": "Please fill in all required fields",
  "gender": "Gender",
  "male": "Male",
  "female": "Female",
  "kind": "Kind",
  "other": "Other",
  "cat": "Cat",
  "dog": "Dog",
  "bird": "Bird",
  "fish": "Fish",
  "rabbit": "Rabbit",
  "hamster": "Hamster",
  "turtle": "Turtle",
  "reptilian": "Reptilian",
  "dashboard_placeholder": "This is where your pets will show up once added...",
  "edit": "Edit",
}

export const greek = {
  "language": "el",
  "home": "Αρχική",
  "dashboard": "Πίνακας ελέγχου",
  "messages": "Μηνύματα",
  "events": "Ειδοποιήσεις",
  "settings": "Ρυθμίσεις",
  "contact": "Επικοινωνία",
  "notifications": "Ειδοποιήσεις",
  "sign_out": "Αποσύνδεση",
  "personal_information": "Προσωπικές πληροφορίες",
  "settings_account_information": "Λογαριασμός",
  "settings_account_password": "Άλλαξε κωδικό πρόσβασης",
  "settings_account_access": "Ασφάλεια λογαριασμού",
  "settings_account_download": "Κατέβασμα των δεδομένων σας",
  "settings_account_deactivate": "Απενεργοποίηση λογαριασμού",
  "preferences": "Προτιμήσεις",
  "settings_account_theme": "Αλλαγή θέματος",
  "light": "Φωτεινό",
  "dark": "Σκοτεινό",
  "monochrome_dark": "Μονοχρωματικό Σκούρο",
  "settings_account_language": "Αλλαγή γλώσσας",
  "english": "Αγγλικά",
  "greek": "Ελληνικά",
  "help": "Βοήθεια",
  "help_center": "Κέντρο βοήθειας",
  "report_issue": "Αναφορά προβλήματος",
  "propose_feature": "Προτάσεις",
  "legal": "Νομοθεσία",
  "terms_of_service": "Όροι Χρήσης",
  "privacy_policy": "Πολιτική απορρήτου",
  "name": "Όνομα",
  "address": "Διεύθυνση",
  "city": "Πόλη",
  "zip": "Ταχυδρομικός κώδικας",
  "country": "Χώρα διαμονής",
  "phone": "Αριθμός τηλεφώνου",
  "phone_country_search": "Αναζήτηση χώρας",
  "phone_country_not_found": "Λυπούμαστε, η χώρα δεν βρέθηκε :(",
  "update_error_title": "Αποτυχία ενημέρωσης",
  "update_error_message": "Υπήρξε πρόβλημα κατά την ενημέρωση του προφίλ. Παρακαλώ προσπαθήστε ξανά αργότερα.",
  "close": "Κλείσιμο",
  "email": "Email",
  "password": "Κωδικός πρόσβασης",
  "current_password": "Τρέχων κωδικός πρόσβασης",
  "new_password": "Νέος κωδικός πρόσβασης",
  "confirm_password": "Επιβεβαίωση κωδικού πρόσβασης",
  "register": "Εγγραφή",
  "login": "Είσοδος",
  "cancel": "Ακύρωση",
  "save": "Αποθήκευση",
  "delete": "Διαγραφή",
  "error_password": "Οι κωδικοί πρόσβασης πρέπει να είναι μεγαλύτεροι από 6 χαρακτήρες και να ταιριάζουν.",
  "bio": "Βιογραφικό",
  "dateOfBirth": "Ημερομηνία Γέννησης",
  "add_profile": "Προσθήκη προφίλ",
  "edit_profile": "Επεξεργασία προφίλ",
  "delete_profile": "Διαγραφή προφίλ",
  "error_occurred": "Παρουσιάστηκε σφάλμα",
  "missing_fields": "Παρακαλώ συμπληρώστε όλα τα υποχρεωτικά πεδία",
  "gender": "Φύλο",
  "male": "Aρσενικό",
  "female": "Θηλυκό",
  "kind": "Eίδος",
  "other": "Άλλο",
  "cat": "Γάτα",
  "dog": "Σκύλος",
  "bird": "Πτηνο",
  "fish": "Ψάρι",
  "rabbit": "Κουνέλι",
  "hamster": "Χάμστερ",
  "turtle": "Χελώνα",
  "reptilian": "Ερπετό",
  "dashboard_placeholder": "Εδώ θα εμφανίζονται τα κατοικίδια σας...",
  "edit": "Επεξεργασία",
}

LocaleConfig.locales["en"] = {
  monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  monthNamesShort: ["Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.", "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."],
  dayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  dayNamesShort: ["Sun.", "Mon.", "Tue.", "Wed.", "Thu.", "Fri.", "Sat."],
  today: "Today"
}

LocaleConfig.locales["el"] = {
  monthNames: ["Ιανουάριος", "Φεβρουάριος", "Μάρτιος", "Απρίλιος", "Μάιος", "Ιούνιος", "Ιούλιος", "Αύγουστος", "Σεπτέμβριος", "Οκτώβριος", "Νοέμβριος", "Δεκέμβριος"],
  monthNamesShort: ["Ιαν.", "Φεβ.", "Μαρ.", "Απρ.", "Μάι.", "Ιούν.", "Ιούλ.", "Αύγ.", "Σεπ.", "Οκτ.", "Νοέ.", "Δεκ."],
  dayNames: ["Κυριακή", "Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο"],
  dayNamesShort: ["Κυρ.", "Δευ.", "Τρί.", "Τετ.", "Πέμ.", "Παρ.", "Σάβ."],
  today: "Σήμερα"
}

const LocaleContext = createContext()

export const LocaleProvider = ({ children }) => {
  const [option, setOption] = useState("english")

  const setLocale = (newLocale) => setOption(newLocale)

  let locale

  switch (option) {
    case "english":
      locale = english
      break
    case "greek":
      locale = greek
      break
    default:
      locale = english
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  )
}

export default LocaleContext
