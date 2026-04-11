import { TailwindColors } from '@/constants/tailwindColors'
import { useViewNavigationStore } from '@/store/useViewNavigation'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6'
import { StyleSheet, TouchableOpacity } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function ViewToggleButton() {
  const { view, setView } = useViewNavigationStore()
  const { top } = useSafeAreaInsets()

  return (
    <TouchableOpacity
      style={[styles.button, { top: top + 12 }]}
      onPress={() => setView(view === 'map' ? 'list' : 'map')}
      activeOpacity={0.8}
    >
      <FontAwesome6
        name={view === 'map' ? 'list' : 'map'}
        size={15}
        color={TailwindColors.blue['600']}
      />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
})
