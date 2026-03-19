// ─── Severity Colour Map ───────────────────────────────────────────────────
// Shared across SeveritySlider, PressureHeadacheChart, and any other component
// that needs colour coding by 1–5 severity value.

export const SEVERITY_COLORS: Record<number, string> = {
  1: '#4ade80',
  2: '#a3e635',
  3: '#fbbf24',
  4: '#f97316',
  5: '#ef4444',
}

export const SEVERITY_TEXT_CLASSES: Record<number, string> = {
  1: 'text-green-400',
  2: 'text-lime-400',
  3: 'text-amber-400',
  4: 'text-orange-400',
  5: 'text-red-400',
}
