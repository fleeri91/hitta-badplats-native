import { TailwindColors } from '@/constants/tailwindColors'
import { StyleSheet, Text, View } from 'react-native'
import { Marker } from 'react-native-maps'

type ClusterFeature = {
  id: number
  geometry: {
    coordinates: [number, number] // [longitude, latitude]
  }
  properties: {
    point_count: number
    point_count_abbreviated: string | number
  }
}

type Props = {
  cluster: ClusterFeature
  onPress: () => void
}

export default function ClusterMarker({ cluster, onPress }: Props) {
  const { point_count, point_count_abbreviated } = cluster.properties
  const [longitude, latitude] = cluster.geometry.coordinates

  // Outer ring grows gently with count: 44px base → 60px max
  const outerSize = Math.min(60, 44 + Math.log2(point_count) * 4)
  // Inner pill is fixed height, width stretches for larger numbers
  const digitCount = String(point_count_abbreviated).length
  const pillWidth = Math.max(32, 20 + digitCount * 9)
  const pillHeight = 22

  return (
    <Marker
      coordinate={{ latitude, longitude }}
      onPress={onPress}
      tracksViewChanges={false}
      anchor={{ x: 0.5, y: 0.5 }}
    >
      {/* Outer glow ring */}
      <View
        style={[
          styles.ring,
          { width: outerSize, height: outerSize, borderRadius: outerSize / 2 },
        ]}
      >
        {/* Inner solid circle */}
        <View
          style={[
            styles.core,
            {
              width: outerSize - 10,
              height: outerSize - 10,
              borderRadius: (outerSize - 10) / 2,
            },
          ]}
        >
          {/* Count pill */}
          <View
            style={[
              styles.pill,
              { width: pillWidth, height: pillHeight, borderRadius: pillHeight / 2 },
            ]}
          >
            <Text style={styles.count}>{point_count_abbreviated}</Text>
          </View>
        </View>
      </View>
    </Marker>
  )
}

const styles = StyleSheet.create({
  ring: {
    backgroundColor: 'rgba(14, 165, 233, 0.18)', // sky-500 at 18%
    alignItems: 'center',
    justifyContent: 'center',
  },
  core: {
    backgroundColor: TailwindColors.sky['500'],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: TailwindColors.sky['700'],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 5,
  },
  pill: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  count: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
})
