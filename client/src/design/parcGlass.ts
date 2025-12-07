/**
 * parcGlass Design System
 * ======================
 * A premium VisionOS-inspired design language for PARC OS.
 * Built with Jony Ive's design philosophy: purity, depth, and spatial elegance.
 */

export const parcGlass = {
  colors: {
    cosmicNight: {
      50: 'hsla(240, 10%, 98%, 1)',
      100: 'hsla(240, 10%, 92%, 1)',
      200: 'hsla(240, 10%, 85%, 1)',
      300: 'hsla(240, 10%, 70%, 1)',
      400: 'hsla(240, 10%, 50%, 1)',
      500: 'hsla(240, 10%, 25%, 1)',
      600: 'hsla(240, 12%, 16%, 1)',
      700: 'hsla(240, 15%, 12%, 1)',
      800: 'hsla(240, 18%, 8%, 1)',
      900: 'hsla(240, 20%, 5%, 1)',
      950: 'hsla(240, 25%, 3%, 1)',
    },

    mistGlass: {
      light: 'hsla(0, 0%, 100%, 0.08)',
      medium: 'hsla(0, 0%, 100%, 0.12)',
      heavy: 'hsla(0, 0%, 100%, 0.18)',
      solid: 'hsla(0, 0%, 100%, 0.25)',
    },

    electricIndigo: {
      50: 'hsla(239, 84%, 97%, 1)',
      100: 'hsla(238, 90%, 94%, 1)',
      200: 'hsla(239, 94%, 88%, 1)',
      300: 'hsla(240, 94%, 80%, 1)',
      400: 'hsla(243, 94%, 72%, 1)',
      500: 'hsla(245, 90%, 65%, 1)',
      600: 'hsla(248, 80%, 55%, 1)',
      700: 'hsla(250, 72%, 48%, 1)',
      800: 'hsla(252, 68%, 40%, 1)',
      900: 'hsla(254, 64%, 32%, 1)',
      glow: 'hsla(245, 100%, 65%, 0.5)',
      neon: 'hsla(245, 100%, 75%, 0.8)',
    },

    quantumPurple: {
      50: 'hsla(270, 80%, 97%, 1)',
      100: 'hsla(270, 85%, 93%, 1)',
      200: 'hsla(270, 88%, 86%, 1)',
      300: 'hsla(270, 90%, 76%, 1)',
      400: 'hsla(272, 88%, 66%, 1)',
      500: 'hsla(274, 82%, 58%, 1)',
      600: 'hsla(276, 72%, 50%, 1)',
      700: 'hsla(278, 68%, 42%, 1)',
      800: 'hsla(280, 65%, 34%, 1)',
      900: 'hsla(282, 60%, 26%, 1)',
      glow: 'hsla(274, 100%, 60%, 0.4)',
    },

    accent: {
      success: 'hsla(142, 76%, 50%, 1)',
      successGlow: 'hsla(142, 76%, 50%, 0.4)',
      warning: 'hsla(45, 93%, 58%, 1)',
      warningGlow: 'hsla(45, 93%, 58%, 0.4)',
      danger: 'hsla(0, 84%, 60%, 1)',
      dangerGlow: 'hsla(0, 84%, 60%, 0.4)',
      info: 'hsla(199, 89%, 48%, 1)',
      infoGlow: 'hsla(199, 89%, 48%, 0.4)',
    },

    gradients: {
      cosmicFade: 'linear-gradient(180deg, hsla(240, 15%, 12%, 1) 0%, hsla(240, 20%, 6%, 1) 100%)',
      mistOverlay: 'linear-gradient(180deg, hsla(0, 0%, 100%, 0.12) 0%, hsla(0, 0%, 100%, 0.04) 100%)',
      indigoGlow: 'linear-gradient(135deg, hsla(245, 90%, 65%, 0.2) 0%, hsla(274, 82%, 58%, 0.1) 100%)',
      windowChrome: 'linear-gradient(180deg, hsla(0, 0%, 100%, 0.15) 0%, hsla(0, 0%, 100%, 0.02) 100%)',
      neonEdge: 'linear-gradient(90deg, hsla(245, 100%, 65%, 0) 0%, hsla(245, 100%, 65%, 0.6) 50%, hsla(245, 100%, 65%, 0) 100%)',
      dockReflection: 'linear-gradient(180deg, hsla(0, 0%, 100%, 0.08) 0%, hsla(0, 0%, 100%, 0) 100%)',
    },
  },

  blur: {
    none: 'blur(0px)',
    sm: 'blur(4px)',
    md: 'blur(8px)',
    lg: 'blur(16px)',
    xl: 'blur(24px)',
    '2xl': 'blur(40px)',
    '3xl': 'blur(64px)',
    window: 'blur(48px)',
    dock: 'blur(32px)',
    modal: 'blur(60px)',
  },

  shadows: {
    sm: '0 1px 2px hsla(0, 0%, 0%, 0.05)',
    md: '0 4px 6px hsla(0, 0%, 0%, 0.1), 0 2px 4px hsla(0, 0%, 0%, 0.06)',
    lg: '0 10px 15px hsla(0, 0%, 0%, 0.1), 0 4px 6px hsla(0, 0%, 0%, 0.05)',
    xl: '0 20px 25px hsla(0, 0%, 0%, 0.15), 0 8px 10px hsla(0, 0%, 0%, 0.05)',
    '2xl': '0 25px 50px hsla(0, 0%, 0%, 0.25)',

    window: {
      unfocused: [
        '0 4px 8px hsla(0, 0%, 0%, 0.15)',
        '0 8px 16px hsla(0, 0%, 0%, 0.12)',
        '0 16px 32px hsla(0, 0%, 0%, 0.1)',
        'inset 0 1px 0 hsla(0, 0%, 100%, 0.08)',
      ].join(', '),
      focused: [
        '0 8px 16px hsla(0, 0%, 0%, 0.2)',
        '0 16px 32px hsla(0, 0%, 0%, 0.18)',
        '0 32px 64px hsla(0, 0%, 0%, 0.15)',
        '0 0 60px hsla(245, 90%, 65%, 0.25)',
        'inset 0 1px 0 hsla(0, 0%, 100%, 0.12)',
      ].join(', '),
      cinema: [
        '0 16px 32px hsla(0, 0%, 0%, 0.35)',
        '0 32px 64px hsla(0, 0%, 0%, 0.3)',
        '0 64px 128px hsla(0, 0%, 0%, 0.25)',
        '0 0 120px hsla(245, 90%, 65%, 0.5)',
        '0 0 200px hsla(274, 82%, 58%, 0.3)',
        'inset 0 1px 0 hsla(0, 0%, 100%, 0.2)',
      ].join(', '),
    },

    dock: [
      '0 4px 12px hsla(0, 0%, 0%, 0.25)',
      '0 8px 24px hsla(0, 0%, 0%, 0.2)',
      '0 0 1px hsla(0, 0%, 100%, 0.1)',
      'inset 0 1px 0 hsla(0, 0%, 100%, 0.1)',
    ].join(', '),

    dockIcon: {
      idle: 'inset 0 1px 0 hsla(0, 0%, 100%, 0.08)',
      hover: [
        '0 4px 12px hsla(0, 0%, 0%, 0.2)',
        'inset 0 1px 0 hsla(0, 0%, 100%, 0.15)',
      ].join(', '),
      active: [
        '0 0 20px hsla(245, 90%, 65%, 0.5)',
        '0 0 40px hsla(245, 90%, 65%, 0.3)',
        'inset 0 1px 0 hsla(0, 0%, 100%, 0.2)',
      ].join(', '),
    },

    button: {
      idle: 'inset 0 1px 0 hsla(0, 0%, 100%, 0.1)',
      hover: [
        '0 2px 8px hsla(0, 0%, 0%, 0.15)',
        'inset 0 1px 0 hsla(0, 0%, 100%, 0.15)',
      ].join(', '),
      pressed: [
        'inset 0 2px 4px hsla(0, 0%, 0%, 0.2)',
        'inset 0 1px 0 hsla(0, 0%, 0%, 0.1)',
      ].join(', '),
    },

    bloom: {
      indigo: '0 0 60px hsla(245, 90%, 65%, 0.4), 0 0 120px hsla(245, 90%, 65%, 0.2)',
      purple: '0 0 60px hsla(274, 82%, 58%, 0.4), 0 0 120px hsla(274, 82%, 58%, 0.2)',
      mixed: '0 0 80px hsla(245, 90%, 65%, 0.3), 0 0 160px hsla(274, 82%, 58%, 0.15)',
    },

    neonEdge: {
      active: '0 0 1px hsla(245, 100%, 75%, 1), 0 0 4px hsla(245, 100%, 65%, 0.6)',
    },
  },

  borders: {
    thin: '1px solid hsla(0, 0%, 100%, 0.08)',
    default: '1px solid hsla(0, 0%, 100%, 0.12)',
    medium: '1px solid hsla(0, 0%, 100%, 0.18)',
    bright: '1px solid hsla(0, 0%, 100%, 0.25)',
    accent: '1px solid hsla(245, 90%, 65%, 0.4)',
    neon: '1px solid hsla(245, 100%, 75%, 0.6)',
  },

  radius: {
    xs: '4px',
    sm: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '20px',
    '3xl': '24px',
    full: '9999px',
    window: '24px',
    card: '20px',
    button: '12px',
    icon: '14px',
    dock: '22px',
    dockIcon: '16px',
    pill: '9999px',
  },

  spacing: {
    0: '0px',
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
    16: '64px',
    20: '80px',
    24: '96px',
    windowPadding: '16px',
    cardPadding: '20px',
    dockPadding: '12px',
    systemBarHeight: '48px',
    dockHeight: '64px',
  },

  typography: {
    fontFamily: {
      sans: "'SF Pro Display', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      mono: "'SF Mono', 'JetBrains Mono', 'Fira Code', monospace",
    },
    fontSize: {
      xs: '11px',
      sm: '13px',
      base: '15px',
      lg: '17px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px',
      '5xl': '48px',
    },
    fontWeight: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    letterSpacing: {
      tighter: '-0.02em',
      tight: '-0.01em',
      normal: '0',
      wide: '0.02em',
      wider: '0.04em',
      widest: '0.08em',
    },
    lineHeight: {
      none: 1,
      tight: 1.2,
      snug: 1.35,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },
  },

  motion: {
    duration: {
      instant: '50ms',
      fast: '150ms',
      normal: '250ms',
      slow: '350ms',
      slower: '500ms',
      glacial: '700ms',
    },
    easing: {
      linear: 'linear',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
    spring: {
      snappy: { stiffness: 400, damping: 30 },
      gentle: { stiffness: 200, damping: 25 },
      wobbly: { stiffness: 150, damping: 10 },
      stiff: { stiffness: 500, damping: 35 },
      smooth: { stiffness: 300, damping: 28 },
    },
    variants: {
      fadeIn: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      },
      scaleIn: {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 },
      },
      slideUp: {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 20 },
      },
      slideDown: {
        initial: { opacity: 0, y: -20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
      },
      glassCollapse: {
        exit: { opacity: 0, scale: 0.9, filter: 'blur(8px)' },
      },
      windowOpen: {
        initial: { opacity: 0, scale: 0.92, y: 30 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95, filter: 'blur(4px)' },
      },
      dockPop: {
        initial: { opacity: 0, y: 20, scale: 0.9 },
        animate: { opacity: 1, y: 0, scale: 1 },
      },
      hoverLift: {
        scale: 1.08,
        y: -8,
        transition: { type: 'spring', stiffness: 400, damping: 17 },
      },
      tapPress: {
        scale: 0.95,
        transition: { type: 'spring', stiffness: 500, damping: 20 },
      },
    },
  },

  zIndex: {
    base: 0,
    card: 10,
    cardFocused: 20,
    overlay: 30,
    dock: 40,
    systemBar: 50,
    modal: 60,
    tooltip: 70,
    cinema: 100,
    notification: 110,
  },
} as const;

