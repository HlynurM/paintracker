# F05 — Full Weather Display + Air Quality + Unit Settings + Geolocation

> **Status:** in-progress
> **Branch:** feat/f05-weather-display
> **Created:** 2026-03-17
> **Updated:** 2026-03-18
> **Depends on:** F02

---

## Purpose

Show a full weather card on the dashboard (pressure, temperature, humidity, wind, AQI, dust) and a compact weather badge on the Record Episode page. Includes unit preference settings (°C/°F, km/h/mph), browser geolocation with Reykjavik fallback, and a parallel air quality fetch from Open-Meteo.

---

## Acceptance Criteria

- [ ] Dashboard shows full WeatherCard: pressure + trend, temperature, humidity, wind speed, and AQI/dust row when available.
- [ ] Record Episode page shows compact WeatherBadge above the form.
- [ ] Temperature and wind speed respect unit preference (°C/°F, km/h/mph) from Settings.
- [ ] Settings page has toggle rows for temperature and wind speed units; preferences persist across reload.
- [ ] Browser geolocation is used for first fetch; if denied, Reykjavik fallback is used and a soft "Using approximate location" chip appears.
- [ ] Air quality (european_aqi + dust) is fetched in parallel with weather; AQ failure does not block weather display.
- [ ] Risk badge is colour-coded: green for low, amber for medium, red for high.
- [ ] Loading skeleton shown during initial fetch; no blank content flash.
- [ ] Error message + retry button shown if weather fetch fails; stale data remains visible if available.
- [ ] Nav tab "Log" renamed to "Record"; page heading "Log Headache" renamed to "Record Episode".
- [ ] HeadacheForm field order: Severity → Triggers → Notes.

---

## Functional Requirements

1. Displays current pressure in hPa (e.g. `1013 hPa`).
2. Displays trend direction with a directional icon:
   - `'rising'` → ↑ up arrow
   - `'falling'` → ↓ down arrow
   - `'stable'` → → right arrow
3. Displays `trendDeltaHpa` as a signed value to 1 decimal place (e.g. `−3.2 hPa / 3h`).
4. Color-coded background or badge by risk level:
   - `'low'` → green
   - `'medium'` → amber
   - `'high'` → red
5. While `isLoading` is true, renders a skeleton placeholder — no blank content flash.
6. If `error` is set, shows a short inline error message and a retry trigger (calls back to `useWeather`).
7. Data is consumed exclusively from `weatherStore` via the `useWeather` hook — the component makes no direct API calls.
8. The `PressureCard` component accepts weather data as props so it can be tested in isolation (pass data in, don't read store directly from inside).

---

## Data Contracts

### `PressureCard` props

| Prop | Type | Notes |
|---|---|---|
| `weather` | `WeatherData \| null` | null during initial load |
| `risk` | `PressureRisk \| null` | |
| `isLoading` | `boolean` | |
| `error` | `string \| null` | |
| `onRetry` | `() => void` | called when user taps retry on error state |

### `WeatherWidget` (composed component for pages to use)

Wraps `PressureCard` and reads from `useWeather` internally — pages import `WeatherWidget`, not `PressureCard` directly.

---

## Edge Cases

- `currentWeather` is null before first fetch → render skeleton, not zero values or empty strings.
- `trendDeltaHpa` is exactly `0` → display `0.0 hPa / 3h` with the stable arrow; do not show `−0.0`.
- Pressure is outside typical range (870–1085 hPa) → display the value as-is; no clamping or warning.
- `error` is set and `currentWeather` is non-null (stale data available) → show error message but also show the last known values with a "last updated" timestamp.
- Risk level changes between renders (e.g. from `'low'` to `'high'`) → color updates reactively without page reload.

---

## Out of Scope

- Historical pressure chart or graph.
- Weather condition artwork (requires `weather_code`).
- AQI thresholds as headache risk signals (display only for now).
- Manual pressure override by user.
- Notification or alert triggered by risk level change (F07).

---

## Test Guidelines

- **Layer:** component test (render with controlled props)
- **Key scenarios:**
  - `isLoading: true` → skeleton renders; pressure value and arrows do not appear
  - `isLoading: false`, valid weather → pressure, delta, and trend arrow render with correct values
  - Risk `'low'` → green indicator class applied
  - Risk `'medium'` → amber indicator class applied
  - Risk `'high'` → red indicator class applied
  - `trendDeltaHpa: 0` → stable arrow shown, delta displays `0.0 hPa / 3h`
  - `trendDeltaHpa: -3.2` → falling arrow shown, delta displays `−3.2 hPa / 3h`
  - `error` set, `weather` null → error message rendered, retry button present
  - `error` set, `weather` non-null → error message + stale data both visible
  - Clicking retry calls `onRetry`
- **Do NOT test:**
  - `weatherStore` internals or fetch behavior (tested in F02)
  - Pixel-level color rendering (use class name assertions, not computed styles)
