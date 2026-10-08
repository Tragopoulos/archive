/** React */
import AsyncStorage from "@react-native-async-storage/async-storage"

const storage = {
  set: async (key, value) => {
    try {
      if (value == null) {
        await AsyncStorage.removeItem(key)
      } else {
        const data = JSON.stringify(value)
        await AsyncStorage.setItem(key, data)
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
      return false
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
  getKeys: async () => {
    try {
      const keys = await AsyncStorage.getAllKeys()
      return keys
    } catch (error) {
      console.log(error)
      return false
    }
  },
}

export default storage
