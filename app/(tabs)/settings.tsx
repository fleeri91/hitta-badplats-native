import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { municipalities, MunicipalityName } from '@/constants/municipalities'
import { TailwindColors } from '@/constants/tailwindColors'
import { Colors } from '@/constants/theme'
import { useColorScheme } from '@/hooks/use-color-scheme'
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

const sorted = [...municipalities].sort((a, b) => a.localeCompare(b, 'sv'))

const ITEM_HEIGHT = 50

function EmptyState({ query }: { query: string }) {
  return (
    <View style={styles.emptyState}>
      <FontAwesome6
        name="magnifying-glass"
        size={24}
        color={TailwindColors.gray['300']}
      />
      <ThemedText style={styles.emptyTitle}>Inga träffar</ThemedText>
      <ThemedText style={styles.emptySubtitle}>
        Ingen kommun matchar {`"${query}2`}
      </ThemedText>
    </View>
  )
}

export default function ExploreScreen() {
  const { municipality, setMunicipality } = useMapFilterStore()
  const { getCurrentLocation, loading } = useGeolocationStore()
  const { top, bottom } = useSafeAreaInsets()
  const colorScheme = useColorScheme() ?? 'light'

  const [search, setSearch] = useState('')

  const filtered = search.trim()
    ? sorted.filter((m) => m.toLowerCase().includes(search.toLowerCase()))
    : sorted

  const Header = (
    <View>
      {/* Location section */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionLabel}>DIN PLATS</ThemedText>
        <View style={[styles.locationCard, { backgroundColor: Colors[colorScheme].cardBackground }]}>
          <View style={styles.locationMain}>
            <View style={[styles.locationIconWrap, { backgroundColor: Colors[colorScheme].cardIconBackground }]}>
              <FontAwesome6
                name="location-dot"
                size={16}
                color={TailwindColors.sky['500']}
              />
            </View>
            <View>
              <ThemedText style={styles.municipalityName}>
                {municipality ?? 'Ingen plats vald'}
              </ThemedText>
              <ThemedText style={styles.municipalityLabel}>
                Vald kommun
              </ThemedText>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.gpsButton,
              {
                backgroundColor: Colors[colorScheme].surfaceBackground,
                borderColor: Colors[colorScheme].surfaceBorder,
              },
              loading && styles.gpsButtonDisabled,
            ]}
            onPress={getCurrentLocation}
            disabled={loading}
            activeOpacity={0.8}
          >
            <FontAwesome6
              name="rotate"
              size={13}
              color={loading ? Colors[colorScheme].inputPlaceholder : TailwindColors.sky['600']}
            />
            <ThemedText
              style={[styles.gpsLabel, loading && styles.gpsLabelDisabled]}
            >
              {loading ? 'Hämtar plats…' : 'Använd min plats'}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search section */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionLabel}>VÄLJ KOMMUN</ThemedText>
        <View style={[styles.searchRow, { backgroundColor: Colors[colorScheme].inputBackground }]}>
          <FontAwesome6
            name="magnifying-glass"
            size={13}
            color={Colors[colorScheme].inputPlaceholder}
          />
          <TextInput
            style={[styles.searchInput, { color: Colors[colorScheme].text }]}
            placeholder={`Sök bland ${municipalities.length} kommuner…`}
            placeholderTextColor={Colors[colorScheme].inputPlaceholder}
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
            clearButtonMode="while-editing"
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
      </View>
    </View>
  )

  const Footer = (
    <View style={[styles.footer, { paddingBottom: bottom + 24 }]}>
      <View style={styles.footerDivider} />
      <ThemedText style={styles.footerText}>Hitta badplats · v1.0.0</ThemedText>
      <ThemedText style={styles.footerText}>
        Badplatser: Havs- och vattenmyndigheten
      </ThemedText>
      <ThemedText style={styles.footerText}>Väderdata: SMHI</ThemedText>
    </View>
  )

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingTop: top + 20 }}
        ListHeaderComponent={Header}
        ListFooterComponent={filtered.length > 0 ? Footer : null}
        ListEmptyComponent={
          search.trim() ? <EmptyState query={search} /> : null
        }
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        renderItem={({ item }) => {
          const isSelected = item === municipality
          return (
            <TouchableOpacity
              style={[styles.item, isSelected && styles.itemSelected]}
              onPress={() => setMunicipality(item as MunicipalityName)}
              activeOpacity={0.6}
            >
              <ThemedText
                style={[styles.itemText, isSelected && styles.itemTextSelected]}
              >
                {item}
              </ThemedText>
              {isSelected ? (
                <FontAwesome6
                  name="check"
                  size={13}
                  color={TailwindColors.sky['500']}
                />
              ) : (
                <FontAwesome6
                  name="chevron-right"
                  size={11}
                  color={TailwindColors.gray['300']}
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

  // App header
  appHeader: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  appTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  appTitle: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 14,
    color: TailwindColors.gray['400'],
  },

  // Section
  section: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: TailwindColors.gray['400'],
    letterSpacing: 1,
    marginBottom: 10,
  },

  // Location card
  locationCard: {
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },
  locationMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  locationIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  municipalityName: {
    fontSize: 18,
    fontWeight: '700',
  },
  municipalityLabel: {
    fontSize: 12,
    color: TailwindColors.sky['500'],
    marginTop: 1,
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: 12,
    paddingVertical: 11,
    borderWidth: 1,
  },
  gpsButtonDisabled: {
    opacity: 0.5,
  },
  gpsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: TailwindColors.sky['600'],
  },
  gpsLabelDisabled: {
    color: TailwindColors.gray['400'],
  },

  // Search
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },

  // List items
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: ITEM_HEIGHT,
  },
  itemSelected: {
    backgroundColor: TailwindColors.sky['50'],
  },
  itemText: {
    fontSize: 15,
  },
  itemTextSelected: {
    color: TailwindColors.sky['600'],
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: TailwindColors.gray['100'],
    marginLeft: 20,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: TailwindColors.gray['400'],
  },
  emptySubtitle: {
    fontSize: 14,
    color: TailwindColors.gray['300'],
    textAlign: 'center',
    paddingHorizontal: 32,
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingTop: 32,
    gap: 4,
  },
  footerDivider: {
    width: 40,
    height: 1,
    backgroundColor: TailwindColors.gray['200'],
    marginBottom: 12,
  },
  footerText: {
    fontSize: 12,
    color: TailwindColors.gray['300'],
    textAlign: 'center',
  },
})
