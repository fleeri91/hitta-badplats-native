import { jsonStorage } from '@/lib/storage'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface OnboardingState {
  isOnboarded: boolean
}

interface OnboardingActions {
  setIsOnboarded: (value: boolean) => void
  resetOnboarding: () => void
}

type OnboardingStore = OnboardingState & OnboardingActions

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      isOnboarded: false,
      setIsOnboarded: (value: boolean) => set({ isOnboarded: value }),
      resetOnboarding: () => set({ isOnboarded: false }),
    }),
    {
      name: 'onboarding-storage',
      storage: jsonStorage,
      partialize: (state) => ({ isOnboarded: state.isOnboarded }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Error rehydrating onboarding store:', error)
        }
      },
    }
  )
)
