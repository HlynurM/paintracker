import { describe, it, expect } from 'vitest'
import { createHeadacheEntry } from './headacheService'
import type { WeatherData } from '@/types/weather'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeWeather(overrides: Partial<WeatherData> = {}): WeatherData {
  return {
    timestamp: Date.now(),
    pressure: 1013,
    temperature: 20,
    humidity: 60,
    windSpeed: 10,
    trend: 'stable',
    trendDeltaHpa: 0,
    ...overrides,
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('createHeadacheEntry', () => {
  it('valid input — entry has correct severity, UUID, and timestamp within 100ms', () => {
    const before = Date.now()
    const entry = createHeadacheEntry({ severity: 3, notes: 'some notes', triggers: [] }, null)
    const after = Date.now()

    expect(entry.severity).toBe(3)
    expect(entry.id).toMatch(/^[0-9a-f-]{36}$/)
    expect(entry.timestamp).toBeGreaterThanOrEqual(before)
    expect(entry.timestamp).toBeLessThanOrEqual(after)
  })

  it('severity 0 — throws RangeError', () => {
    // @ts-expect-error testing invalid input
    expect(() => createHeadacheEntry({ severity: 0 }, null)).toThrow(RangeError)
  })

  it('severity 6 — throws RangeError', () => {
    // @ts-expect-error testing invalid input
    expect(() => createHeadacheEntry({ severity: 6 }, null)).toThrow(RangeError)
  })

  it('notes with only whitespace — entry has notes: undefined', () => {
    const entry = createHeadacheEntry({ severity: 2, notes: '   ', triggers: [] }, null)
    expect(entry.notes).toBeUndefined()
  })

  it('currentWeather null — entry has weather: null, no throw', () => {
    const entry = createHeadacheEntry({ severity: 2, notes: 'ok', triggers: [] }, null)
    expect(entry.weather).toBeNull()
  })

  it('returned weather is a copy — not the same reference as input', () => {
    const weather = makeWeather()
    const entry = createHeadacheEntry({ severity: 3, notes: '', triggers: [] }, weather)
    expect(entry.weather).not.toBe(weather)
    expect(entry.weather).toEqual(weather)
  })
})
