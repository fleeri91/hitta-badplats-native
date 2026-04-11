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
  const outerSize = selected ? size * 1.25 : size
  const innerColor = selected ? TailwindColors.blue['700'] : TailwindColors.blue['500']

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
              width: outerSize,
              height: outerSize,
              borderRadius: outerSize / 2,
              borderColor: selected ? TailwindColors.blue['300'] : 'rgba(0,0,0,0.1)',
              borderWidth: selected ? 2 : 1,
            },
          ]}
        >
          <View
            style={[
              styles.markerInner,
              {
                width: outerSize * 0.825,
                height: outerSize * 0.825,
                borderRadius: (outerSize * 0.825) / 2,
                backgroundColor: innerColor,
              },
            ]}
          >
            <FontAwesome6
              name="person-swimming"
              size={outerSize * 0.5}
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
