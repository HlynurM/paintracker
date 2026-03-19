import { describe, it, expect } from 'vitest'
import { computePrediction } from './predictionEngine'
import type { CorrelationResult, ConfidenceScore } from '@/types/prediction'
import type { WeatherData } from '@/types/weather'
import type { SleepRecord } from '@/types/sleep'

function makeCorrelation(overrides: Partial<CorrelationResult> = {}): CorrelationResult {
  return {
    pearsonR: 0.5,
    pressureBuckets: [
      { rangeLabel: '< −6 hPa', minDelta: -Infinity, maxDelta: -6, headacheCount: 5, totalDays: 10, headacheRate: 0.5, relativeRisk: 3 },
      { rangeLabel: '−6 to −3', minDelta: -6, maxDelta: -3, headacheCount: 2, totalDays: 10, headacheRate: 0.2, relativeRisk: 1.2 },
      { rangeLabel: '−3 to 0', minDelta: -3, maxDelta: 0, headacheCount: 1, totalDays: 10, headacheRate: 0.1, relativeRisk: 0.6 },
      { rangeLabel: '0 to +3', minDelta: 0, maxDelta: 3, headacheCount: 1, totalDays: 10, headacheRate: 0.1, relativeRisk: 0.6 },
      { rangeLabel: '+3 to +6', minDelta: 3, maxDelta: 6, headacheCount: 1, totalDays: 10, headacheRate: 0.1, relativeRisk: 0.6 },
      { rangeLabel: '> +6', minDelta: 6, maxDelta: Infinity, headacheCount: 0, totalDays: 10, headacheRate: 0, relativeRisk: 0 },
    ],
    baselineHeadacheRate: 0.22,
    dominantTrigger: 'drop',
    triggerWeights: {},
    dataWindowDays: 90,
    entryCount: 20,
    entriesWithWeather: 15,
    factorCorrelations: [],
    ...overrides,
  }
}

function makeConfidence(label: ConfidenceScore['label'], score = 60): ConfidenceScore {
  return {
    score,
    label,
    breakdown: { base: score, bonuses: [], penalties: [] },
  }
}

function makeWeather(trendDeltaHpa: number, aqi?: number): WeatherData {
  return {
    timestamp: Date.now(),
    pressure: 1010,
    temperature: 15,
    humidity: 60,
    windSpeed: 10,
    trend: trendDeltaHpa < 0 ? 'falling' : 'rising',
    trendDeltaHpa,
    airQualityIndex: aqi,
  }
}

function makeSleep(quality: 1 | 2 | 3 | 4 | 5): SleepRecord {
  return {
    id: 'sleep-1',
    date: '2024-01-01',
    durationMinutes: 480,
    quality,
    source: 'manual',
  }
}

describe('computePrediction', () => {
  it('returns unknown risk when confidence is insufficient', () => {
    const result = computePrediction({
      correlation: makeCorrelation(),
      confidence: makeConfidence('insufficient', 0),
      currentWeather: makeWeather(-8),
      lastSleepRecord: null,
    })
    expect(result.risk).toBe('unknown')
    expect(result.riskScore).toBe(0)
    expect(result.factors).toHaveLength(0)
  })

  it('returns high risk for large pressure drop with poor sleep', () => {
    // relativeRisk 3 → pressureRisk = min(3/3, 1) = 1
    // sleep quality 1 → sleepRisk = (5-1)/4 = 1
    // aqi 0 → aqiRisk = 0
    // score = 0.6*1 + 0.25*1 + 0.15*0 = 0.85
    const result = computePrediction({
      correlation: makeCorrelation(),
      confidence: makeConfidence('good', 70),
      currentWeather: makeWeather(-8), // matches first bucket with relativeRisk=3
      lastSleepRecord: makeSleep(1),
    })
    expect(result.risk).toBe('high')
    expect(result.riskScore).toBeGreaterThan(0.6)
  })

  it('returns low risk for stable pressure with good sleep', () => {
    // first bucket has relativeRisk 3 → but let's use a stable delta
    // match bucket [-3, 0) with relativeRisk 0.6 → pressureRisk = 0.6/3 = 0.2
    // sleep quality 5 → sleepRisk = 0/4 = 0
    // aqi 0 → aqiRisk = 0
    // score = 0.6*0.2 + 0.25*0 + 0.15*0 = 0.12
    const result = computePrediction({
      correlation: makeCorrelation(),
      confidence: makeConfidence('good', 70),
      currentWeather: makeWeather(-1), // matches [-3, 0) bucket
      lastSleepRecord: makeSleep(5),
    })
    expect(result.risk).toBe('low')
  })

  it('uses neutral sleep risk (0.5) when no sleep record', () => {
    const withSleep = computePrediction({
      correlation: makeCorrelation(),
      confidence: makeConfidence('good', 70),
      currentWeather: makeWeather(-1),
      lastSleepRecord: makeSleep(3), // quality 3 → (5-3)/4 = 0.5
    })
    const noSleep = computePrediction({
      correlation: makeCorrelation(),
      confidence: makeConfidence('good', 70),
      currentWeather: makeWeather(-1),
      lastSleepRecord: null, // neutral = 0.5
    })
    expect(noSleep.riskScore).toBeCloseTo(withSleep.riskScore, 5)
  })

  it('accounts for AQI in risk score', () => {
    const noAqi = computePrediction({
      correlation: makeCorrelation(),
      confidence: makeConfidence('good', 70),
      currentWeather: makeWeather(-1, 0),
      lastSleepRecord: null,
    })
    const highAqi = computePrediction({
      correlation: makeCorrelation(),
      confidence: makeConfidence('good', 70),
      currentWeather: makeWeather(-1, 100),
      lastSleepRecord: null,
    })
    expect(highAqi.riskScore).toBeGreaterThan(noAqi.riskScore)
  })

  it('factors are sorted descending by contribution', () => {
    const result = computePrediction({
      correlation: makeCorrelation(),
      confidence: makeConfidence('good', 70),
      currentWeather: makeWeather(-8, 0),
      lastSleepRecord: makeSleep(5),
    })
    for (let i = 1; i < result.factors.length; i++) {
      expect(result.factors[i - 1].contribution).toBeGreaterThanOrEqual(
        result.factors[i].contribution
      )
    }
  })

  it('horizonHours is always 24', () => {
    const result = computePrediction({
      correlation: makeCorrelation(),
      confidence: makeConfidence('good', 70),
      currentWeather: makeWeather(-1),
      lastSleepRecord: null,
    })
    expect(result.horizonHours).toBe(24)
  })
})
