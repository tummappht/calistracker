export const tokens = {
  color: {
    // Base
    background: '#0F1115',
    surface: '#151821',
    card: '#1B1F2A',
    border: '#252B36',

    // Text
    text_primary: '#F1F5F9',
    text_secondary: '#9CA3AF',
    text_muted: '#6B7280',

    // Primary (Ignite)
    primary: '#FF4D30',
    primary_hover: '#FF5C41',
    primary_active: '#E43F24',
    primary_soft: 'rgba(255, 77, 48, 0.12)',

    // Focus tags
    focus: {
      push: '#FF4D30',
      pull: '#22C55E',
      legs: '#F59E0B',
      core: '#3B82F6',
      handstand: '#A855F7',
    },

    // Semantic
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#DC2626',
    danger_soft: 'rgba(220, 38, 38, 0.12)',
    info: '#3B82F6',
  },

  radius: {
    sm: 8,
    md: 12,
    lg: 16,
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },

  font: {
    size: {
      xs: 11,
      sm: 13,
      md: 14,
      lg: 16,
      xl: 18,
      xxl: 22,
      hero: 28,
    },
    weight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      black: 800,
    },
  },

  animation: {
    set_logged: {
      transform: 'scale(1.02)',
      duration: '200ms',
      easing: 'ease-out',
    },
    progress_fill: {
      duration: '300ms',
      easing: 'ease',
    },
    completion_border: {
      duration: '600ms',
      easing: 'ease-in-out',
    },
  },

  touch: {
    min_target: 44,
  },
};

// Helper to get focus color
export function getFocusColor(tag) {
  return tokens.color.focus[tag] || tokens.color.text_muted;
}
