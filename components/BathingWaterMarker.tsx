// components/BathingWaterMarker.tsx
import { TailwindColors } from '@/constants/tailwindColors'
import { BathingWater } from '@/types/BathingWater/BathingWaters'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6'
import { StyleSheet, View } from 'react-native'
import { Marker } from 'react-native-maps'

type Props = {
  water: BathingWater
  zoomLevel: number
  selected: boolean
  onSelect: (water: BathingWater) => void
}

export default function BathingWaterMarker({
  water,
  zoomLevel,
  selected,
  onSelect,
}: Props) {
  const latitude = parseFloat(water.samplingPointPosition.latitude)
  const longitude = parseFloat(water.samplingPointPosition.longitude)

  if (isNaN(latitude) || isNaN(longitude)) return null

  const size = Math.max(16, Math.min(40, zoomLevel * 2.5))

  /*
  const getColorByWaterType = (waterType: WaterTypeId) => {
    switch (waterType) {
      case 1: // Sea
        return '#007AFF'
      case 3: // Lake
        return '#4ABDAC'
      default:
        return '#FF3B30'
    }
  }
  */

  return (
    <Marker
      coordinate={{ latitude, longitude }}
      onPress={() => onSelect(water)}
    >
      <View style={styles.container}>
        <View
          style={[
            styles.markerOuter,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: 'white',
            },
          ]}
        >
          <View
            style={[
              styles.markerInner,
              {
                width: size * 0.825,
                height: size * 0.825,
                borderRadius: (size * 0.825) / 2,
                backgroundColor: TailwindColors.blue['500'],
              },
            ]}
          >
            <FontAwesome6
              name="person-swimming"
              size={size * 0.5}
              color="white"
            />
          </View>
        </View>
      </View>
    </Marker>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  markerOuter: {
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: 'rgba(0,0,0,0.1)',
    borderWidth: 1,
  },
  markerInner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
})
