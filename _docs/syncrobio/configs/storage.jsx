import AsyncStorage from "@react-native-async-storage/async-storage";

const storage = {
  set: async (key, value) => {
    try {
      const data = JSON.stringify(value);
      await AsyncStorage.setItem(key, data);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  },
  get: async (key) => {
    try {
      const data = await AsyncStorage.getItem(key);
      return JSON.parse(data);
    } catch (error) {
      console.log(error);
      return false;
    }
  },
  delete: async (key) => {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  },
  getKeys: async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return keys;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
};

export default storage;
