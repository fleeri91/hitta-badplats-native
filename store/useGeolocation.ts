import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Location from 'expo-location'
import { LocationObject } from 'expo-location'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export type GeoPosition = {
  latitude: number
  longitude: number
}

interface GeolocationState {
  geolocation: LocationObject | null
  loading: boolean
}

interface GeolocationActions {
  setGeolocation: (location: LocationObject) => void
  clearGeolocation: () => void
  getCurrentLocation: () => Promise<GeoPosition | null>
}

type GeolocationStore = GeolocationState & GeolocationActions

const initialState: GeolocationState = {
  geolocation: null,
  loading: false,
}

export const useGeolocationStore = create<GeolocationStore>()(
  persist(
    (set) => ({
      ...initialState,
      setGeolocation: (location: LocationObject) =>
        set({ geolocation: location }),
      clearGeolocation: () => set({ geolocation: null }),
      getCurrentLocation: async () => {
        try {
          set({ loading: true })

          const { status } = await Location.requestForegroundPermissionsAsync()
          if (status !== 'granted') {
            console.warn('Location permission not granted')
            set({ loading: false })
            return null
          }

          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          })

          set({ geolocation: location })

          const {
            coords: { latitude, longitude },
          } = location

          return { latitude, longitude }
        } catch (error) {
          console.error('Error getting location:', error)
          return null
        } finally {
          set({ loading: false })
        }
      },
    }),
    {
      name: 'geolocation-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ geolocation: state.geolocation }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Error rehydrating geolocation store:', error)
        }
      },
    }
  )
)
