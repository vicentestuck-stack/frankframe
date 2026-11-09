// Copied from replica/design/theme.ts (the source of truth — see tokens.json
// at the project root's replica/design/). Keep these two files in sync by
// hand until the project adopts a shared-package setup; regenerate here
// whenever tokens.json changes. Tokens only — no raw hex in components.

export const theme = {
  color: {
    bg: "#0B0B0D",
    surface: "#18191C",
    border: "#2B2D31",
    borderInput: "#6B7078",
    text: "#F5F6F7",
    textMuted: "#9AA0A8",
    accent: "#C14F1E",
    onAccent: "#FFFFFF",
    danger: "#FF5A5F",
    success: "#33D69F",
    warning: "#E8A317",
  },
  overlay: {
    scrimTop: "rgba(0,0,0,0.35)",
    scrimBottom: "rgba(0,0,0,0.55)",
    sheetBackdrop: "rgba(0,0,0,0.6)",
  },
  font: {
    sans: "System",
  },
  type: {
    xs: { size: 12, line: 16, weight: "500" as const },
    sm: { size: 14, line: 20, weight: "400" as const },
    base: { size: 16, line: 24, weight: "400" as const },
    lg: { size: 20, line: 28, weight: "600" as const },
    xl: { size: 28, line: 34, weight: "700" as const },
    display: { size: 40, line: 44, weight: "700" as const },
  },
  space: [0, 4, 8, 12, 16, 24, 32, 48, 64] as const,
  radius: { sm: 6, md: 10, lg: 16, pill: 999 },
  motion: { fast: 120, base: 200 },
} as const;

export type Theme = typeof theme;
