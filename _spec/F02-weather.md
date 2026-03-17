# F02 — Weather Fetch + Store

> **Status:** done
> **Branch:** —
> **Created:** 2026-03-17
> **Depends on:** F01

---

## Purpose

Fetch live barometric pressure and weather conditions from the Open-Meteo API on mount and on a 15-minute interval. Parse the response into a typed `WeatherData` object, compute the 3-hour pressure delta and trend direction, persist the reading to Dexie, and expose the current reading and risk level via Zustand so any component can consume it without making its own API calls.

---

## Acceptance Criteria

- [ ] Current barometric pressure, temperature, humidity, and wind speed are shown within 15 minutes of app launch.
- [ ] A pressure trend direction (rising, stable, or falling) is displayed based on the change over the last 3 hours.
- [ ] A risk level (low, medium, or high) is shown based on the magnitude of the pressure change.
- [ ] Weather data refreshes automatically every 15 minutes without any user action.
- [ ] If a weather fetch fails, the last known values remain visible and an error indicator is shown.
- [ ] Denying geolocation permission shows a clear error message; the app does not crash.

---

## Functional Requirements

1. Uses the Open-Meteo free API (`https://api.open-meteo.com/v1/forecast`) — no API key required.
2. The following fields are requested and mapped from the API response:
   - `current.surface_pressure` → `pressure` (hPa)
   - `current.temperature_2m` → `temperature` (°C)
   - `current.relative_humidity_2m` → `humidity` (%)
   - `current.wind_speed_10m` → `windSpeed` (km/h)
   - `hourly.surface_pressure` → array used to compute 3-hour delta
3. The URL is built with `past_days: 1`, `forecast_days: 1`, and `timezone: auto` so hourly history is always present.
4. Geolocation (lat/lon) is sourced from the browser `navigator.geolocation` API and passed to `fetchWeather(lat, lon)`.
5. A fetch fires on component mount and repeats every `WEATHER_FETCH_INTERVAL_MS` (15 min, defined in `constants.ts`).
6. `trendDeltaHpa` = current pressure − pressure of the hourly reading closest to `PRESSURE_TREND_WINDOW_MS` (3 hours) ago.
7. `trend` is derived from `trendDeltaHpa` using `PRESSURE_THRESHOLDS.STABLE_MAX_DELTA` (2 hPa):
   - `delta > +2 hPa` → `'rising'`
   - `delta < −2 hPa` → `'falling'`
   - `|delta| ≤ 2 hPa` → `'stable'`
8. `risk` is derived from `|trendDeltaHpa|`:
   - `< 2 hPa` → `'low'`
   - `2–3.9 hPa` → `'medium'`
   - `≥ 4 hPa` (`PRESSURE_THRESHOLDS.MEDIUM_DELTA`) → `'high'`
9. Each successful reading is persisted to `weatherReadings` via `saveWeatherReading`.
10. After each successful fetch, `pruneOldWeatherReadings` is called with a cutoff of `WEATHER_RETENTION_DAYS` (90 days) ago.
11. The Zustand `weatherStore` exposes: `currentWeather`, `risk`, `isLoading`, `error`, `lastFetchedAt`.
12. On a failed fetch, `error` is set in the store and the previous `currentWeather` value is preserved.
13. All pressure thresholds and intervals must be read from `src/config/constants.ts` — no magic numbers in logic files.

---

## Data Contracts

### Open-Meteo API request parameters

| URL parameter | Value | Notes |
|---|---|---|
| `latitude` | `number` | from `navigator.geolocation` |
| `longitude` | `number` | from `navigator.geolocation` |
| `current` | `surface_pressure,temperature_2m,relative_humidity_2m,wind_speed_10m` | exactly these four fields |
| `hourly` | `surface_pressure` | provides 24h history for delta calculation |
| `past_days` | `1` | ensures hourly history is available on first call |
| `forecast_days` | `1` | |
| `timezone` | `auto` | matches user's local time |

