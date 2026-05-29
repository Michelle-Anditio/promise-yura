/**
 * Promise Yura Theme & Style Tokens
 * ADHD-friendly visual tokens.
 * Centralizing custom colors, font pairings, sizes, and elevation styles.
 */

export const theme = {
  colors: {
    // Lavender (Primary / Voice / AI interaction)
    primary: {
      main: "#55489c",
      container: "#b2a4ff",
      onPrimary: "#ffffff",
      onContainer: "#433588",
      fixed: "#e5deff",
      gradient: "from-[#55489c] to-[#b2a4ff]",
    },
    // Soft Pink (Secondary / Celebratory rewards)
    secondary: {
      main: "#6e4957",
      container: "#fccadc",
      onContainer: "#795261",
      onSecondary: "#ffffff",
      fixed: "#ffd9e5",
      gradient: "from-[#6e4957] to-[#fccadc]",
    },
    // Light Calm Blue (Tertiary / Alert details / Peaceful state)
    tertiary: {
      main: "#2e5768",
      container: "#88b7cc",
      onContainer: "#14495a",
      fixed: "#bbe9ff",
      fixedDim: "#9ecde3",
      gradient: "from-[#2e5768] to-[#88b7cc]",
    },
    // Soft Clean Lavender-white (ADHD-friendly eye strain reduction with crisp typography)
    neutral: {
      background: "#fcfbff",
      text: "#191624",
      textMuted: "#494554",
      cardBackground: "#ffffff",
      creamLight: "#faf9ff",
      creamMedium: "#f3f0fa",
      creamDark: "#e5e0f5",
      outline: "#79718a",
      outlineVariant: "#c5bfe0",
    },
    status: {
      error: "#ba1a1a",
      errorContainer: "#ffdad6",
      onError: "#ffffff",
    }
  },
  typography: {
    fontFamily: "'Nunito', sans-serif",
    display: "font-display font-semibold text-[36px] leading-[44px] tracking-tight",
    headline: "font-display font-medium text-[28px] leading-[36px]",
    headlineMobile: "font-display font-medium text-[24px] leading-[32px]",
    title: "font-display font-semibold text-[19px] leading-[26px]",
    bodyLarge: "font-sans font-normal text-[18px] leading-[26px]",
    bodyMedium: "font-sans font-normal text-[16px] leading-[24px]",
    label: "font-sans font-semibold text-[14px] leading-[20px] tracking-[0.01em]",
    caption: "font-sans text-[12px] leading-[16px]"
  },
  borderRadius: {
    sm: "rounded-[8px]",
    DEFAULT: "rounded-[16px]",
    md: "rounded-[24px]",
    lg: "rounded-[32px]",
    xl: "rounded-[48px]",
    full: "rounded-full"
  },
  spacing: {
    base: "8px",
    gap: "16px",
    marginLarge: "32px",
    paddingContainer: "24px"
  },
  shadows: {
    soft: "shadow-[0_20px_40px_-10px_rgba(95,82,166,0.08)]",
    cardHover: "hover:translate-y-[-2px] hover:shadow-[0_24px_48px_-8px_rgba(95,82,166,0.12)] active:translate-y-[1px] active:shadow-[0_12px_24px_-4px_rgba(95,82,166,0.06)] transition-all duration-300",
    glow: "shadow-[0_0_30px_rgba(178,164,255,0.25)]",
    intensityNormal: "shadow-[0_4px_12px_rgba(178,164,255,0.15)]",
    intensityAnnoying: "skew-y-1 animate-pulse border-2 border-[#ba1a1a]"
  }
};
