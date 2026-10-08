/** Expo & React */
import { Platform } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
/** Firebase */
import { getApp, getApps, initializeApp } from "firebase/app"
import { getReactNativePersistence, setPersistence, browserLocalPersistence, getAuth, initializeAuth } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyDSp6W4c4CDjEF__tbXAy1706O1QNPJ5Os",
  authDomain: "syncroinspect.firebaseapp.com",
  projectId: "syncroinspect",
  storageBucket: "syncroinspect.firebasestorage.app",
  messagingSenderId: "369227992045",
  appId: "1:369227992045:web:147cb062adb1a5ee1435e4",
  measurementId: "G-1VW4K0HNTC"
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
