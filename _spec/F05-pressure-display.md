# F05 — Pressure Trend Display

> **Status:** planned
> **Branch:** spec/f05-pressure-display
> **Created:** 2026-03-17
> **Depends on:** F02

---

## Purpose

Show the current barometric pressure, trend direction, delta, and risk level in a compact, reusable widget. Gives the user an immediate read on current conditions. Used on the dashboard and anywhere weather context is relevant.

---

## Acceptance Criteria

- [ ] The current barometric pressure is displayed in hPa.
- [ ] A directional arrow shows whether pressure is rising, stable, or falling.
- [ ] The pressure change over the last 3 hours is shown as a signed number (e.g. −3.2 hPa / 3h).
- [ ] The widget is colour-coded by risk level: green for low, amber for medium, red for high.
- [ ] A loading skeleton is shown while weather data is being fetched — no blank content flash.
- [ ] An error message with a retry button appears if the weather fetch fails.
- [ ] If stale data is available when an error occurs, the last known values remain visible alongside the error.

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
- AQI display — field typed but deferred.
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
