/** React */
import AsyncStorage from "@react-native-async-storage/async-storage"

/** Thin JSON wrapper around AsyncStorage.
 *  See https://docs.expo.dev/develop/user-interface/store-data/
 *  On web AsyncStorage is backed by window.localStorage. */
const storage = {
    set: async (key, value) => {
        try {
            if (value == null) {
                await AsyncStorage.removeItem(key)
            } else {
                await AsyncStorage.setItem(key, JSON.stringify(value))
            }
            return true
        } catch (error) {
            console.log(error)
            return false
        }
    },
    get: async (key) => {
        try {
            const data = await AsyncStorage.getItem(key)
            return data != null ? JSON.parse(data) : null
        } catch (error) {
            console.log(error)
            return null
        }
    },
    delete: async (key) => {
        try {
            await AsyncStorage.removeItem(key)
            return true
        } catch (error) {
            console.log(error)
            return false
        }
    },
}

export default storage
