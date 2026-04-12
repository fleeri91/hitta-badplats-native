import { StyleSheet } from 'react-native'
import { Region } from 'react-native-maps'
import ClusteringMapView from 'react-native-map-clustering'

import BathingWaterMarker from '@/components/BathingWaterMarker'
import ClusterMarker from '@/components/ClusterMarker'
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
  const mapRef = useRef<any>(null)
  const superClusterRef = useRef<any>(null)
  const [isMapReady, setIsMapReady] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(12)

  const { data } = useBathingWaters()

  const { geolocation } = useGeolocationStore()
  const { view, setView } = useViewNavigationStore()
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

  const handleListSelect = (water: BathingWater) => {
    setBathingWater(water)
    setView('map')
  }

  const handleClusterPress = (cluster: any) => {
    const expansionZoom = Math.min(
      superClusterRef.current?.getClusterExpansionZoom(
        cluster.properties.cluster_id
      ) ?? 14,
      14
    )
    const [longitude, latitude] = cluster.geometry.coordinates
    const latitudeDelta = 360 / Math.pow(2, expansionZoom)
    mapRef.current?.animateToRegion(
      { latitude, longitude, latitudeDelta, longitudeDelta: latitudeDelta },
      350
    )
  }

  return (
    <ThemedView style={styles.container}>
      {view === 'map' ? (
        <>
          <ClusteringMapView
            mapRef={(ref) => { mapRef.current = ref }}
            superClusterRef={superClusterRef}
            onMapReady={() => setIsMapReady(true)}
            style={StyleSheet.absoluteFillObject}
            showsUserLocation={!!geolocation}
            onRegionChangeComplete={handleRegionChangeComplete}
            initialRegion={{
              latitude: geolocation?.coords.latitude ?? 62.0,
              longitude: geolocation?.coords.longitude ?? 15.0,
              latitudeDelta: geolocation ? 0.5 : 14.0,
              longitudeDelta: geolocation ? 0.5 : 14.0,
            }}
            clusteringEnabled={true}
            radius={48}
            minPoints={3}
            maxZoom={14}
            animationEnabled={true}
            renderCluster={(cluster) => (
              <ClusterMarker
                key={`cluster-${cluster.id}`}
                cluster={cluster}
                onPress={() => handleClusterPress(cluster)}
              />
            )}
          >
            {isMapReady &&
              filteredWaters.map((water) => {
                const latitude = parseFloat(water.samplingPointPosition.latitude)
                const longitude = parseFloat(water.samplingPointPosition.longitude)
                if (isNaN(latitude) || isNaN(longitude)) return null
                return (
                  <BathingWaterMarker
                    key={water.id}
                    water={water}
                    coordinate={{ latitude, longitude }}
                    zoomLevel={zoomLevel}
                    selected={selectedBathingWater?.id === water.id}
                    onSelect={handleMarkerSelect}
                  />
                )
              })}
          </ClusteringMapView>
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
