import type { HeadacheEntry } from './headache'
import type { TriggerTag } from './headache'

export interface WeatherFactorCorrelation {
  factor: 'temperature' | 'aqi' | 'wind' | 'humidity'
  pearsonR: number
  strength: 'strong' | 'moderate' | 'weak' | 'none'
  direction: 'positive' | 'negative' | 'none'
  sampleSize: number
}

export interface PressureBucket {
  rangeLabel: string
  minDelta: number
  maxDelta: number
  headacheCount: number
  totalDays: number
  headacheRate: number
  relativeRisk: number
}

export interface CorrelationResult {
  pearsonR: number
  pressureBuckets: PressureBucket[]
  baselineHeadacheRate: number
  dominantTrigger: 'drop' | 'rise' | 'both' | 'none'
  triggerWeights: Partial<Record<TriggerTag, number>>
  dataWindowDays: number
  entryCount: number
  entriesWithWeather: number
  factorCorrelations: WeatherFactorCorrelation[]
}

export interface OutlierSummary {
  cleanedEntries: HeadacheEntry[]
  flaggedCount: number
  outlierRate: number
}

export interface ConfidenceBreakdown {
  base: number
  bonuses: Array<{ reason: string; value: number }>
  penalties: Array<{ reason: string; value: number }>
}

export type ConfidenceLabel = 'insufficient' | 'low' | 'moderate' | 'good'

export interface ConfidenceScore {
  score: number
  label: ConfidenceLabel
  breakdown: ConfidenceBreakdown
}

export interface RiskFactor {
  label: string
  contribution: number
}

export type RiskLevel = 'low' | 'medium' | 'high' | 'unknown'

export interface PredictionResult {
  risk: RiskLevel
  riskScore: number
  confidence: ConfidenceScore
  factors: RiskFactor[]
  horizonHours: 24 | 48
}

export interface NotificationPayload {
  title: string
  body: string
}
