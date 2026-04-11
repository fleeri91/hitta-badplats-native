import { isInsideSweden } from '@/lib/helpers'
import { useMapFilterStore } from '@/store/useMapFilter'
import { BathingWater } from '@/types/BathingWater/BathingWaters'
import { WaterTypeId } from '@/types/BathingWater/WaterType'
import { useMemo } from 'react'

export const useFilteredBathingWaters = (
  bathingWaters: BathingWater[]
): BathingWater[] => {
  const { municipality } = useMapFilterStore()

  return useMemo(() => {
    if (!municipality) {
      return []
    }

    const baseFiltered = bathingWaters.filter((bw) => {
      const lat = parseFloat(bw.samplingPointPosition.latitude)
      const lon = parseFloat(bw.samplingPointPosition.longitude)
      const isWaterTypeValid =
        bw.waterTypeId === WaterTypeId.HAV || bw.waterTypeId === WaterTypeId.SJÖ
      return isInsideSweden(lat, lon) && isWaterTypeValid
    })

    return baseFiltered.filter(
      (bw) =>
        bw.municipality?.name?.toLowerCase() === municipality.toLowerCase()
    )
  }, [bathingWaters, municipality])
}
