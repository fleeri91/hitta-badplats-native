import { BathingWaters } from '@/types/BathingWater/BathingWaters'

const SMHI_BASE =
  'https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point'

interface WeatherEntry {
  time: string
  temperature: number
  windSpeed: number
  cloudiness: number
}

interface PmpTimeSeries {
  validTime: string
  parameters: { name: string; values: number[] }[]
}

interface SpotWithWeather {
  id: string
  name: string
  municipality: string
  coordinates: { lat: number; lon: number }
  weather: WeatherEntry[] | null
}

async function fetchDayWeather(
  lat: number,
  lon: number
): Promise<WeatherEntry[] | null> {
  try {
    const response = await fetch(
      `${SMHI_BASE}/lon/${lon.toFixed(6)}/lat/${lat.toFixed(6)}/data.json`
    )
    if (!response.ok) return null

    const { timeSeries }: { timeSeries: PmpTimeSeries[] } = await response.json()
    const today = new Date().toISOString().slice(0, 10)

    return timeSeries
      .filter((ts) => ts.validTime.startsWith(today))
      .map((ts) => {
        const get = (name: string) =>
          ts.parameters.find((p) => p.name === name)?.values[0] ?? 0
        // tcc_mean is in oktas (0–8), convert to percent
        const cloudiness = Math.round((get('tcc_mean') / 8) * 100)
        return {
          time: ts.validTime,
          temperature: Math.round(get('t') * 10) / 10,
          windSpeed: Math.round(get('ws') * 10) / 10,
          cloudiness,
        }
      })
  } catch {
    return null
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const municipality = searchParams.get('municipality')

  if (!municipality) {
    return Response.json(
      { error: 'municipality parameter is required' },
      { status: 400 }
    )
  }

  const havResponse = await fetch(
    `${process.env.EXPO_PUBLIC_HAV_API_URL}/bathing-waters`
  )
  if (!havResponse.ok) {
    return Response.json(
      { error: 'Failed to fetch bathing waters' },
      { status: 502 }
    )
  }

  const { watersAndAdvisories }: BathingWaters = await havResponse.json()

  const filtered = watersAndAdvisories.filter(
    ({ bathingWater }) =>
      bathingWater.municipality.name.toLowerCase() ===
      municipality.toLowerCase()
  )

  const spots: SpotWithWeather[] = await Promise.all(
    filtered.map(async ({ bathingWater }) => {
      const lat = parseFloat(bathingWater.samplingPointPosition.latitude)
      const lon = parseFloat(bathingWater.samplingPointPosition.longitude)
      const weather = await fetchDayWeather(lat, lon)

      return {
        id: bathingWater.id,
        name: bathingWater.name,
        municipality: bathingWater.municipality.name,
        coordinates: { lat, lon },
        weather,
      }
    })
  )

  return Response.json(
    { spots },
    { headers: { 'Cache-Control': 'public, max-age=1800' } }
  )
}
