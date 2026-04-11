import { TailwindColors } from '@/constants/tailwindColors'
import { getDistanceInKm } from '@/lib/helpers'
import { useGeolocationStore } from '@/store/useGeolocation'
import { BathingWater } from '@/types/BathingWater/BathingWaters'
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ThemedText } from './themed-text'
import { ThemedView } from './themed-view'

type Props = {
  waters: BathingWater[]
  onSelect: (water: BathingWater) => void
}

function formatDistance(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`
}

export default function SpotListView({ waters, onSelect }: Props) {
  const { geolocation } = useGeolocationStore()
  const { top } = useSafeAreaInsets()

  const userLat = geolocation?.coords.latitude ?? null
  const userLon = geolocation?.coords.longitude ?? null

  const sorted = userLat !== null && userLon !== null
    ? [...waters].sort((a, b) => {
        const dA = getDistanceInKm(
          userLat,
          userLon,
          parseFloat(a.samplingPointPosition.latitude),
          parseFloat(a.samplingPointPosition.longitude)
        )
        const dB = getDistanceInKm(
          userLat,
          userLon,
          parseFloat(b.samplingPointPosition.latitude),
          parseFloat(b.samplingPointPosition.longitude)
        )
        return dA - dB
      })
    : waters

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: top + 64, paddingBottom: 24 }}
        renderItem={({ item }) => {
          const distance =
            userLat !== null && userLon !== null
              ? getDistanceInKm(
                  userLat,
                  userLon,
                  parseFloat(item.samplingPointPosition.latitude),
                  parseFloat(item.samplingPointPosition.longitude)
                )
              : null

          return (
            <TouchableOpacity style={styles.item} onPress={() => onSelect(item)}>
              <View style={styles.itemMain}>
                <ThemedText style={styles.itemName} numberOfLines={1}>
                  {item.name}
                </ThemedText>
                <ThemedText style={styles.itemSub}>
                  {item.municipality?.name} · {item.waterTypeIdText}
                </ThemedText>
              </View>
              {distance !== null && (
                <ThemedText style={styles.distance}>
                  {formatDistance(distance)}
                </ThemedText>
              )}
            </TouchableOpacity>
          )
        }}
        ItemSeparatorComponent={() => (
          <View style={styles.separator} />
        )}
      />
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  itemMain: {
    flex: 1,
    gap: 3,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '500',
  },
  itemSub: {
    fontSize: 13,
    color: TailwindColors.gray['500'],
  },
  distance: {
    fontSize: 13,
    color: TailwindColors.blue['500'],
    fontWeight: '500',
    marginLeft: 12,
  },
  separator: {
    height: 1,
    backgroundColor: TailwindColors.gray['100'],
    marginLeft: 20,
  },
})
