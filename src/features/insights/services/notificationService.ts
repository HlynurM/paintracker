import type { PredictionResult, NotificationPayload } from '@/types/prediction'

interface NotificationSettings {
  alertThreshold: 'medium' | 'high'
  minConfidenceToAlert: number
}

export function formatNotificationPayload(
  prediction: PredictionResult,
  settings: NotificationSettings
): NotificationPayload | null {
  if (prediction.risk === 'unknown') return null

  const { alertThreshold, minConfidenceToAlert } = settings

  if (prediction.confidence.score < minConfidenceToAlert) return null

  if (alertThreshold === 'high' && prediction.risk !== 'high') return null
  if (alertThreshold === 'medium' && prediction.risk === 'low') return null

  const riskLabels: Record<string, string> = {
    high: 'High',
    medium: 'Medium',
  }
  const riskLabel = riskLabels[prediction.risk] ?? prediction.risk

  const topFactor = prediction.factors[0]
  const body = topFactor
    ? `${riskLabel} headache risk in the next ${prediction.horizonHours}h. Top factor: ${topFactor.label}.`
    : `${riskLabel} headache risk in the next ${prediction.horizonHours}h.`

  return {
    title: 'PainTracker — Risk Alert',
    body,
  }
}
