import { useQuery } from '@tanstack/react-query'

import { getBathingWaterProfile, getBathingWaters } from './api'

export const queryKeys = {
  bathingWaters: ['bathingWaters'],
  bathingWaterProfile: ['bathingWaterProfile'],
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
    queryKey: queryKeys.bathingWaterProfile,
    queryFn: () => getBathingWaterProfile(id),
  })
}
