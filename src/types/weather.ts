// ─── Weather Types ────────────────────────────────────────────────────────────
// WeatherData is the live reading fetched from the API.
// WeatherSnapshot is the frozen copy attached to a headache entry.

// Direction of pressure change over the last 3 hours.
export type PressureTrend = 'rising' | 'falling' | 'stable'

// Risk level derived from how fast pressure is changing.
// Used for color coding and alert thresholds.
export type PressureRisk = 'low' | 'medium' | 'high'

// A single weather reading — fetched from Open-Meteo or stored in Dexie.
export interface WeatherData {
  timestamp: number         // Unix ms when this reading was taken
  pressure: number          // hPa (hectopascal) — e.g. 1013
  temperature: number       // °C
  humidity: number          // % relative humidity
  windSpeed: number         // km/h
  airQualityIndex?: number  // AQI — added later when we integrate AQ API
  trend: PressureTrend
  trendDeltaHpa: number     // pressure now minus pressure 3h ago (can be negative)
}

// A frozen snapshot stored inside HeadacheEntry.
// `Readonly<T>` tells TypeScript nothing inside can be mutated after creation.
export type WeatherSnapshot = Readonly<WeatherData>
