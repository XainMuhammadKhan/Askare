import { Appearance } from 'react-native';

// Askare Clinical Zen Design System - Light & Dark Color Tokens
export const LightColors = {
  // Primary (The Authority)
  primary: '#006977',
  primaryDim: '#005c68',
  primaryContainer: '#8be5f6',
  primaryFixedDim: '#7dd6e8',
  onPrimary: '#edfcff',
  onPrimaryContainer: '#00535e',
  onPrimaryFixed: '#003e47',

  // Secondary (The Calm)
  secondary: '#49636f',
  secondaryDim: '#3d5762',
  secondaryContainer: '#cbe7f5',
  secondaryFixed: '#cbe7f5',
  secondaryFixedDim: '#bdd9e6',
  onSecondary: '#f2faff',
  onSecondaryContainer: '#3c5561',

  // Tertiary (The Human Touch)
  tertiary: '#8a4f40',
  tertiaryDim: '#7c4435',
  tertiaryContainer: '#feb19e',
  tertiaryFixed: '#feb19e',
  tertiaryFixedDim: '#eea491',
  onTertiary: '#fff7f6',
  onTertiaryContainer: '#633022',

  // Surfaces
  background: '#f8fafb',
  surface: '#f8fafb',
  surfaceBright: '#f8fafb',
  surfaceDim: '#d4dbde',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f0f4f6',
  surfaceContainer: '#eaeff0',
  surfaceContainerHigh: '#e3e9eb',
  surfaceContainerHighest: '#dce4e6',
  surfaceVariant: '#dce4e6',
  surfaceTint: '#006977',

  // On-Surface
  onBackground: '#2c3436',
  onSurface: '#2c3436',
  onSurfaceVariant: '#596063',

  // Outline
  outline: '#757c7e',
  outlineVariant: '#acb3b6',

  // Error
  error: '#a83836',
  errorDim: '#67040d',
  errorContainer: '#fa746f',
  onError: '#fff7f6',
  onErrorContainer: '#6e0a12',

  // Inverse
  inverseSurface: '#0b0f10',
  inverseOnSurface: '#9a9d9e',
  inversePrimary: '#8be5f6',

  // Utility
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',

  // Social
  google: '#4285F4',
  facebook: '#1877F2',
};

export type ColorPalette = typeof LightColors;

export const DarkColors: ColorPalette = {
  // Primary
  primary: '#4dd6e9',
  primaryDim: '#008394',
  primaryContainer: '#004e59',
  primaryFixedDim: '#3ab8ca',
  onPrimary: '#00272d',
  onPrimaryContainer: '#a6eeff',
  onPrimaryFixed: '#c4f4ff',

  // Secondary
  secondary: '#b1cbd8',
  secondaryDim: '#8aa4b1',
  secondaryContainer: '#324b56',
  secondaryFixed: '#cbe7f5',
  secondaryFixedDim: '#b1cbd8',
  onSecondary: '#1b343f',
  onSecondaryContainer: '#cde7f5',

  // Tertiary
  tertiary: '#ffb4a1',
  tertiaryDim: '#e29886',
  tertiaryContainer: '#6e382a',
  tertiaryFixed: '#ffdbd2',
  tertiaryFixedDim: '#ffb4a1',
  onTertiary: '#532215',
  onTertiaryContainer: '#ffdbd2',

  // Surfaces
  background: '#0e1416',
  surface: '#0e1416',
  surfaceBright: '#2b3336',
  surfaceDim: '#0b1012',
  surfaceContainerLowest: '#151d20',
  surfaceContainerLow: '#1b2427',
  surfaceContainer: '#212b2f',
  surfaceContainerHigh: '#29353a',
  surfaceContainerHighest: '#334147',
  surfaceVariant: '#29353a',
  surfaceTint: '#4dd6e9',

  // On-Surface
  onBackground: '#e6eef0',
  onSurface: '#e6eef0',
  onSurfaceVariant: '#a3b2b8',

  // Outline
  outline: '#738288',
  outlineVariant: '#3a474c',

  // Error
  error: '#ff897d',
  errorDim: '#93000a',
  errorContainer: '#5c1917',
  onError: '#3b0504',
  onErrorContainer: '#ffdad6',

  // Inverse
  inverseSurface: '#e1e3e4',
  inverseOnSurface: '#191c1d',
  inversePrimary: '#006876',

  // Utility
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',

  // Social
  google: '#4285F4',
  facebook: '#1877F2',
};

/**
 * Mutable active palette reference so existing `Colors.xxx` accesses
 * and `useTheme()` consumers always reflect the active theme mode.
 */
export const Colors: ColorPalette = { ...LightColors };

export type ThemeMode = 'light' | 'dark' | 'system';

export const resolveIsDark = (mode: ThemeMode, systemScheme?: 'light' | 'dark' | null): boolean => {
  if (mode === 'dark') return true;
  if (mode === 'light') return false;
  const scheme = systemScheme !== undefined ? systemScheme : Appearance.getColorScheme();
  return scheme === 'dark';
};

export const applyThemePalette = (isDark: boolean): ColorPalette => {
  const next = isDark ? DarkColors : LightColors;
  Object.assign(Colors, next);
  return next;
};
