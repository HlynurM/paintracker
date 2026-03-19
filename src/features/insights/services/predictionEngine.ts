import type { CorrelationResult, ConfidenceScore, PredictionResult, RiskLevel, RiskFactor } from '@/types/prediction'
import type { WeatherData } from '@/types/weather'
import type { SleepRecord } from '@/types/sleep'
import {
  PREDICTION_WEIGHT_PRESSURE,
  PREDICTION_WEIGHT_SLEEP,
  PREDICTION_WEIGHT_AQI,
  RISK_MEDIUM_THRESHOLD,
  RISK_HIGH_THRESHOLD,
} from '@/config/constants'

interface PredictionParams {
  correlation: CorrelationResult
  confidence: ConfidenceScore
  currentWeather: WeatherData
  lastSleepRecord: SleepRecord | null
}

function riskLevel(score: number): RiskLevel {
  if (score < RISK_MEDIUM_THRESHOLD) return 'low'
  if (score < RISK_HIGH_THRESHOLD) return 'medium'
  return 'high'
}

export function computePrediction(params: PredictionParams): PredictionResult {
  const { correlation, confidence, currentWeather, lastSleepRecord } = params

  if (confidence.label === 'insufficient') {
    return {
      risk: 'unknown',
      riskScore: 0,
      confidence,
      factors: [],
      horizonHours: 24,
    }
  }

  // Pressure risk: find matching bucket
  const delta = currentWeather.trendDeltaHpa
  const matchingBucket = correlation.pressureBuckets.find(
    (b) => delta >= b.minDelta && delta < b.maxDelta
  )
  const relativeRisk = matchingBucket?.relativeRisk ?? 0
  const pressureRisk = Math.min(relativeRisk / 3, 1)

  // Sleep risk: (5 - quality) / 4; null = neutral 0.5
  const sleepRisk = lastSleepRecord ? (5 - lastSleepRecord.quality) / 4 : 0.5

  // AQI risk: min(aqi / 100, 1)
  const aqi = currentWeather.airQualityIndex ?? 0
  const aqiRisk = Math.min(aqi / 100, 1)

  const riskScore =
    PREDICTION_WEIGHT_PRESSURE * pressureRisk +
    PREDICTION_WEIGHT_SLEEP * sleepRisk +
    PREDICTION_WEIGHT_AQI * aqiRisk

  const components: Array<{ label: string; contribution: number }> = [
    { label: 'Pressure change', contribution: PREDICTION_WEIGHT_PRESSURE * pressureRisk },
    { label: 'Sleep quality', contribution: PREDICTION_WEIGHT_SLEEP * sleepRisk },
    { label: 'Air quality', contribution: PREDICTION_WEIGHT_AQI * aqiRisk },
  ]

  const factors: RiskFactor[] = components
    .sort((a, b) => b.contribution - a.contribution)
    .map(({ label, contribution }) => ({ label, contribution }))

  return {
    risk: riskLevel(riskScore),
    riskScore,
    confidence,
    factors,
    horizonHours: 24,
  }
}
