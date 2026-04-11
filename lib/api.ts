import { BathingWaterApiStatus } from '@/types/BathingWater/BathingWaterApiStatus'
import { BathingWaterProfile } from '@/types/BathingWater/BathingWaterProfile'
import { BathingWaters } from '@/types/BathingWater/BathingWaters'
import { SmhiForecast } from '@/types/Smhi/SmhiForecast'

const SMHI_BASE =
  'https://opendata-download-metanalys.smhi.se/api/category/mesan2g/version/2/geotype/point'

export const getSmhiForecast = async (
  lat: number,
  lon: number
): Promise<SmhiForecast> => {
  const response = await fetch(
    `${SMHI_BASE}/lon/${lon.toFixed(6)}/lat/${lat.toFixed(6)}/data.json`
  )

  if (!response.ok) {
    throw new Error(`SMHI response was not ok: ${response.statusText}`)
  }

  const data: SmhiForecast = await response.json()
  return data
}

export const getBathingWaterApiStatus =
  async (): Promise<BathingWaterApiStatus> => {
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_HAV_API_URL}/operations/health-checks/readiness`
    )

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`)
    }

    const data: BathingWaterApiStatus = await response.json()
    return data
  }

export const getBathingWaters = async (): Promise<BathingWaters> => {
  const response = await fetch(
    `${process.env.EXPO_PUBLIC_HAV_API_URL}/bathing-waters`
  )

  if (!response.ok) {
    throw new Error(`Network response was not ok: ${response.statusText}`)
  }

  const data: BathingWaters = await response.json()
  return data
}

export const getBathingWaterProfile = async (
  id: string
): Promise<BathingWaterProfile> => {
  const response = await fetch(
    `${process.env.EXPO_PUBLIC_HAV_API_URL}/bathing-waters/${id}/profiles`
  )

  if (!response.ok) {
    throw new Error(`Network response was not ok: ${response.statusText}`)
  }

  const data: BathingWaterProfile = await response.json()
  return data
}
