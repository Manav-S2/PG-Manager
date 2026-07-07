/**
 * Brand palette for AI PG Manager.
 * This app uses a single, fixed light theme (matching the product design)
 * rather than adapting to the system color scheme.
 */

export const Colors = {
  // Brand purple
  primary: '#5B4FE5',
  primaryDark: '#4536C9',
  primaryLight: '#EFEDFC',
  primarySoft: 'rgba(255,255,255,0.16)',
  primarySoftBorder: 'rgba(255,255,255,0.22)',

  // Surfaces
  background: '#F4F4FA',
  card: '#FFFFFF',
  chip: '#F4F3F9',
  border: '#ECEBF3',

  // Text
  textPrimary: '#16181D',
  textSecondary: '#6F7282',
  textMuted: '#9B9DAC',
  link: '#4F4ADE',

  // Status colors
  green: '#1FA45A',
  greenLight: '#E5F6EC',
  red: '#E4484D',
  redLight: '#FCEAEA',
  orange: '#F4A227',
  orangeLight: '#FDF1DC',
  blue: '#3478F6',
  blueLight: '#E8F0FE',
  violet: '#8266F0',
  violetLight: '#F1ECFD',

  white: '#FFFFFF',
} as const;

export type ColorToken = keyof typeof Colors;
