export const COLORS = {
  // Brand Logo Triad: Purple (Top Pill), Azure Blue (Left Pill), Sunset Orange (Right Pill)
  // 1. Brand Purple / Violet (Top Pill in logo: #7335BD -> #843EB0)
  primary: '#7C3AED',
  primaryHover: '#6D28D9',
  primaryLight: '#F3E8FF',
  primaryDark: '#5B21B6',

  // 2. Brand Azure Blue (Left Pill in logo: #31A9CB -> #206AC2)
  secondary: '#206AC2',
  secondaryHover: '#1A569D',
  secondaryLight: '#E0F2FE',

  // 3. Brand Sunset Orange (Right Pill in logo: #FAB639 -> #F98231)
  accent: '#F98231',
  accentHover: '#EA580C',
  accentLight: '#FFF7ED',

  // Neutral surfaces
  background: '#F8FAFC', // Slate 50
  card: '#FFFFFF',
  surface: '#F1F5F9', // Slate 100
  border: '#E2E8F0', // Slate 200
  borderLight: '#F8FAFC',

  // Text
  text: '#0F172A', // Slate 900
  textSecondary: '#475569', // Slate 600
  textMuted: '#94A3B8', // Slate 400
  textInverse: '#FFFFFF',

  // Status Colors aligned with Brand Triad
  success: '#10B981', // Emerald 500
  successLight: '#ECFDF5',
  warning: '#F98231', // Brand Orange (Logo Right Pill)
  warningLight: '#FFF7ED',
  info: '#206AC2', // Brand Azure Blue (Logo Left Pill)
  infoLight: '#EFF6FF',
  danger: '#EF4444', // Red 500
  dangerLight: '#FEF2F2',
  purple: '#7C3AED', // Brand Purple (Logo Top Pill)
  purpleLight: '#F3E8FF',

  // Dark Theme support
  darkBg: '#090D16',
  darkCard: '#111827',
  darkBorder: '#1F2937',

  // Logo palette direct references
  logo: {
    purple: '#7C3AED',
    purpleGradient: ['#7335BD', '#843EB0'],
    purpleLight: '#F3E8FF',
    blue: '#206AC2',
    blueGradient: ['#31A9CB', '#206AC2'],
    blueLight: '#E0F2FE',
    orange: '#F98231',
    orangeGradient: ['#FAB639', '#F98231'],
    orangeLight: '#FFF7ED',
  },
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const RADIUS = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};
