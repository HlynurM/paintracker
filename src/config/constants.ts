// ─── App Constants ────────────────────────────────────────────────────────────
// All magic numbers live here. If a threshold needs tweaking, change it once.
// Never hardcode numbers inside components or services.

// How often to fetch fresh weather data
export const WEATHER_FETCH_INTERVAL_MS = 15 * 60 * 1000 // 15 minutes

// How long to retain weather readings in local storage
export const WEATHER_RETENTION_DAYS = 90
export const WEATHER_RETENTION_MS = WEATHER_RETENTION_DAYS * 24 * 60 * 60 * 1000

// How far back to look when computing the pressure trend
export const PRESSURE_TREND_WINDOW_MS = 3 * 60 * 60 * 1000 // 3 hours

// Pressure change thresholds (hPa over 3 hours)
// Source: common migraine research — adjust based on your own patterns
export const PRESSURE_THRESHOLDS = {
  STABLE_MAX_DELTA: 2,  // |delta| ≤ 2 hPa → stable / low risk
  MEDIUM_DELTA: 4,      // |delta| ≥ 4 hPa → high risk (between = medium)
} as const

// Human-readable labels for the 1–5 severity scale
export const SEVERITY_LABELS: Record<number, string> = {
  1: 'Mild',
  2: 'Moderate',
  3: 'Significant',
  4: 'Severe',
  5: 'Debilitating',
}
