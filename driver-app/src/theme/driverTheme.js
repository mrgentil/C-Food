/** Charte visuelle C-Food Driver */

// Couleurs de base qui ne changent pas selon le thème
export const CORE_COLORS = {
  primary: '#0EA5E9',
  primaryDark: '#0284C7',
  accent: '#22C55E',
  accentSoft: '#4ADE80',
  error: '#EF4444',
  errorSoft: '#FEF2F2',
  warning: '#F59E0B',
  warningSoft: '#FEF3C7',
};

// Thème Clair
export const lightTheme = {
  ...CORE_COLORS,
  background: '#F4F7FE',
  surface: '#FFFFFF',
  surfaceSecondary: '#F8FAFC',
  text: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',
  border: '#E2E8F0',
  glow: 'rgba(14, 165, 233, 0.2)',
  shadow: '#000000',
  navBar: '#FFFFFF',
};

// Thème Sombre
export const darkTheme = {
  ...CORE_COLORS,
  background: '#0B1220', // Fond global très sombre
  surface: '#1E293B', // Fond des cartes
  surfaceSecondary: '#0F172A', // Champs de texte, inputs
  text: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textMuted: '#64748B',
  textInverse: '#0F172A', // Pour les textes sur des boutons clairs (non utilisé souvent ici)
  border: '#334155',
  glow: 'rgba(14, 165, 233, 0.4)',
  shadow: '#000000',
  navBar: '#0F172A',
};

export const DRIVER_GRADIENTS = {
  splash: ['#0B1220', '#0F3460', '#0369A1'],
  slide1: ['#0B1220', '#0C4A6E', '#0EA5E9'],
  slide2: ['#0B1220', '#134E4A', '#14B8A6'],
  slide3: ['#0B1220', '#312E81', '#6366F1'],
  loginLight: ['#F0F9FF', '#E0F2FE', '#FFFFFF'],
  loginDark: ['#0B1220', '#0F172A', '#1E293B'],
};

// Par défaut, pour la compatibilité avec l'ancien code avant refonte complète
export const DRIVER_COLORS = lightTheme;
