// ─── Unit Conversion Utilities ────────────────────────────────────────────────
// Pure functions — no React, no side effects.

export function toFahrenheit(celsius: number): number {
  return (celsius * 9) / 5 + 32
}

export function toMph(kmh: number): number {
  return Math.round((kmh * 0.621371) * 10) / 10
}

export function formatTemperature(celsius: number, unit: 'C' | 'F'): string {
  if (unit === 'F') {
    return `${Math.round(toFahrenheit(celsius))}°F`
  }
  return `${Math.round(celsius)}°C`
}

export function formatWindSpeed(kmh: number, unit: 'kmh' | 'mph'): string {
  if (unit === 'mph') {
    return `${toMph(kmh)} mph`
  }
  return `${Math.round(kmh)} km/h`
}
