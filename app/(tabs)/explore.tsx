import { TailwindColors } from '@/constants/tailwindColors'
import { municipalities, MunicipalityName } from '@/constants/municipalities'
import { useGeolocationStore } from '@/store/useGeolocation'
import { useMapFilterStore } from '@/store/useMapFilter'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6'
import { useState } from 'react'
import {
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'

const sorted = [...municipalities].sort((a, b) => a.localeCompare(b, 'sv'))

export default function ExploreScreen() {
  const { municipality, setMunicipality } = useMapFilterStore()
  const { getCurrentLocation, loading } = useGeolocationStore()
  const { top } = useSafeAreaInsets()

  const [search, setSearch] = useState('')

  const filtered = search.trim()
    ? sorted.filter((m) =>
        m.toLowerCase().startsWith(search.toLowerCase())
      )
    : sorted

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: top + 16 }]}>
        <ThemedText style={styles.title}>Inställningar</ThemedText>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionLabel}>DIN PLATS</ThemedText>
        <View style={styles.locationRow}>
          <View style={styles.locationLeft}>
            <FontAwesome6
              name="location-dot"
              size={16}
              color={TailwindColors.blue['500']}
            />
            <ThemedText style={styles.municipalityText}>
              {municipality ?? 'Ingen plats vald'}
            </ThemedText>
          </View>
          <TouchableOpacity
            style={[styles.refreshButton, loading && styles.refreshButtonDisabled]}
            onPress={getCurrentLocation}
            disabled={loading}
          >
            <FontAwesome6
              name="rotate"
              size={13}
              color={loading ? TailwindColors.gray['400'] : TailwindColors.blue['600']}
            />
            <ThemedText
              style={[
                styles.refreshLabel,
                loading && styles.refreshLabelDisabled,
              ]}
            >
              {loading ? 'Hämtar…' : 'Uppdatera GPS'}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionLabel}>VÄLJ KOMMUN</ThemedText>
        <View style={styles.searchRow}>
          <FontAwesome6
            name="magnifying-glass"
            size={13}
            color={TailwindColors.gray['400']}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Sök kommun…"
            placeholderTextColor={TailwindColors.gray['400']}
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} hitSlop={8}>
              <FontAwesome6
                name="xmark"
                size={13}
                color={TailwindColors.gray['400']}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const isSelected = item === municipality
          return (
            <TouchableOpacity
              style={[styles.item, isSelected && styles.itemSelected]}
              onPress={() => setMunicipality(item as MunicipalityName)}
            >
              <ThemedText
                style={[styles.itemText, isSelected && styles.itemTextSelected]}
              >
                {item}
              </ThemedText>
              {isSelected && (
                <FontAwesome6
                  name="check"
                  size={13}
                  color={TailwindColors.blue['500']}
                />
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
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: TailwindColors.gray['400'],
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: TailwindColors.blue['50'],
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  locationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  municipalityText: {
    fontSize: 16,
    fontWeight: '500',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  refreshButtonDisabled: {
    opacity: 0.5,
  },
  refreshLabel: {
    fontSize: 12,
    color: TailwindColors.blue['600'],
    fontWeight: '500',
  },
  refreshLabelDisabled: {
    color: TailwindColors.gray['400'],
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: TailwindColors.gray['100'],
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  list: {
    paddingBottom: 32,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 13,
  },
  itemSelected: {
    backgroundColor: TailwindColors.blue['50'],
  },
  itemText: {
    fontSize: 15,
  },
  itemTextSelected: {
    color: TailwindColors.blue['600'],
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: TailwindColors.gray['100'],
    marginLeft: 20,
  },
})
