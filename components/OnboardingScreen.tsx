import { municipalities, MunicipalityName } from '@/constants/municipalities'
import { TailwindColors } from '@/constants/tailwindColors'
import { useGeolocationStore } from '@/store/useGeolocation'
import { useMapFilterStore } from '@/store/useMapFilter'
import { useOnboardingStore } from '@/store/useOnboarding'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6'
import { useEffect, useRef, useState } from 'react'
import {
  Animated,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ThemedText } from './themed-text'

const sorted = [...municipalities].sort((a, b) => a.localeCompare(b, 'sv'))

export default function OnboardingScreen() {
  const { setIsOnboarded } = useOnboardingStore()
  const { getCurrentLocation, loading } = useGeolocationStore()
  const { setMunicipality } = useMapFilterStore()
  const { top, bottom } = useSafeAreaInsets()

  const [finishing, setFinishing] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedMunicipality, setSelectedMunicipality] =
    useState<MunicipalityName | null>(null)
  const [geoSuccess, setGeoSuccess] = useState(false)

  const opacity = useRef(new Animated.Value(1)).current
  const slideY = useRef(new Animated.Value(40)).current

  const canContinue = geoSuccess || selectedMunicipality !== null

  const filtered = search.trim()
    ? sorted.filter((m) => m.toLowerCase().includes(search.toLowerCase()))
    : sorted

  useEffect(() => {
    Animated.spring(slideY, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 6,
      speed: 10,
    }).start()
  }, [])

  const finish = () => {
    if (finishing) return
    setFinishing(true)
    Animated.timing(opacity, {
      toValue: 0,
      duration: 280,
      useNativeDriver: true,
    }).start(() => setIsOnboarded(true))
  }

  const handleAllow = async () => {
    await getCurrentLocation()
    setGeoSuccess(true)
    finish()
  }

  const handleMunicipalitySelect = (m: MunicipalityName) => {
    setSelectedMunicipality(m)
    setMunicipality(m)
  }

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <Animated.View
        style={[
          styles.inner,
          { paddingTop: top + 24, paddingBottom: bottom + 16 },
          { transform: [{ translateY: slideY }] },
        ]}
      >
        {/* GPS option */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              (loading || geoSuccess) && styles.primaryButtonDisabled,
            ]}
            onPress={handleAllow}
            disabled={loading || geoSuccess || finishing}
            activeOpacity={0.85}
          >
            <FontAwesome6
              name={
                geoSuccess
                  ? 'check'
                  : loading
                    ? 'spinner'
                    : 'location-crosshairs'
              }
              size={16}
              color="white"
            />
            <ThemedText style={styles.primaryButtonText}>
              {geoSuccess
                ? 'Plats hämtad'
                : loading
                  ? 'Hämtar plats…'
                  : 'Använd min plats'}
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <ThemedText style={styles.dividerLabel}>eller välj kommun</ThemedText>
          <View style={styles.dividerLine} />
        </View>

        {/* Municipality picker */}
        <View style={styles.pickerContainer}>
          <View style={styles.searchRow}>
            <FontAwesome6
              name="magnifying-glass"
              size={13}
              color={TailwindColors.gray['400']}
            />
            <TextInput
              style={styles.searchInput}
              placeholder={`Sök bland ${municipalities.length} kommuner…`}
              placeholderTextColor={TailwindColors.gray['400']}
              value={search}
              onChangeText={setSearch}
              autoCorrect={false}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')} hitSlop={8}>
                <FontAwesome6
                  name="xmark-circle"
                  size={15}
                  color={TailwindColors.gray['300']}
                />
              </TouchableOpacity>
            )}
          </View>

          <FlatList
            data={filtered}
            keyExtractor={(item) => item}
            keyboardShouldPersistTaps="handled"
            style={styles.list}
            renderItem={({ item }) => {
              const isSelected = item === selectedMunicipality
              return (
                <TouchableOpacity
                  style={[styles.item, isSelected && styles.itemSelected]}
                  onPress={() =>
                    handleMunicipalitySelect(item as MunicipalityName)
                  }
                  activeOpacity={0.6}
                >
                  <ThemedText
                    style={[
                      styles.itemText,
                      isSelected && styles.itemTextSelected,
                    ]}
                  >
                    {item}
                  </ThemedText>
                  {isSelected && (
                    <FontAwesome6
                      name="check"
                      size={13}
                      color={TailwindColors.sky['500']}
                    />
                  )}
                </TouchableOpacity>
              )
            }}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>

        {/* Continue */}
        <TouchableOpacity
          style={[
            styles.continueButton,
            !canContinue && styles.continueButtonDisabled,
          ]}
          onPress={finish}
          disabled={!canContinue || finishing}
          activeOpacity={0.85}
        >
          <ThemedText
            style={[
              styles.continueButtonText,
              !canContinue && styles.continueButtonTextDisabled,
            ]}
          >
            Fortsätt
          </ThemedText>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
    zIndex: 100,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    gap: 16,
  },
  hero: {
    alignItems: 'center',
    gap: 8,
  },
  sunWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: TailwindColors.amber['50'],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  appName: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1,
    color: TailwindColors.slate['900'],
  },
  tagline: {
    fontSize: 15,
    color: TailwindColors.gray['500'],
    textAlign: 'center',
  },
  section: {},
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: TailwindColors.sky['500'],
    borderRadius: 14,
    paddingVertical: 15,
    width: '100%',
    shadowColor: TailwindColors.sky['600'],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: TailwindColors.gray['200'],
  },
  dividerLabel: {
    fontSize: 12,
    color: TailwindColors.gray['400'],
    fontWeight: '500',
  },
  pickerContainer: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: TailwindColors.gray['200'],
    overflow: 'hidden',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 11,
    backgroundColor: TailwindColors.gray['50'],
    borderBottomWidth: 1,
    borderBottomColor: TailwindColors.gray['200'],
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
    color: TailwindColors.slate['800'],
  },
  list: {
    flex: 1,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 44,
  },
  itemSelected: {
    backgroundColor: TailwindColors.sky['50'],
  },
  itemText: {
    fontSize: 15,
    color: TailwindColors.slate['800'],
  },
  itemTextSelected: {
    color: TailwindColors.sky['600'],
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: TailwindColors.gray['100'],
    marginLeft: 16,
  },
  continueButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: TailwindColors.sky['500'],
    borderRadius: 14,
    paddingVertical: 15,
    shadowColor: TailwindColors.sky['600'],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonDisabled: {
    backgroundColor: TailwindColors.gray['200'],
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  continueButtonTextDisabled: {
    color: TailwindColors.gray['400'],
  },
})
