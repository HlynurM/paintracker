'use client'

import type { PredictionResult } from '@/types/prediction'
import { CONFIDENCE_MIN_ENTRIES } from '@/config/constants'
import ConfidenceBar from './ConfidenceBar'

interface PredictionCardProps {
  prediction: PredictionResult | null
  isLoading: boolean
}

const RISK_STYLES = {
  high: {
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    label: 'High Risk',
  },
  medium: {
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    label: 'Medium Risk',
  },
  low: {
    badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    label: 'Low Risk',
  },
  unknown: {
    badge: 'bg-muted text-muted-foreground',
    label: 'Unknown',
  },
}

export default function PredictionCard({ prediction, isLoading }: PredictionCardProps) {
  if (isLoading) {
    return (
      <section className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="h-4 w-32 rounded bg-muted animate-pulse" />
        <div className="h-2 w-full rounded-full bg-muted animate-pulse" />
        <div className="h-4 w-48 rounded bg-muted animate-pulse" />
      </section>
    )
  }

  const isUnknown = prediction === null || prediction.risk === 'unknown'

  if (isUnknown) {
    const score = prediction?.confidence.score ?? 0
    const label = prediction?.confidence.label ?? 'insufficient'
    const entryCount = 0 // shown as progress toward min entries

    return (
      <section className="rounded-xl border border-border bg-card p-4 space-y-3">
        <h2 className="text-sm font-semibold">Headache Risk Prediction</h2>
        <p className="text-sm text-muted-foreground">
          Log more episodes to unlock predictions.
        </p>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">
            Confidence progress ({score}/{CONFIDENCE_MIN_ENTRIES * 2} pts needed)
          </p>
          <ConfidenceBar score={score} label={label} />
        </div>
      </section>
    )
  }

  const styles = RISK_STYLES[prediction.risk]
  const topFactors = prediction.factors.slice(0, 2)

  return (
    <section className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Headache Risk Prediction</h2>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles.badge}`}>
          {styles.label}
        </span>
      </div>

      <ConfidenceBar
        score={prediction.confidence.score}
        label={prediction.confidence.label}
      />

      {topFactors.length > 0 && (
        <ul className="space-y-1">
          {topFactors.map((factor) => (
            <li key={factor.label} className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground shrink-0" />
              {factor.label}
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs text-muted-foreground">
        Next {prediction.horizonHours}h forecast
      </p>
    </section>
  )
}
