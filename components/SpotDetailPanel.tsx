import { TailwindColors } from '@/constants/tailwindColors'
import {
  useBathingWaterProfile,
  useBathingWaters,
  useSmhiForecast,
} from '@/lib/queries'
import { useMapFilterStore } from '@/store/useMapFilter'
import { SmhiForecast } from '@/types/Smhi/SmhiForecast'
import { WaterTypeId } from '@/types/BathingWater/WaterType'
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
  2: TailwindColors.teal['500'],
  3: TailwindColors.amber['400'],
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
  {
    label: 'Gång',
    icon: 'person-walking' as const,
    iosDirFlg: 'w',
    googleMode: 'w',
  },
  {
    label: 'Cykel',
    icon: 'person-biking' as const,
    iosDirFlg: 'b',
    googleMode: 'b',
  },
  { label: 'Buss', icon: 'bus' as const, iosDirFlg: 'r', googleMode: 'r' },
]

function openDirections(
  lat: number,
  lon: number,
  iosDirFlg: string,
  googleMode: string
) {
  const url = Platform.select({
    ios: `maps://maps.apple.com/?daddr=${lat},${lon}&dirflg=${iosDirFlg}`,
    default: `https://maps.google.com/maps?daddr=${lat},${lon}&dirflg=${googleMode}`,
  })
  if (url) Linking.openURL(url).catch(console.error)
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
  return new Date(iso).toLocaleDateString('sv-SE', {
    day: 'numeric',
    month: 'short',
  })
}

function waterAccentColor(waterTypeId: number): string {
  return waterTypeId === WaterTypeId.HAV
    ? TailwindColors.sky['500']
    : TailwindColors.teal['500']
}

