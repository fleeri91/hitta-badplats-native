import { MunicipalityName } from '@/constants/municipalities'
import { BathingWater } from '@/types/BathingWater/BathingWaters'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist, PersistOptions } from 'zustand/middleware'

export type MapFilterState = {
  municipality: MunicipalityName | null
  selectedBathingWater: BathingWater | null
}

type MapFilterActions = {
  setMunicipality: (value: MunicipalityName | null) => void
  setBathingWater: (value: BathingWater | null) => void
  reset: () => void
}

type MapFilterStore = MapFilterState & MapFilterActions

const initialState: MapFilterState = {
  municipality: null,
  selectedBathingWater: null,
}

export const useMapFilterStore = create<MapFilterStore>()(
  persist(
    (set) => ({
      ...initialState,
      setMunicipality: (value) => set({ municipality: value }),
      setBathingWater: (value) => set({ selectedBathingWater: value }),
      reset: () => set(initialState),
    }),
    {
      name: 'mapfilter-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state: MapFilterStore): MapFilterState => ({
        ...initialState,
        municipality: state.municipality,
      }),
      onRehydrateStorage: () => (state, error: Error | undefined) => {
        if (error) {
          console.error('Error rehydrating map filter store:', {
            error: error.message,
            stack: error.stack,
            state,
          })
        }
      },
    } as PersistOptions<MapFilterStore, MapFilterState>
  )
)
