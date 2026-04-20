import { jsonStorage } from '@/lib/storage'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface OnboardingState {
  isOnboarded: boolean
  hasHydrated: boolean
}

interface OnboardingActions {
  setIsOnboarded: (value: boolean) => void
  resetOnboarding: () => void
  setHasHydrated: (value: boolean) => void
}

type OnboardingStore = OnboardingState & OnboardingActions

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      isOnboarded: false,
      hasHydrated: false,
      setIsOnboarded: (value: boolean) => set({ isOnboarded: value }),
      resetOnboarding: () => set({ isOnboarded: false }),
      setHasHydrated: (value: boolean) => set({ hasHydrated: value }),
    }),
    {
      name: 'onboarding-storage',
      storage: jsonStorage,
      partialize: (state) => ({ isOnboarded: state.isOnboarded }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Error rehydrating onboarding store:', error)
        }
        useOnboardingStore.getState().setHasHydrated(true)
      },
    }
  )
)