function waterAccentBg(waterTypeId: number): string {
  return waterTypeId === WaterTypeId.HAV
    ? TailwindColors.sky['50']
    : TailwindColors.teal['50']
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

  const accentColor = selectedBathingWater
    ? waterAccentColor(selectedBathingWater.waterTypeId)
    : TailwindColors.sky['500']
  const accentBg = selectedBathingWater
    ? waterAccentBg(selectedBathingWater.waterTypeId)
    : TailwindColors.sky['50']

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY }], paddingBottom: bottom + 12 },
      ]}
    >
      <ThemedView style={styles.panel}>
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <FontAwesome6
              name="person-swimming"
              size={14}
              color={accentColor}
              style={styles.headerIcon}
            />
            <ThemedText style={styles.name} numberOfLines={1}>
              {selectedBathingWater?.name ?? ''}
            </ThemedText>
          </View>
          <TouchableOpacity onPress={() => setBathingWater(null)} hitSlop={12}>
            <FontAwesome6
              name="xmark"
              size={16}
              color={TailwindColors.gray['400']}
            />
          </TouchableOpacity>
        </View>

        {/* Chips */}
        <View style={styles.chips}>
          <View style={[styles.chip, { backgroundColor: accentBg }]}>
            <ThemedText style={[styles.chipText, { color: accentColor }]}>
              {selectedBathingWater?.waterTypeIdText ?? ''}
            </ThemedText>
          </View>
          <View style={styles.chip}>
            <ThemedText style={styles.chipText}>
              {selectedBathingWater?.municipality?.name ?? ''}
            </ThemedText>
          </View>
          {latestClassification && (
            <View
              style={[
                styles.chip,
                {
                  backgroundColor:
                    (qualityColor[latestClassification.qualityClassId] ??
                      TailwindColors.gray['400']) + '20',
                },
              ]}
            >
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
              <ThemedText
                style={[
                  styles.chipText,
                  {
                    color:
                      qualityColor[latestClassification.qualityClassId] ??
                      TailwindColors.gray['500'],
                  },
                ]}
              >
                {latestClassification.qualityClassIdText}
              </ThemedText>
            </View>
          )}
        </View>

        {/* Weather card */}
        {temperature !== null && (
          <View style={[styles.weatherCard, { backgroundColor: accentBg }]}>
            <ThemedText style={styles.weatherEmoji}>
              {symbol !== null ? (weatherEmoji[symbol] ?? '🌡️') : '🌡️'}
            </ThemedText>
            <View style={styles.weatherMain}>
              <ThemedText style={[styles.weatherTemp, { color: accentColor }]}>
                {Math.round(temperature)}°C
              </ThemedText>
              {profile?.bathingSeason && (
                <ThemedText style={styles.weatherSub}>
                  Säsong {formatSeasonDate(profile.bathingSeason.startsAt)}
                  {' – '}
                  {formatSeasonDate(profile.bathingSeason.endsAt)}
                </ThemedText>
              )}
            </View>
            {windSpeed !== null && (
              <View style={styles.windBlock}>
                <FontAwesome6
                  name="wind"
                  size={12}
                  color={TailwindColors.gray['400']}
                />
                <ThemedText style={styles.windText}>
                  {windSpeed.toFixed(1)} m/s
                </ThemedText>
              </View>
            )}
          </View>
        )}

        {/* Directions */}
        {spotLat !== null && spotLon !== null && (
          <View style={styles.directionsRow}>
            {TRANSPORT_MODES.map((mode) => (
              <TouchableOpacity
                key={mode.label}
                style={styles.directionButton}
                onPress={() =>
                  openDirections(
                    spotLat,
                    spotLon,
                    mode.iosDirFlg,
                    mode.googleMode
                  )
                }
                activeOpacity={0.7}
              >
                <FontAwesome6
                  name={mode.icon}
                  size={16}
                  color={TailwindColors.gray['600']}
                />
                <ThemedText style={styles.directionLabel}>
                  {mode.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Warnings */}
        {hasWarnings && (
          <View style={styles.warnings}>
            {advisory?.adviceAgainstBathing?.map((a) => (
              <View key={a.typeIdText} style={styles.warningRow}>
                <FontAwesome6
                  name="triangle-exclamation"
                  size={12}
                  color={TailwindColors.red['500']}
                />
                <ThemedText style={styles.warningText}>
                  {a.typeIdText}
                </ThemedText>
              </View>
            ))}
            {advisory?.abnormalSituations?.map((a) => (
              <View key={a.description} style={styles.warningRow}>
                <FontAwesome6
                  name="triangle-exclamation"
                  size={12}
                  color={TailwindColors.red['500']}
                />
                <ThemedText style={styles.warningText}>
                  {a.description}
                </ThemedText>
              </View>
            ))}
            {profile?.algae && (
              <View style={styles.warningRow}>
                <FontAwesome6
                  name="triangle-exclamation"
                  size={12}
                  color={TailwindColors.amber['500']}
                />
                <ThemedText
                  style={[
                    styles.warningText,
                    { color: TailwindColors.amber['700'] },
                  ]}
                >
                  Alger
                </ThemedText>
              </View>
            )}
            {profile?.cyano && (
              <View style={styles.warningRow}>
                <FontAwesome6
                  name="triangle-exclamation"
                  size={12}
                  color={TailwindColors.amber['500']}
                />
                <ThemedText
                  style={[
                    styles.warningText,
                    { color: TailwindColors.amber['700'] },
                  ]}
                >
                  Cyanobakterier
                </ThemedText>
              </View>
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
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: TailwindColors.gray['200'],
    alignSelf: 'center',
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  headerIcon: {
    marginRight: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  chips: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: TailwindColors.gray['100'],
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
    color: TailwindColors.gray['600'],
  },
  qualityDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  weatherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    gap: 12,
  },
  weatherEmoji: {
    fontSize: 32,
  },
  weatherMain: {
    flex: 1,
    gap: 2,
  },
  weatherTemp: {
    fontSize: 24,
    fontWeight: '700',
  },
  weatherSub: {
    fontSize: 12,
    color: TailwindColors.gray['500'],
  },
  windBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  windText: {
    fontSize: 13,
    color: TailwindColors.gray['500'],
  },
  directionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  directionButton: {
    flex: 1,
    alignItems: 'center',
    gap: 5,
    backgroundColor: TailwindColors.gray['100'],
    borderRadius: 12,
    paddingVertical: 10,
  },
  directionLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: TailwindColors.gray['600'],
  },
  warnings: {
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: TailwindColors.gray['100'],
    paddingTop: 10,
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  warningText: {
    fontSize: 13,
    color: TailwindColors.red['500'],
    flex: 1,
  },
})
