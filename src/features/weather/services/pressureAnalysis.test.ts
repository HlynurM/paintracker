// ─── Tests: pressureAnalysis ──────────────────────────────────────────────────
// This is the first test file — read it carefully as a pattern for all others.
//
// WHAT WE'RE TESTING:
//   Pure functions in pressureAnalysis.ts. No mocks needed — input/output only.
//
// HOW TO READ THESE TESTS:
//   describe() = a named group of related tests
//   it()       = one specific scenario ("it should do X when Y")
//   expect()   = the assertion — "I expect this value to equal that"
//
// RUN TESTS:
//   pnpm test                    ← watch mode, re-runs on file change
//   pnpm test --run              ← single pass (for CI)

import { describe, it, expect } from 'vitest'
import { computeTrend, computeRisk, findReadingNearTime, calculateDelta } from './pressureAnalysis'
import type { WeatherData } from '@/types/weather'

// Helper to build a minimal WeatherData object for tests.
// We only fill in the fields each test actually needs.
function makeReading(pressure: number, timestamp: number): WeatherData {
  return {
    timestamp,
    pressure,
    temperature: 20,
    humidity: 60,
    windSpeed: 10,
    trend: 'stable',
    trendDeltaHpa: 0,
  }
}

// ─── computeTrend ─────────────────────────────────────────────────────────────
describe('computeTrend', () => {
  it('returns stable when delta is within ±2 hPa', () => {
    expect(computeTrend(0)).toBe('stable')
    expect(computeTrend(1.5)).toBe('stable')
    expect(computeTrend(-1.5)).toBe('stable')
  })

  it('returns rising when delta exceeds +2 hPa', () => {
    expect(computeTrend(3)).toBe('rising')
    expect(computeTrend(10)).toBe('rising')
  })

  it('returns falling when delta is below -2 hPa', () => {
    expect(computeTrend(-3)).toBe('falling')
    expect(computeTrend(-8)).toBe('falling')
  })
})

// ─── computeRisk ─────────────────────────────────────────────────────────────
describe('computeRisk', () => {
  it('returns low risk for small deltas', () => {
    expect(computeRisk(0)).toBe('low')
    expect(computeRisk(1)).toBe('low')
    expect(computeRisk(-1)).toBe('low')
  })

  it('returns medium risk for moderate deltas', () => {
    expect(computeRisk(3)).toBe('medium')
    expect(computeRisk(-3)).toBe('medium')
  })

  it('returns high risk for large deltas', () => {
    expect(computeRisk(5)).toBe('high')
    expect(computeRisk(-7)).toBe('high')
  })
})

// ─── findReadingNearTime ──────────────────────────────────────────────────────
describe('findReadingNearTime', () => {
  it('returns undefined for an empty array', () => {
    expect(findReadingNearTime([], Date.now())).toBeUndefined()
  })

  it('finds the closest reading to a target time', () => {
    const now = 1_700_000_000_000
    const readings = [
      makeReading(1010, now - 4 * 3600_000),  // 4h ago
      makeReading(1012, now - 3 * 3600_000),  // 3h ago ← closest to 3h target
      makeReading(1013, now - 1 * 3600_000),  // 1h ago
    ]
    const target = now - 3 * 3600_000 // exactly 3 hours ago

    const result = findReadingNearTime(readings, target)
    expect(result?.pressure).toBe(1012)
  })
})

// ─── calculateDelta ──────────────────────────────────────────────────────────
describe('calculateDelta', () => {
  it('returns 0 when there are no historical readings', () => {
    const current = makeReading(1015, Date.now())
    expect(calculateDelta(current, [], 3 * 3600_000)).toBe(0)
  })

  it('calculates the pressure drop correctly', () => {
    const now = 1_700_000_000_000
    const current = makeReading(1008, now)
    const readings = [makeReading(1013, now - 3 * 3600_000)] // was 1013 three hours ago

    const delta = calculateDelta(current, readings, 3 * 3600_000)
    expect(delta).toBe(-5) // dropped 5 hPa
  })
})
