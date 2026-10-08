import { getReactNativePersistence } from "@firebase/auth/dist/rn/index.js"
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage"
import { getApp, getApps, initializeApp } from "firebase/app"
import { browserLocalPersistence, getAuth, initializeAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { Platform } from "react-native"

const firebaseConfig = {
  apiKey: "AIzaSyAmm4bqwl6PPJ3FDyjy8VYZ6_E8B5VMAG4",
  authDomain: "syncrobio.firebaseapp.com",
  projectId: "syncrobio",
  storageBucket: "syncrobio.appspot.com",
  messagingSenderId: "452846778249",
  appId: "1:452846778249:web:641a2e060455fdf12d5358",
  measurementId: "G-E7CC4NY0TB"
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