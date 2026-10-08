/** Firebase */
import { signInWithPopup, OAuthProvider, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth"
import { auth } from "./firebase"

export const useMicrosoft = async () => {
    try {
        const provider = new OAuthProvider("microsoft.com")
        provider.addScope("email")
        provider.addScope("profile")
        provider.addScope("openid")
        provider.addScope("User.Read")
        provider.setCustomParameters({ prompt: "select_account", tenant: "common" })
        const authn = await signInWithPopup(auth, provider)
        return { user: authn.user, error: null }
    } catch (error) {
        return { user: null, error: error.code }
    }
}

export const useGoogle = async () => {
    try {
        const provider = new GoogleAuthProvider()
        provider.addScope("profile")
        provider.addScope("email")
        const authn = await signInWithPopup(auth, provider)
        return { user: authn.user, error: null }
    } catch (error) {
        return { user: null, error: error.code }
    }
}

export const useEmail = async (email, password) => {
    try {
        /** Sign in */
        const authn = await signInWithEmailAndPassword(auth, email, password)
        return { user: authn.user, error: null }
    } catch (error) {
        return { user: null, error: error.code }
    }
}

export const registerEmail = async (email, password) => {
    try {
        /** Register new account */
        const authn = await createUserWithEmailAndPassword(auth, email, password)
        return { user: authn.user, error: null }
    } catch (error) {
        return { user: null, error: error.code }
    }
}