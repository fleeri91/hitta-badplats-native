import { TailwindColors } from '@/constants/tailwindColors'
import {
  useBathingWaterProfile,
  useBathingWaters,
  useSmhiForecast,
} from '@/lib/queries'
import { useMapFilterStore } from '@/store/useMapFilter'
import { SmhiForecast } from '@/types/Smhi/SmhiForecast'
import { useEffect, useRef } from 'react'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6'
import {
  Animated,
  Linking,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ThemedText } from './themed-text'
import { ThemedView } from './themed-view'

const PANEL_OFFSET = 500

const qualityColor: Record<number, string> = {
  1: '#22c55e',
  2: TailwindColors.blue['400'],
  3: '#f97316',
  4: TailwindColors.red['500'],
}

const weatherEmoji: Record<number, string> = {
  1: '☀️',
  2: '🌤️',
  3: '⛅',
  4: '🌥️',
  5: '☁️',
  6: '☁️',
  7: '🌫️',
  8: '🌦️',
  9: '🌦️',
  10: '🌧️',
  11: '⛈️',
  12: '🌨️',
  13: '🌨️',
  14: '🌨️',
  15: '🌨️',
  16: '❄️',
  17: '❄️',
  18: '🌧️',
  19: '🌧️',
  20: '🌧️',
  21: '⛈️',
  22: '🌨️',
  23: '🌨️',
  24: '🌨️',
  25: '❄️',
  26: '❄️',
  27: '❄️',
}

const TRANSPORT_MODES = [
  { label: 'Bil', icon: 'car-side' as const, iosDirFlg: 'd', googleMode: 'd' },
  { label: 'Gång', icon: 'person-walking' as const, iosDirFlg: 'w', googleMode: 'w' },
  { label: 'Cykel', icon: 'person-biking' as const, iosDirFlg: 'b', googleMode: 'b' },
  { label: 'Buss', icon: 'bus' as const, iosDirFlg: 'r', googleMode: 'r' },
]

function openDirections(lat: number, lon: number, iosDirFlg: string, googleMode: string) {
  const url = Platform.select({
    ios: `maps://maps.apple.com/?daddr=${lat},${lon}&dirflg=${iosDirFlg}`,
    default: `https://maps.google.com/maps?daddr=${lat},${lon}&dirflg=${googleMode}`,
  })
  if (url) Linking.openURL(url)
}

function getCurrentForecast(timeSeries: SmhiForecast['timeSeries']) {
  const now = Date.now()
  return (
    timeSeries.find((ts) => new Date(ts.time).getTime() >= now) ??
    timeSeries[0] ??
    null
  )
}

function formatSeasonDate(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' })
}

export default function SpotDetailPanel() {
  const { selectedBathingWater, setBathingWater } = useMapFilterStore()
  const { data } = useBathingWaters()
  const { bottom } = useSafeAreaInsets()

  const translateY = useRef(new Animated.Value(PANEL_OFFSET)).current

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: selectedBathingWater ? 0 : PANEL_OFFSET,
      useNativeDriver: true,
      bounciness: 4,
    }).start()
  }, [selectedBathingWater])

  const spotLat = selectedBathingWater
    ? parseFloat(selectedBathingWater.samplingPointPosition.latitude)
    : null
  const spotLon = selectedBathingWater
    ? parseFloat(selectedBathingWater.samplingPointPosition.longitude)
    : null

  const { data: profile } = useBathingWaterProfile(
    selectedBathingWater?.id ?? ''
  )
  const { data: forecast } = useSmhiForecast(spotLat, spotLon)

  const advisory = data?.watersAndAdvisories.find(
    (w) => w.bathingWater.id === selectedBathingWater?.id
  )

  const latestClassification = profile?.lastFourClassifications
    ?.slice()
    .sort((a, b) => b.year - a.year)[0]

  const currentForecast = forecast
    ? getCurrentForecast(forecast.timeSeries)
    : null

  const temperature = currentForecast?.data.air_temperature ?? null
  const windSpeed = currentForecast?.data.wind_speed ?? null
  const symbol = currentForecast?.data.symbol_code ?? null

  const hasWarnings =
    (advisory?.adviceAgainstBathing?.length ?? 0) > 0 ||
    (advisory?.abnormalSituations?.length ?? 0) > 0 ||
    profile?.algae ||
    profile?.cyano

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY }], paddingBottom: bottom + 12 },
      ]}
    >
      <ThemedView style={styles.panel}>
        <View style={styles.handle} />

        <View style={styles.header}>
          <ThemedText style={styles.name} numberOfLines={1}>
            {selectedBathingWater?.name ?? ''}
          </ThemedText>
          <TouchableOpacity onPress={() => setBathingWater(null)} hitSlop={12}>
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

        <View style={styles.infoRow}>
          <View style={styles.infoBlock}>
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
                  <ThemedText style={styles.subtle}>
                    ({latestClassification.year})
                  </ThemedText>
                </ThemedText>
              </View>
            )}

            {profile?.bathingSeason && (
              <ThemedText style={styles.subtle}>
                Säsong {formatSeasonDate(profile.bathingSeason.startsAt)}
                {' – '}
                {formatSeasonDate(profile.bathingSeason.endsAt)}
              </ThemedText>
            )}
          </View>

          {temperature !== null && (
            <View style={styles.weatherBlock}>
              <ThemedText style={styles.weatherEmoji}>
                {symbol !== null ? (weatherEmoji[symbol] ?? '🌡️') : '🌡️'}
              </ThemedText>
              <ThemedText style={styles.weatherTemp}>
                {Math.round(temperature)}°
              </ThemedText>
              {windSpeed !== null && (
                <ThemedText style={styles.subtle}>
                  {windSpeed.toFixed(1)} m/s
                </ThemedText>
              )}
            </View>
          )}
        </View>

        {spotLat !== null && spotLon !== null && (
          <View style={styles.directionsRow}>
            {TRANSPORT_MODES.map((mode) => (
              <TouchableOpacity
                key={mode.label}
                style={styles.directionButton}
                onPress={() =>
                  openDirections(spotLat, spotLon, mode.iosDirFlg, mode.googleMode)
                }
              >
                <FontAwesome6
                  name={mode.icon}
                  size={18}
                  color={TailwindColors.blue['600']}
                />
                <ThemedText style={styles.directionLabel}>
                  {mode.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
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
    marginBottom: 12,
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  infoBlock: {
    flex: 1,
    gap: 6,
  },
  qualityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
  subtle: {
    fontSize: 13,
    color: TailwindColors.gray['500'],
  },
  weatherBlock: {
    alignItems: 'center',
    paddingLeft: 12,
  },
  weatherEmoji: {
    fontSize: 28,
  },
  weatherTemp: {
    fontSize: 22,
    fontWeight: '600',
  },
  directionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  directionButton: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    backgroundColor: TailwindColors.blue['50'],
    borderRadius: 12,
    paddingVertical: 10,
  },
  directionLabel: {
    fontSize: 11,
    color: TailwindColors.blue['600'],
  },
  warnings: {
    gap: 4,
    borderTopWidth: 1,
    borderTopColor: TailwindColors.red['100'],
    paddingTop: 10,
  },
  warningText: {
    fontSize: 13,
    color: TailwindColors.red['500'],
  },
})