export const glassStyles = {
  panel: {
    background: parcGlass.colors.mistGlass.light,
    backdropFilter: parcGlass.blur.window,
    WebkitBackdropFilter: parcGlass.blur.window,
    border: parcGlass.borders.default,
  },
  panelDark: {
    background: 'hsla(240, 15%, 10%, 0.85)',
    backdropFilter: parcGlass.blur.window,
    WebkitBackdropFilter: parcGlass.blur.window,
    border: parcGlass.borders.thin,
  },
  card: {
    background: 'hsla(240, 15%, 12%, 0.75)',
    backdropFilter: parcGlass.blur.xl,
    WebkitBackdropFilter: parcGlass.blur.xl,
    borderRadius: parcGlass.radius.card,
    border: parcGlass.borders.default,
  },
  button: {
    background: parcGlass.colors.mistGlass.light,
    backdropFilter: parcGlass.blur.md,
    WebkitBackdropFilter: parcGlass.blur.md,
    border: parcGlass.borders.thin,
    borderRadius: parcGlass.radius.button,
  },
  dock: {
    background: 'hsla(240, 15%, 8%, 0.85)',
    backdropFilter: parcGlass.blur.dock,
    WebkitBackdropFilter: parcGlass.blur.dock,
    borderRadius: parcGlass.radius.dock,
    boxShadow: parcGlass.shadows.dock,
    border: parcGlass.borders.medium,
  },
  window: {
    unfocused: {
      background: 'hsla(240, 15%, 10%, 0.7)',
      backdropFilter: parcGlass.blur.xl,
      boxShadow: parcGlass.shadows.window.unfocused,
      borderRadius: parcGlass.radius.window,
      border: parcGlass.borders.thin,
    },
    focused: {
      background: 'hsla(240, 15%, 10%, 0.82)',
      backdropFilter: parcGlass.blur['3xl'],
      boxShadow: parcGlass.shadows.window.focused,
      borderRadius: parcGlass.radius.window,
      border: parcGlass.borders.default,
    },
    cinema: {
      background: 'hsla(240, 15%, 8%, 0.92)',
      backdropFilter: parcGlass.blur.modal,
      boxShadow: parcGlass.shadows.window.cinema,
      borderRadius: parcGlass.radius.window,
      border: parcGlass.borders.bright,
    },
  },
};

export const createGlowEffect = (
  color: string,
  intensity: 'low' | 'medium' | 'high' = 'medium'
) => {
  const intensityMap = { low: 0.2, medium: 0.4, high: 0.6 };
  const spread = { low: 40, medium: 60, high: 100 };
  return `0 0 ${spread[intensity]}px ${color.replace('1)', `${intensityMap[intensity]})`)}`;
};

export const getWindowStyle = (isFocused: boolean, isCinema: boolean) => {
  if (isCinema) return glassStyles.window.cinema;
  if (isFocused) return glassStyles.window.focused;
  return glassStyles.window.unfocused;
};

export type ParcGlassTheme = typeof parcGlass;
export default parcGlass;
