import { Platform } from 'react-native'
import { TailwindColors } from './tailwindColors'

export const Colors = {
  light: {
    text: '#0F172A',
    background: '#FFFFFF',
    tint: TailwindColors.sky['500'],
    icon: TailwindColors.gray['400'],
    tabIconDefault: TailwindColors.gray['300'],
    tabIconSelected: TailwindColors.sky['500'],
    inputBackground: TailwindColors.gray['100'],
    inputPlaceholder: TailwindColors.gray['400'],
  },
  dark: {
    text: '#ECEDEE',
    background: '#0F172A',
    tint: '#FFFFFF',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#FFFFFF',
    inputBackground: TailwindColors.slate['800'],
    inputPlaceholder: TailwindColors.slate['500'],
  },
}

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
})
