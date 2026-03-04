// ─── App Constants ────────────────────────────────────────────────────────────
// All magic numbers live here. If a threshold needs tweaking, change it once.
// Never hardcode numbers inside components or services.

// How often to fetch fresh weather data (ms)
export const WEATHER_FETCH_INTERVAL_MS = 15 * 60 * 1000 // 15 minutes

// Pressure change over 3 hours that signals a risk level
// Source: common migraine research — adjust based on your own patterns
export const PRESSURE_THRESHOLDS = {
  STABLE_MAX_DELTA: 2,   // ±2 hPa → stable (low risk)
  MEDIUM_DELTA: 4,       // ±4 hPa → moderate change (medium risk)
  // anything above MEDIUM_DELTA → high risk
} as const

// How far back to look for pressure trend (ms)
export const PRESSURE_TREND_WINDOW_MS = 3 * 60 * 60 * 1000 // 3 hours

// How long to keep weather readings in local DB before pruning
export const WEATHER_RETENTION_DAYS = 90

// Severity labels for display
export const SEVERITY_LABELS: Record<number, string> = {
  1: 'Barely noticeable',
  2: 'Very mild',
  3: 'Mild',
  4: 'Mild–moderate',
  5: 'Moderate',
  6: 'Moderate–severe',
  7: 'Severe',
  8: 'Very severe',
  9: 'Debilitating',
  10: 'Worst possible',
}
