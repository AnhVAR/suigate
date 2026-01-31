/**
 * SuiGate Typography Scale
 * Using system fonts for best performance
 */
export const typography = {
  // Font families (system defaults)
  fontFamily: {
    sans: 'System', // SF Pro on iOS, Roboto on Android
    mono: 'monospace',
  },

  // Font sizes (in pixels)
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },

  // Font weights
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  // Line heights
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },

  // Text presets for common use cases
  presets: {
    // Headings
    h1: { fontSize: 36, fontWeight: '700' as const, lineHeight: 1.25 },
    h2: { fontSize: 30, fontWeight: '700' as const, lineHeight: 1.25 },
    h3: { fontSize: 24, fontWeight: '600' as const, lineHeight: 1.25 },
    h4: { fontSize: 20, fontWeight: '600' as const, lineHeight: 1.25 },

    // Body
    bodyLarge: { fontSize: 18, fontWeight: '400' as const, lineHeight: 1.5 },
    body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 1.5 },
    bodySmall: { fontSize: 14, fontWeight: '400' as const, lineHeight: 1.5 },

    // Labels
    label: { fontSize: 14, fontWeight: '500' as const, lineHeight: 1.25 },
    labelSmall: { fontSize: 12, fontWeight: '500' as const, lineHeight: 1.25 },

    // Special
    balance: { fontSize: 48, fontWeight: '700' as const, lineHeight: 1.1 },
    balanceSmall: { fontSize: 36, fontWeight: '700' as const, lineHeight: 1.1 },
    caption: { fontSize: 12, fontWeight: '400' as const, lineHeight: 1.5 },
    mono: { fontSize: 14, fontWeight: '400' as const, fontFamily: 'monospace' },
  },
} as const;
