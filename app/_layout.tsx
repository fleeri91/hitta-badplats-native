import OnboardingScreen from '@/components/OnboardingScreen'
import { TailwindColors } from '@/constants/tailwindColors'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { safeStorage } from '@/lib/storage'
import { useOnboardingStore } from '@/store/useOnboarding'
import {
  DarkTheme,
  DefaultTheme,
  Theme,
  ThemeProvider,
} from '@react-navigation/native'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import { QueryClient } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

export const unstable_settings = {
  anchor: '(tabs)',
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24,
    },
  },
})

const asyncStoragePersister = createAsyncStoragePersister({
  storage: safeStorage,
})

const LightTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: TailwindColors.sky['500'],
    background: '#FFFFFF',
    card: '#FFFFFF',
    text: '#0F172A',
    border: TailwindColors.gray['100'],
    notification: TailwindColors.sky['500'],
  },
}

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const { isOnboarded, hasHydrated } = useOnboardingStore()

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: asyncStoragePersister }}
    >
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : LightTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="modal"
            options={{ presentation: 'modal', title: 'Modal' }}
          />
        </Stack>
        <StatusBar style="dark" />
        {hasHydrated && !isOnboarded && <OnboardingScreen />}
      </ThemeProvider>
    </PersistQueryClientProvider>
  )
}