### Open-Meteo API response shape (fields we use)

```ts
{
  current: {
    time: string
    surface_pressure: number
    temperature_2m: number
    relative_humidity_2m: number
    wind_speed_10m: number
  }
  hourly: {
    time: string[]
    surface_pressure: number[]
  }
}
```

### `WeatherData` (internal type, stored and exposed)

| Field | Type | Notes |
|---|---|---|
| `timestamp` | `number` | Unix ms — set to `Date.now()` at fetch time |
| `pressure` | `number` | hPa from `current.surface_pressure` |
| `temperature` | `number` | °C |
| `humidity` | `number` | % |
| `windSpeed` | `number` | km/h |
| `trend` | `PressureTrend` | derived |
| `trendDeltaHpa` | `number` | 1 decimal place, can be negative |

### `weatherStore` (Zustand) shape

| Field | Type | Notes |
|---|---|---|
| `currentWeather` | `WeatherData \| null` | null before first successful fetch |
| `risk` | `PressureRisk \| null` | null before first successful fetch |
| `isLoading` | `boolean` | true during fetch |
| `error` | `string \| null` | cleared on successful fetch |
| `lastFetchedAt` | `number \| null` | Unix ms of last successful fetch |

---

## Edge Cases

- No hourly history available (empty readings array) → `calculateDelta` returns `0`; `trend` is `'stable'`; entry is still saved.
- Geolocation permission denied by user → surface a clear error message; do not crash; do not fetch.
- API returns HTTP error (4xx/5xx) → throw from `fetchWeather`; hook sets `error` in store; `currentWeather` is not cleared.
- API response is missing expected fields → current TypeScript assertion will pass; add a runtime field-presence guard to detect and throw early rather than silently using `undefined` as a number.
- A new fetch fires while a prior fetch is still in-flight → cancel or ignore the prior one; do not write duplicate readings within the same interval.
- Device goes offline mid-interval → fetch fails, `error` is set, previous data retained; next interval fetch recovers normally.
- `trendDeltaHpa` rounds to exactly `±2.0` → boundary case: treated as `'medium'` risk and `'rising'`/`'falling'` trend (strictly greater/less than threshold).

---

## Out of Scope

- Air quality index (AQI) — field is typed as optional but API integration is deferred.
- User-configurable fetch interval or location.
- Manual location entry (geolocation only for MVP).
- Push notifications triggered by pressure changes (F07).
- Displaying a historical pressure chart (F05 covers current display only).

---

## Test Guidelines

- **Layer:** unit for pure functions (`pressureAnalysis.ts`); hook test for `useWeather` with mocked fetch
- **Key scenarios — pure functions (`pressureAnalysis.ts`):**
  - `computeTrend(0)` → `'stable'`
  - `computeTrend(2.1)` → `'rising'`, `computeTrend(-2.1)` → `'falling'`
  - `computeTrend(2.0)` → `'stable'` (at-boundary: not strictly greater)
  - `computeRisk` at boundaries: `|1.9|` → `'low'`, `|2.0|` → `'medium'`, `|4.0|` → `'high'`
  - `calculateDelta` with a matching historical reading → correct 1-decimal delta
  - `calculateDelta` with empty readings array → `0`
  - `findReadingNearTime` with multiple readings → returns the closest one by absolute time diff
  - `findReadingNearTime` with empty array → `undefined`
- **Key scenarios — `useWeather` hook:**
  - On mount, fetch is called once; store transitions `isLoading: true → false`
  - Successful fetch populates `currentWeather`, `risk`, and `lastFetchedAt`
  - Failed fetch sets `error`; prior `currentWeather` is preserved (not cleared)
  - Interval fires a second fetch; store updates correctly
- **Do NOT test:**
  - Open-Meteo API internals or response parsing beyond the fields we use
  - Browser `navigator.geolocation` API
  - Dexie internals — repository behavior is tested separately in F01
