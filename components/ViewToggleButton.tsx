import { TailwindColors } from '@/constants/tailwindColors'
import { useViewNavigationStore } from '@/store/useViewNavigation'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const SEGMENTS = [
  { value: 'map', label: 'Karta', icon: 'map' },
  { value: 'list', label: 'Lista', icon: 'list' },
] as const

export default function ViewToggleButton() {
  const { view, setView } = useViewNavigationStore()
  const { top } = useSafeAreaInsets()

  return (
    <View style={[styles.pill, { top: top + 12 }]}>
      {SEGMENTS.map((seg) => {
        const active = view === seg.value
        return (
          <TouchableOpacity
            key={seg.value}
            style={[styles.segment, active && styles.segmentActive]}
            onPress={() => setView(seg.value)}
            activeOpacity={0.8}
          >
            <FontAwesome6
              name={seg.icon}
              size={11}
              color={active ? 'white' : TailwindColors.gray['500']}
            />
            <Text style={[styles.label, active && styles.labelActive]}>
              {seg.label}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  pill: {
    position: 'absolute',
    right: 16,
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 22,
    padding: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  segment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
  },
  segmentActive: {
    backgroundColor: TailwindColors.sky['500'],
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: TailwindColors.gray['500'],
  },
  labelActive: {
    color: 'white',
  },
})
