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

// Default unit preferences
export const DEFAULT_TEMPERATURE_UNIT = 'C' as const
export const DEFAULT_WIND_SPEED_UNIT = 'kmh' as const

// Fallback coordinates when geolocation is denied (Reykjavik / Kópavogur, Iceland)
export const FALLBACK_LAT = 64.13
export const FALLBACK_LON = -21.93

// Minimum milliseconds between two headache log submissions (debounce guard)
export const DEBOUNCE_GUARD_MS = 1000

// Human-readable labels for the 1–5 severity scale
export const SEVERITY_LABELS: Record<number, string> = {
  1: 'Mild',
  2: 'Moderate',
  3: 'Significant',
  4: 'Severe',
  5: 'Debilitating',
}

// Analysis window options for the insights page
export const ANALYSIS_WINDOWS = ['30d', '60d', '90d', 'all'] as const
export type AnalysisWindow = (typeof ANALYSIS_WINDOWS)[number]

// Confidence model thresholds
export const CONFIDENCE_MIN_ENTRIES = 10
export const CONFIDENCE_CAP = 85
export const CONFIDENCE_STALE_DAYS = 30

// Prediction factor weights (must sum to 1.0)
export const PREDICTION_WEIGHT_PRESSURE = 0.60
export const PREDICTION_WEIGHT_SLEEP = 0.25
export const PREDICTION_WEIGHT_AQI = 0.15

// Risk score thresholds
export const RISK_MEDIUM_THRESHOLD = 0.30
export const RISK_HIGH_THRESHOLD = 0.60

// Outlier detection
export const IQR_MULTIPLIER = 1.5
export const DUPLICATE_GUARD_MS = 2 * 60 * 60 * 1000 // 2 hours
