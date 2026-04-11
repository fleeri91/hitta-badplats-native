import { StyleSheet } from 'react-native'
import MapView, { Region } from 'react-native-maps'

import BathingWaterMarker from '@/components/BathingWaterMarker'
import { ThemedView } from '@/components/themed-view'
import { useAutoMunicipality } from '@/hooks/useAutoMunicipality'
import { useFilteredBathingWaters } from '@/hooks/useFilteredBathingWaters'
import { useFitMapToCoordinates } from '@/hooks/useFitMapToCoordinates'
import { useBathingWaters } from '@/lib/queries'
import { useGeolocationStore } from '@/store/useGeolocation'
import { useMapFilterStore } from '@/store/useMapFilter'
import { useViewNavigationStore } from '@/store/useViewNavigation'
import { BathingWater } from '@/types/BathingWater/BathingWaters'
import { useRef, useState } from 'react'

export default function HomeScreen() {
  const mapRef = useRef<MapView>(null)
  const [isMapReady, setIsMapReady] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(12)

  const { data } = useBathingWaters()

  const { geolocation } = useGeolocationStore()
  const { view } = useViewNavigationStore()
  const { setBathingWater, municipality, selectedBathingWater } =
    useMapFilterStore()

  useAutoMunicipality()

  const allWaters = data?.watersAndAdvisories.map((w) => w.bathingWater) || []
  const filteredWaters = useFilteredBathingWaters(allWaters)

  const coordinates = filteredWaters.map((bw) => ({
    latitude: parseFloat(bw.samplingPointPosition.latitude),
    longitude: parseFloat(bw.samplingPointPosition.longitude),
  }))

  useFitMapToCoordinates(mapRef, coordinates, isMapReady, municipality, view)

  const handleRegionChangeComplete = (region: Region) => {
    const zoom = Math.round(Math.log2(360 / region.latitudeDelta))
    setZoomLevel(zoom)
  }

  const handleMarkerSelect = (water: BathingWater) => {
    setBathingWater(water)
  }

  return (
    <ThemedView style={styles.container}>
      <MapView
        ref={mapRef}
        onMapReady={() => setIsMapReady(true)}
        style={StyleSheet.absoluteFillObject}
        showsUserLocation={!!geolocation}
        onRegionChangeComplete={handleRegionChangeComplete}
      >
        {isMapReady &&
          filteredWaters.map((water) => (
            <BathingWaterMarker
              key={water.id}
              water={water}
              zoomLevel={zoomLevel}
              selected={selectedBathingWater?.id === water.id}
              onSelect={handleMarkerSelect}
            />
          ))}
      </MapView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
