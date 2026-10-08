import { getReactNativePersistence } from "@firebase/auth/dist/rn/index.js"
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage"
import { getApp, getApps, initializeApp } from "firebase/app"
import { browserLocalPersistence, getAuth, initializeAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { Platform } from "react-native"

const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: ""
}

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
