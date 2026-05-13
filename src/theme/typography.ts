import { TextStyle } from 'react-native';

export const FontFamily = {
  regular: 'Manrope_400Regular',
  medium: 'Manrope_500Medium',
  semiBold: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold',
  extraBold: 'Manrope_800ExtraBold',
} as const;

export const Typography: Record<string, TextStyle> = {
  // Display - The Statement
  displayLarge: {
    fontFamily: FontFamily.medium,
    fontSize: 56,
    lineHeight: 64,
    letterSpacing: -0.5,
  },
  displayMedium: {
    fontFamily: FontFamily.medium,
    fontSize: 45,
    lineHeight: 52,
  },
  displaySmall: {
    fontFamily: FontFamily.medium,
    fontSize: 36,
    lineHeight: 44,
  },

  // Headline - The Narrative
  headlineLarge: {
    fontFamily: FontFamily.semiBold,
    fontSize: 32,
    lineHeight: 40,
  },
  headlineMedium: {
    fontFamily: FontFamily.semiBold,
    fontSize: 28,
    lineHeight: 36,
  },
  headlineSmall: {
    fontFamily: FontFamily.semiBold,
    fontSize: 24,
    lineHeight: 32,
  },

  // Title - The Anchor
  titleLarge: {
    fontFamily: FontFamily.semiBold,
    fontSize: 22,
    lineHeight: 28,
  },
  titleMedium: {
    fontFamily: FontFamily.semiBold,
    fontSize: 18,
    lineHeight: 24,
  },
  titleSmall: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
  },

  // Body - The Clarity
  bodyLarge: {
    fontFamily: FontFamily.regular,
    fontSize: 16,
    lineHeight: 24,
  },
  bodyMedium: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.15,
  },
  bodySmall: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.3,
  },

  // Label - The Detail
  labelLarge: {
    fontFamily: FontFamily.bold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  labelMedium: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  labelSmall: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
} as const;
