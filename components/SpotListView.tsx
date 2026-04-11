import { TailwindColors } from '@/constants/tailwindColors'
import { getDistanceInKm } from '@/lib/helpers'
import { useGeolocationStore } from '@/store/useGeolocation'
import { useMapFilterStore } from '@/store/useMapFilter'
import { BathingWater } from '@/types/BathingWater/BathingWaters'
import { WaterTypeId } from '@/types/BathingWater/WaterType'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6'
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

function waterColor(waterTypeId: number): string {
  return waterTypeId === WaterTypeId.HAV
    ? TailwindColors.sky['500']
    : TailwindColors.teal['500']
}

export default function SpotListView({ waters, onSelect }: Props) {
  const { geolocation } = useGeolocationStore()
  const { municipality } = useMapFilterStore()
  const { top } = useSafeAreaInsets()

  const userLat = geolocation?.coords.latitude ?? null
  const userLon = geolocation?.coords.longitude ?? null

  const sorted =
    userLat !== null && userLon !== null
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
        contentContainerStyle={{ paddingTop: top + 72, paddingBottom: 32 }}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <ThemedText style={styles.listHeaderTitle}>
              {municipality ?? 'Badplatser'}
            </ThemedText>
            <ThemedText style={styles.listHeaderCount}>
              {waters.length} platser
            </ThemedText>
          </View>
        }
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
            <TouchableOpacity
              style={styles.item}
              onPress={() => onSelect(item)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.iconWrap,
                  { backgroundColor: waterColor(item.waterTypeId) + '18' },
                ]}
              >
                <FontAwesome6
                  name="person-swimming"
                  size={16}
                  color={waterColor(item.waterTypeId)}
                />
              </View>
              <View style={styles.itemMain}>
                <ThemedText style={styles.itemName} numberOfLines={1}>
                  {item.name}
                </ThemedText>
                <ThemedText style={styles.itemSub}>
                  {item.waterTypeIdText}
                </ThemedText>
              </View>
              {distance !== null && (
                <View style={styles.distanceBadge}>
                  <ThemedText style={styles.distanceText}>
                    {formatDistance(distance)}
                  </ThemedText>
                </View>
              )}
            </TouchableOpacity>
          )
        }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  listHeaderTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  listHeaderCount: {
    fontSize: 13,
    color: TailwindColors.gray['400'],
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemMain: {
    flex: 1,
    gap: 2,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '500',
  },
  itemSub: {
    fontSize: 13,
    color: TailwindColors.gray['400'],
  },
  distanceBadge: {
    backgroundColor: TailwindColors.sky['50'],
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '600',
    color: TailwindColors.sky['600'],
  },
  separator: {
    height: 1,
    backgroundColor: TailwindColors.gray['100'],
    marginLeft: 72,
  },
})
