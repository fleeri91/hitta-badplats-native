import { useQuery } from '@tanstack/react-query'

import { getBathingWaterProfile, getBathingWaters, getSmhiForecast } from './api'

export const queryKeys = {
  bathingWaters: ['bathingWaters'],
  bathingWaterProfile: (id: string) => ['bathingWaterProfile', id],
  smhiForecast: (lat: number, lon: number) => ['smhiForecast', lat, lon],
}

export const useBathingWaters = () => {
  return useQuery({
    queryKey: queryKeys.bathingWaters,
    queryFn: getBathingWaters,
    staleTime: 1000 * 60 * 60 * 24,
    refetchInterval: 1000 * 30,
  })
}

export const useBathingWaterProfile = (id: string) => {
  return useQuery({
    queryKey: queryKeys.bathingWaterProfile(id),
    queryFn: () => getBathingWaterProfile(id),
    enabled: !!id,
  })
}

export const useSmhiForecast = (lat: number | null, lon: number | null) => {
  return useQuery({
    queryKey: queryKeys.smhiForecast(lat ?? 0, lon ?? 0),
    queryFn: () => getSmhiForecast(lat!, lon!),
    enabled: lat !== null && lon !== null,
    staleTime: 1000 * 60 * 30,
  })
}
