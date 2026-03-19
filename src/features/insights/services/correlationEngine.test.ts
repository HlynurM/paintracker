import { describe, it, expect } from 'vitest'
import { computeCorrelation } from './correlationEngine'
import type { HeadacheEntry } from '@/types/headache'

function makeEntry(
  id: string,
  severity: number,
  trendDeltaHpa: number,
  daysAgo: number = 0
): HeadacheEntry {
  const DAY = 24 * 60 * 60 * 1000
  return {
    id,
    severity: severity as HeadacheEntry['severity'],
    timestamp: Date.now() - daysAgo * DAY,
    weather: {
      timestamp: Date.now() - daysAgo * DAY,
      pressure: 1010,
      temperature: 15,
      humidity: 60,
      windSpeed: 10,
      trend: trendDeltaHpa < 0 ? 'falling' : 'rising',
      trendDeltaHpa,
    },
  }
}

function makeEntryNoWeather(id: string, severity: number, daysAgo: number = 0): HeadacheEntry {
  const DAY = 24 * 60 * 60 * 1000
  return {
    id,
    severity: severity as HeadacheEntry['severity'],
    timestamp: Date.now() - daysAgo * DAY,
    weather: null,
  }
}

describe('computeCorrelation', () => {
  it('returns zero pearsonR for empty entries', () => {
    const result = computeCorrelation([])
    expect(result.pearsonR).toBe(0)
    expect(result.entryCount).toBe(0)
    expect(result.entriesWithWeather).toBe(0)
  })

  it('returns zero pearsonR when fewer than 3 entries have weather', () => {
    const entries = [makeEntry('a', 3, -5, 10), makeEntry('b', 4, -7, 5)]
    const result = computeCorrelation(entries)
    expect(result.pearsonR).toBe(0)
  })

  it('returns zero pearsonR when all severity values are identical', () => {
    const entries = [
      makeEntry('a', 3, -8, 30),
      makeEntry('b', 3, -5, 20),
      makeEntry('c', 3, -2, 10),
    ]
    const result = computeCorrelation(entries)
    expect(result.pearsonR).toBe(0)
  })

  it('computes non-zero pearsonR for dataset with correlation', () => {
    // Higher |delta| → higher severity
    const entries = [
      makeEntry('a', 2, -2, 60),
      makeEntry('b', 3, -4, 50),
      makeEntry('c', 4, -6, 40),
      makeEntry('d', 5, -8, 30),
    ]
    const result = computeCorrelation(entries)
    expect(result.pearsonR).toBeGreaterThan(0.8)
  })

  it('has 6 pressure buckets', () => {
    const result = computeCorrelation([])
    expect(result.pressureBuckets).toHaveLength(6)
  })

  it('places entries in correct buckets', () => {
    const entries = [
      makeEntry('a', 3, -7, 10),   // bucket 0: < -6
      makeEntry('b', 3, -4, 20),   // bucket 1: -6 to -3
      makeEntry('c', 3, 5, 30),    // bucket 4: +3 to +6
    ]
    const result = computeCorrelation(entries)
    expect(result.pressureBuckets[0].headacheCount).toBe(1)
    expect(result.pressureBuckets[1].headacheCount).toBe(1)
    expect(result.pressureBuckets[4].headacheCount).toBe(1)
  })

  it('identifies drop as dominant trigger when drops dominate strongly', () => {
    // 5 drop entries vs 1 neutral entry — drop bucket relativeRisk = 5*6/6 = 5, rise = 0
    const entries = [
      makeEntry('a', 4, -7, 60),
      makeEntry('b', 5, -8, 50),
      makeEntry('c', 4, -7, 40),
      makeEntry('d', 4, -7, 30),
      makeEntry('e', 5, -9, 20),
      makeEntry('f', 2, -1.5, 10), // [-3,0) bucket, not rise
    ]
    const result = computeCorrelation(entries)
    expect(result.dominantTrigger).toBe('drop')
  })

  it('has dominantTrigger none when no bucket exceeds threshold', () => {
    // Uniform distribution across all deltas
    const entries = [
      makeEntry('a', 3, -7, 10),
      makeEntry('b', 3, -4, 20),
      makeEntry('c', 3, -1, 30),
      makeEntry('d', 3, 1, 40),
      makeEntry('e', 3, 4, 50),
      makeEntry('f', 3, 7, 60),
    ]
    const result = computeCorrelation(entries)
    expect(result.dominantTrigger).toBe('none')
  })

  it('counts entries without weather separately', () => {
    const entries = [
      makeEntry('a', 3, -5, 10),
      makeEntryNoWeather('b', 3, 20),
    ]
    const result = computeCorrelation(entries)
    expect(result.entryCount).toBe(2)
    expect(result.entriesWithWeather).toBe(1)
  })

  it('computes trigger weights proportionally', () => {
    const entries: HeadacheEntry[] = [
      { ...makeEntry('a', 3, -5, 10), triggers: ['stress'] },
      { ...makeEntry('b', 3, -4, 20), triggers: ['stress'] },
      { ...makeEntry('c', 3, -3, 30), triggers: ['dehydration'] },
    ]
    const result = computeCorrelation(entries)
    expect(result.triggerWeights['stress']).toBeCloseTo(2 / 3)
    expect(result.triggerWeights['dehydration']).toBeCloseTo(1 / 3)
  })

  it('result has 4 factor entries', () => {
    const entries = [
      makeEntry('a', 2, -2, 60),
      makeEntry('b', 3, -4, 50),
      makeEntry('c', 4, -6, 40),
    ]
    const result = computeCorrelation(entries)
    expect(result.factorCorrelations).toHaveLength(4)
    const factors = result.factorCorrelations.map((f) => f.factor)
    expect(factors).toContain('temperature')
    expect(factors).toContain('aqi')
    expect(factors).toContain('wind')
    expect(factors).toContain('humidity')
  })

  it('all sampleSizes are 0 when no entries', () => {
    const result = computeCorrelation([])
    for (const fc of result.factorCorrelations) {
      expect(fc.sampleSize).toBe(0)
    }
  })

  it('temperature correlation is strong/positive when data has clear linear trend', () => {
    // Higher temperature → higher severity
    const entries: HeadacheEntry[] = [
      { id: 'a', severity: 1, timestamp: Date.now() - 4 * 86400000, weather: { timestamp: 0, pressure: 1010, temperature: 15, humidity: 60, windSpeed: 10, trend: 'stable', trendDeltaHpa: 0 } },
      { id: 'b', severity: 2, timestamp: Date.now() - 3 * 86400000, weather: { timestamp: 0, pressure: 1010, temperature: 20, humidity: 60, windSpeed: 10, trend: 'stable', trendDeltaHpa: 0 } },
      { id: 'c', severity: 3, timestamp: Date.now() - 2 * 86400000, weather: { timestamp: 0, pressure: 1010, temperature: 25, humidity: 60, windSpeed: 10, trend: 'stable', trendDeltaHpa: 0 } },
      { id: 'd', severity: 4, timestamp: Date.now() - 1 * 86400000, weather: { timestamp: 0, pressure: 1010, temperature: 30, humidity: 60, windSpeed: 10, trend: 'stable', trendDeltaHpa: 0 } },
    ]
    const result = computeCorrelation(entries)
    const tempCorr = result.factorCorrelations.find((f) => f.factor === 'temperature')!
    expect(tempCorr.strength).toBe('strong')
    expect(tempCorr.direction).toBe('positive')
  })

  it('sampleSize for AQI is less than total when some entries lack airQualityIndex', () => {
    const entries: HeadacheEntry[] = [
      { id: 'a', severity: 3, timestamp: Date.now() - 3 * 86400000, weather: { timestamp: 0, pressure: 1010, temperature: 20, humidity: 60, windSpeed: 10, trend: 'stable', trendDeltaHpa: 0, airQualityIndex: 50 } },
      { id: 'b', severity: 4, timestamp: Date.now() - 2 * 86400000, weather: { timestamp: 0, pressure: 1010, temperature: 20, humidity: 60, windSpeed: 10, trend: 'stable', trendDeltaHpa: 0 } },
      { id: 'c', severity: 2, timestamp: Date.now() - 1 * 86400000, weather: { timestamp: 0, pressure: 1010, temperature: 20, humidity: 60, windSpeed: 10, trend: 'stable', trendDeltaHpa: 0 } },
    ]
    const result = computeCorrelation(entries)
    const aqiCorr = result.factorCorrelations.find((f) => f.factor === 'aqi')!
    expect(aqiCorr.sampleSize).toBe(1)
    expect(aqiCorr.sampleSize).toBeLessThan(result.entriesWithWeather)
  })
})
