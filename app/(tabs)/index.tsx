import { Platform, StyleSheet } from 'react-native'
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'

import { mapStyle } from '@/constants/mapStyles'

import SpotDetailPanel from '@/components/SpotDetailPanel'
import SpotListView from '@/components/SpotListView'
import { ThemedView } from '@/components/themed-view'
import ViewToggleButton from '@/components/ViewToggleButton'
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

  const { data } = useBathingWaters()

  const { geolocation } = useGeolocationStore()
  const { view, setView } = useViewNavigationStore()
  const { setBathingWater, municipality } = useMapFilterStore()

  useAutoMunicipality()

  const allWaters = data?.watersAndAdvisories.map((w) => w.bathingWater) || []
  const filteredWaters = useFilteredBathingWaters(allWaters)

  const coordinates = filteredWaters.map((bw) => ({
    latitude: parseFloat(bw.samplingPointPosition.latitude),
    longitude: parseFloat(bw.samplingPointPosition.longitude),
  }))

  useFitMapToCoordinates(mapRef, coordinates, isMapReady, municipality, view)

  const handleListSelect = (water: BathingWater) => {
    setBathingWater(water)
    setView('map')
  }

  return (
    <ThemedView style={styles.container}>
      {view === 'map' ? (
        <>
          <MapView
            ref={mapRef}
            provider={Platform.OS === 'ios' ? PROVIDER_GOOGLE : undefined}
            customMapStyle={mapStyle}
            onMapReady={() => setIsMapReady(true)}
            style={StyleSheet.absoluteFillObject}
            showsUserLocation={!!geolocation}
            initialRegion={{
              latitude: geolocation?.coords.latitude ?? 62.0,
              longitude: geolocation?.coords.longitude ?? 15.0,
              latitudeDelta: geolocation ? 0.5 : 14.0,
              longitudeDelta: geolocation ? 0.5 : 14.0,
            }}
          >
            {isMapReady &&
              filteredWaters.map((water) => (
                <Marker
                  key={water.id}
                  coordinate={{
                    latitude: parseFloat(water.samplingPointPosition.latitude),
                    longitude: parseFloat(
                      water.samplingPointPosition.longitude
                    ),
                  }}
                  onPress={() => setBathingWater(water)}
                />
              ))}
          </MapView>
          <SpotDetailPanel />
        </>
      ) : (
        <SpotListView waters={filteredWaters} onSelect={handleListSelect} />
      )}
      <ViewToggleButton />
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
