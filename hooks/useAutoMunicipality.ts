import { MunicipalityName } from '@/constants/municipalities'
import { getDistanceInKm } from '@/lib/helpers'
import { useBathingWaters } from '@/lib/queries'
import { useGeolocationStore } from '@/store/useGeolocation'
import { useMapFilterStore } from '@/store/useMapFilter'
import { useEffect } from 'react'

export function useAutoMunicipality() {
  const { geolocation } = useGeolocationStore()
  const { setMunicipality } = useMapFilterStore()
  const { data } = useBathingWaters()

  useEffect(() => {
    if (!geolocation || !data) return

    const { latitude, longitude } = geolocation.coords
    const waters = data.watersAndAdvisories.map((w) => w.bathingWater)

    let nearestMunicipality: string | null = null
    let minDist = Infinity

    for (const water of waters) {
      const lat = parseFloat(water.samplingPointPosition.latitude)
      const lon = parseFloat(water.samplingPointPosition.longitude)
      if (isNaN(lat) || isNaN(lon)) continue

      const dist = getDistanceInKm(latitude, longitude, lat, lon)
      if (dist < minDist) {
        minDist = dist
        nearestMunicipality = water.municipality?.name ?? null
      }
    }

    if (nearestMunicipality) {
      setMunicipality(nearestMunicipality as MunicipalityName)
    }
  }, [geolocation, data])
}
