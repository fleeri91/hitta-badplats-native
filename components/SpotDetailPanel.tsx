import { TailwindColors } from '@/constants/tailwindColors'
import { useBathingWaterProfile, useBathingWaters } from '@/lib/queries'
import { useMapFilterStore } from '@/store/useMapFilter'
import { useEffect, useRef } from 'react'
import {
  Animated,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ThemedText } from './themed-text'
import { ThemedView } from './themed-view'

const PANEL_HEIGHT = 260

const qualityColor: Record<number, string> = {
  1: '#22c55e',
  2: TailwindColors.blue['400'],
  3: '#f97316',
  4: TailwindColors.red['500'],
}

function formatSeasonDate(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' })
}

export default function SpotDetailPanel() {
  const { selectedBathingWater, setBathingWater } = useMapFilterStore()
  const { data } = useBathingWaters()
  const { bottom } = useSafeAreaInsets()

  const translateY = useRef(new Animated.Value(PANEL_HEIGHT)).current

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: selectedBathingWater ? 0 : PANEL_HEIGHT,
      useNativeDriver: true,
      bounciness: 4,
    }).start()
  }, [selectedBathingWater])

  const { data: profile } = useBathingWaterProfile(
    selectedBathingWater?.id ?? ''
  )

  const advisory = data?.watersAndAdvisories.find(
    (w) => w.bathingWater.id === selectedBathingWater?.id
  )

  const latestClassification = profile?.lastFourClassifications
    ?.slice()
    .sort((a, b) => b.year - a.year)[0]

  const hasWarnings =
    (advisory?.adviceAgainstBathing?.length ?? 0) > 0 ||
    (advisory?.abnormalSituations?.length ?? 0) > 0 ||
    profile?.algae ||
    profile?.cyano

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY }], paddingBottom: bottom + 16 },
      ]}
    >
      <ThemedView style={styles.panel}>
        <View style={styles.handle} />

        <View style={styles.header}>
          <ThemedText style={styles.name} numberOfLines={1}>
            {selectedBathingWater?.name ?? ''}
          </ThemedText>
          <TouchableOpacity
            onPress={() => setBathingWater(null)}
            hitSlop={12}
          >
            <ThemedText style={styles.closeButton}>✕</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.chips}>
          <View style={styles.chip}>
            <ThemedText style={styles.chipText}>
              {selectedBathingWater?.waterTypeIdText ?? ''}
            </ThemedText>
          </View>
          <View style={styles.chip}>
            <ThemedText style={styles.chipText}>
              {selectedBathingWater?.municipality?.name ?? ''}
            </ThemedText>
          </View>
        </View>

        {profile?.bathingSeason && (
          <ThemedText style={styles.season}>
            Säsong:{' '}
            {formatSeasonDate(profile.bathingSeason.startsAt)}
            {' – '}
            {formatSeasonDate(profile.bathingSeason.endsAt)}
          </ThemedText>
        )}

        {latestClassification && (
          <View style={styles.qualityRow}>
            <View
              style={[
                styles.qualityDot,
                {
                  backgroundColor:
                    qualityColor[latestClassification.qualityClassId] ??
                    TailwindColors.gray['400'],
                },
              ]}
            />
            <ThemedText style={styles.qualityText}>
              {latestClassification.qualityClassIdText}{' '}
              <ThemedText style={styles.qualityYear}>
                ({latestClassification.year})
              </ThemedText>
            </ThemedText>
          </View>
        )}

        {hasWarnings && (
          <View style={styles.warnings}>
            {advisory?.adviceAgainstBathing?.map((a, i) => (
              <ThemedText key={i} style={styles.warningText}>
                ⚠ {a.typeIdText}
              </ThemedText>
            ))}
            {advisory?.abnormalSituations?.map((a, i) => (
              <ThemedText key={i} style={styles.warningText}>
                ⚠ {a.description}
              </ThemedText>
            ))}
            {profile?.algae && (
              <ThemedText style={styles.warningText}>⚠ Alger</ThemedText>
            )}
            {profile?.cyano && (
              <ThemedText style={styles.warningText}>
                ⚠ Cyanobakterier
              </ThemedText>
            )}
          </View>
        )}
      </ThemedView>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  panel: {
    marginHorizontal: 12,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: TailwindColors.gray['300'],
    alignSelf: 'center',
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  closeButton: {
    fontSize: 16,
    color: TailwindColors.gray['400'],
  },
  chips: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  chip: {
    backgroundColor: TailwindColors.blue['50'],
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  chipText: {
    fontSize: 12,
    color: TailwindColors.blue['700'],
  },
  season: {
    fontSize: 13,
    color: TailwindColors.gray['500'],
    marginBottom: 8,
  },
  qualityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  qualityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  qualityText: {
    fontSize: 14,
    fontWeight: '500',
  },
  qualityYear: {
    fontWeight: '400',
    color: TailwindColors.gray['500'],
  },
  warnings: {
    gap: 4,
  },
  warningText: {
    fontSize: 13,
    color: TailwindColors.red['500'],
  },
})
