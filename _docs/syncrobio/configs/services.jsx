import storage from "./storage"
import { firestore } from "./firebase"
import { collection, getDocs } from "firebase/firestore"
import { auth } from "./firebase"
import LIGHT_IMG from "../assets/images/prod_theme_light.jpeg"
import DARK_IMG from "../assets/images/prod_theme_dark.jpeg"
import MONOCHROME_IMG from "../assets/images/prod_theme_mono.jpeg"
import EN_US_IMG from "../assets/images/prod_locale_en_us.jpeg"

export const BASE_URL = "https://ccd4cgdy4y6dcnr4wkvog2r2w4.apigateway.eu-frankfurt-1.oci.customer-oci.com/v1/"

export const formatDate = (timestamp, type) => {
  const date = new Date(timestamp)
  switch (type) {
    case "date":
      return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    case "time":
      return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
    default:
      return `${date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })} - 
      ${date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`
  }
}

/** Fetching website data from Firestore */
export const fetchWebsite = async () => {
  try {
    const querySnapshot = await getDocs(collection(firestore, "syncrobio"))
    const data = querySnapshot.docs.map(doc => {
      return { id: doc.id, ...doc.data() }
    })
    const home = data.find(page => page.id === "home")
    const login = data.find(page => page.id === "login")
    const register = data.find(page => page.id === "register")
    await storage.set("home", home)
    await storage.set("login", login)
    await storage.set("register", register)
  } catch (error) {
    //TODO: Error Handling
    console.error(error.code, error.message)
  }
}

/** Requests Oracle Cloud Infrastructure */
export const request = async (method, action, body) => {
  try {
    const response = await fetch(BASE_URL + "authn", {
      method: method,
      headers: {
        "Access-Token": "Bearer " + auth.currentUser.stsTokenManager.accessToken,
        "Action": action
      },
      body: body ? JSON.stringify(body) : null
    })
    const data = await response.json()
    return data
  } catch (error) {
    //TODO: Error Handling
    console.error(error.code, error.message)
  }
}

export const settings = {
  "profile": {
    "name": "Personal Information",
    "icon": "",
    "categories": [
      {
        "name": "Account information",
        "icon": "id-card-outline",
        "action": "info"
      },
      {
        "name": "Change your email or password",
        "icon": "key-outline",
        "action": "security"
      },
      {
        "name": "Account access",
        "icon": "shield-outline",
        "action": "access"
      },
      {
        "name": "Download an archive of your data",
        "icon": "cloud-download-outline",
        "action": "download"
      },
      {
        "name": "Deactivate your account",
        "icon": "person-remove-outline",
        "action": "deactivate"
      }
    ]
  },
  "menu": [
    {
      "name": "Preferences",
      "icon": "options-sharp",
      "chevron": true,
      "categories": [
        {
          "name": "Change theme",
          "icon": "contrast-outline",
          "action": "theme",
          "options": [
            {
              "name": "light",
              "image": LIGHT_IMG,
              "overlay": true
            },
            {
              "name": "dark",
              "image": DARK_IMG,
              "overlay": false
            },
            {
              "name": "monochrome",
              "image": MONOCHROME_IMG,
              "overlay": false
            }
          ]
        },
        {
          "name": "Change language",
          "icon": "language-outline",
          "action": "locale",
          "options": [
            {
              "name": "english",
              "code": "en-US",
              "image": EN_US_IMG,
              "overlay": false
            }
          ]
        }
      ]
    },
    {
      "name": "Help",
      "icon": "help-buoy-outline",
      "chevron": true,
      "categories": [
        {
          "name": "Help center",
          "icon": "library-outline",
          "action": "help"
        },
        {
          "name": "Report an issue",
          "icon": "bug-outline",
          "action": "issue"
        },
        {
          "name": "Propose a feature",
          "icon": "bulb-outline",
          "action": "feature"
        }
      ]
    },
    {
      "name": "Legal",
      "icon": "briefcase-outline",
      "chevron": true,
      "categories": [
        {
          "name": "Terms of Service",
          "icon": "book-outline",
          "action": "tos"
        },
        {
          "name": "Privacy policy",
          "icon": "lock-closed-outline",
          "action": "policy"
        }
      ]
    }
  ]
}