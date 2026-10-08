/** React */
import { createContext, useContext, useEffect, useState, useCallback } from "react"
/** Configs */
import { requestJson } from "./services"
import storage from "./storage"

const CACHE_KEY = "admin.auth"

/** Dev-only: in-memory flag so signOut() under __DEV__ keeps us as guest
 *  until the page is reloaded. Without it, refresh() would auto-re-auth. */
let devSignedOut = false

const AuthContext = createContext({
    authState: "checking", // checking | authed | guest
    user: null,
    refresh: async () => { },
    signOut: async () => { },
})

export const AuthProvider = ({ children }) => {
    const [authState, setAuthState] = useState("checking")
    const [user, setUser] = useState(null)

    /** Persist + mirror to state */
    const apply = useCallback(async (nextUser) => {
        if (nextUser) {
            setUser(nextUser)
            setAuthState("authed")
            await storage.set(CACHE_KEY, nextUser)
        } else {
            setUser(null)
            setAuthState("guest")
            await storage.delete(CACHE_KEY)
        }
    }, [])

    /** Revalidate against the server */
    const refresh = useCallback(async () => {
        if (__DEV__) {
            if (devSignedOut) {
                await apply(null)
                return
            }
            await apply({ email: "dev@local.com", role: "admin" })
            return
        }
        const response = await requestJson("/api/auth/user", "GET")
        if (response?.status === 200 && response?.data?.status === "ok") {
            await apply({ email: response.data.email, role: response.data.role })
        } else {
            await apply(null)
        }
    }, [apply])

    const signOut = useCallback(async () => {
        if (__DEV__) {
            devSignedOut = true
            await apply(null)
            return
        }
        await requestJson("/api/auth/logout", "POST")
        await apply(null)
    }, [apply])

    /** On mount: seed from cache (optimistic), then revalidate against the
     *  server so a revoked/expired session is corrected on the next render. */
    useEffect(() => {
        let mounted = true
            ; (async () => {
                const cached = await storage.get(CACHE_KEY)
                if (mounted && cached) {
                    setUser(cached)
                    setAuthState("authed")
                }
                await refresh()
            })()
        return () => { mounted = false }
    }, [refresh])

    return <AuthContext.Provider value={{ authState, user, refresh, signOut }}>
        {children}
    </AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)

