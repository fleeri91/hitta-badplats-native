import { useEffect } from 'react'
import { InteractionManager } from 'react-native'
import { Region } from 'react-native-maps'

const DEFAULT_PADDING = {
  top: 50,
  right: 50,
  bottom: 50,
  left: 50,
}

interface Coordinate {
  latitude: number
  longitude: number
}

function getRegionFromCoordinates(coords: Coordinate[]): Region | null {
  if (coords.length === 0) return null

  const latitudes = coords.map((c) => c.latitude)
  const longitudes = coords.map((c) => c.longitude)

  const minLat = Math.min(...latitudes)
  const maxLat = Math.max(...latitudes)
  const minLng = Math.min(...longitudes)
  const maxLng = Math.max(...longitudes)

  const latitude = (minLat + maxLat) / 2
  const longitude = (minLng + maxLng) / 2

  const latitudeDelta = Math.max((maxLat - minLat) * 1.5, 0.02)
  const longitudeDelta = Math.max((maxLng - minLng) * 1.5, 0.02)

  return { latitude, longitude, latitudeDelta, longitudeDelta }
}

export function useFitMapToCoordinates(
  mapRef: React.RefObject<any>,
  coordinates: Coordinate[],
  isMapReady: boolean,
  municipality: string | null,
  view: string
) {
  useEffect(() => {
    if (!mapRef.current || !isMapReady || coordinates.length === 0) {
      return
    }

    const fitMap = async () => {
      try {
        await new Promise<void>((resolve) =>
          InteractionManager.runAfterInteractions(() => resolve())
        )

        if (!mapRef.current) return

        mapRef.current.fitToCoordinates(coordinates, {
          edgePadding: DEFAULT_PADDING,
          animated: false,
        })

        await new Promise((res) => setTimeout(res, 500))

        const region = getRegionFromCoordinates(coordinates)
        if (region) {
          const nudgedRegion: Region = {
            ...region,
            latitudeDelta: region.latitudeDelta * 0.99,
            longitudeDelta: region.longitudeDelta * 0.99,
          }

          mapRef.current.animateToRegion(nudgedRegion, 300)
        }
      } catch (err) {
        console.warn('Map fitting or nudging failed', err)
      }
    }

    fitMap()
  }, [isMapReady, municipality, view])
}
