import AsyncStorage from '@react-native-async-storage/async-storage'
import { createJSONStorage } from 'zustand/middleware'

const safeAsyncStorage = {
  getItem: async (key: string) => {
    try {
      return await AsyncStorage.getItem(key)
    } catch {
      return null
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      await AsyncStorage.setItem(key, value)
    } catch {}
  },
  removeItem: async (key: string) => {
    try {
      await AsyncStorage.removeItem(key)
    } catch {}
  },
}

export const safeStorage = safeAsyncStorage

export const jsonStorage = createJSONStorage(() => safeAsyncStorage)
