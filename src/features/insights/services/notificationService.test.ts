import { describe, it, expect } from 'vitest'
import { formatNotificationPayload } from './notificationService'
import type { PredictionResult, ConfidenceScore } from '@/types/prediction'

function makeConfidence(score: number, label: ConfidenceScore['label'] = 'good'): ConfidenceScore {
  return { score, label, breakdown: { base: score, bonuses: [], penalties: [] } }
}

function makePrediction(
  risk: PredictionResult['risk'],
  confidenceScore = 60
): PredictionResult {
  return {
    risk,
    riskScore: risk === 'high' ? 0.8 : risk === 'medium' ? 0.45 : 0.1,
    confidence: makeConfidence(confidenceScore),
    factors: [{ label: 'Pressure change', contribution: 0.5 }],
    horizonHours: 24,
  }
}

describe('formatNotificationPayload', () => {
  it('returns null when risk is unknown', () => {
    const result = formatNotificationPayload(makePrediction('unknown'), {
      alertThreshold: 'medium',
      minConfidenceToAlert: 40,
    })
    expect(result).toBeNull()
  })

  it('returns null when confidence is below minimum', () => {
    const result = formatNotificationPayload(makePrediction('high', 30), {
      alertThreshold: 'medium',
      minConfidenceToAlert: 40,
    })
    expect(result).toBeNull()
  })

  it('returns null for low risk when threshold is medium', () => {
    const result = formatNotificationPayload(makePrediction('low', 60), {
      alertThreshold: 'medium',
      minConfidenceToAlert: 40,
    })
    expect(result).toBeNull()
  })

  it('returns null for medium risk when threshold is high', () => {
    const result = formatNotificationPayload(makePrediction('medium', 60), {
      alertThreshold: 'high',
      minConfidenceToAlert: 40,
    })
    expect(result).toBeNull()
  })

  it('returns payload for high risk when threshold is medium', () => {
    const result = formatNotificationPayload(makePrediction('high', 60), {
      alertThreshold: 'medium',
      minConfidenceToAlert: 40,
    })
    expect(result).not.toBeNull()
    expect(result!.title).toBe('PainTracker — Risk Alert')
    expect(result!.body).toContain('High')
    expect(result!.body).toContain('24h')
  })

  it('returns payload for medium risk when threshold is medium', () => {
    const result = formatNotificationPayload(makePrediction('medium', 60), {
      alertThreshold: 'medium',
      minConfidenceToAlert: 40,
    })
    expect(result).not.toBeNull()
    expect(result!.body).toContain('Medium')
  })

  it('returns payload for high risk when threshold is high', () => {
    const result = formatNotificationPayload(makePrediction('high', 60), {
      alertThreshold: 'high',
      minConfidenceToAlert: 40,
    })
    expect(result).not.toBeNull()
  })

  it('includes top factor in body', () => {
    const result = formatNotificationPayload(makePrediction('high', 60), {
      alertThreshold: 'medium',
      minConfidenceToAlert: 40,
    })
    expect(result!.body).toContain('Pressure change')
  })
})
