/** Expo & React */
import { Platform } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
/** Firebase */
import { getApp, getApps, initializeApp } from "firebase/app"
import { getReactNativePersistence, setPersistence, browserLocalPersistence, getAuth, initializeAuth } from "firebase/auth"

const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: ""
}

let firebase, auth

if (!getApps().length) {
  firebase = initializeApp(firebaseConfig)

  if (Platform.OS === "web") {
    auth = getAuth(firebase)
    setPersistence(auth, browserLocalPersistence)
  } else {
    auth = initializeAuth(firebase, {
      persistence: getReactNativePersistence(AsyncStorage),
    })
  }
} else {
  firebase = getApp()
  auth = getAuth(firebase)
}

export { auth }
