import { getReactNativePersistence } from "@firebase/auth/dist/rn/index.js"
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage"
import { getApp, getApps, initializeApp } from "firebase/app"
import { browserLocalPersistence, getAuth, initializeAuth, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { Platform } from "react-native"

const firebaseConfig = {
  apiKey: "AIzaSyALyAQ4Qoe-gDd7VeAY_EsX420kfcRQfVo",
  authDomain: "syncropet.firebaseapp.com",
  projectId: "syncropet",
  storageBucket: "syncropet.appspot.com",
  messagingSenderId: "868197467732",
  appId: "1:868197467732:web:416c819f7d347bf2b2cfc1",
  measurementId: "G-T44DC0611S"
}

/** Creates the firebase auth and firestore */
let firebase, auth, firestore

const persistence = Platform.OS === "web" ? browserLocalPersistence : getReactNativePersistence(ReactNativeAsyncStorage)

if (!getApps().length) {
  try {
    firebase = initializeApp(firebaseConfig)
    auth = initializeAuth(firebase, { persistence })
    firestore = getFirestore(firebase)

  } catch (error) {
    console.log("Error initializing app: " + error)
  }
} else {
  firebase = getApp()
  auth = getAuth(firebase, { persistence })
  firestore = getFirestore(firebase)
}

export { auth, firestore }