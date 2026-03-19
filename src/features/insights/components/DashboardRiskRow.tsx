'use client'

// ─── DashboardRiskRow ─────────────────────────────────────────────────────────
// Compact 2-column row for the dashboard: risk level + pressure at a glance.

import { ArrowUp, ArrowDown, ArrowRight } from 'lucide-react'
import type { PredictionResult } from '@/types/prediction'
import type { WeatherData } from '@/types/weather'

export interface DashboardRiskRowProps {
  prediction: PredictionResult | null
  weather: WeatherData | null
  isLoading: boolean
}

const RISK_STYLES = {
  high:    'text-red-500',
  medium:  'text-amber-500',
  low:     'text-green-500',
  unknown: 'text-muted-foreground',
}

const RISK_LABELS = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  unknown: '—',
}

export default function DashboardRiskRow({ prediction, weather, isLoading }: DashboardRiskRowProps) {
  const dash = <span className="text-muted-foreground">—</span>

  const risk = prediction?.risk ?? 'unknown'
  const confidence = prediction ? Math.round(prediction.confidence.score) : null

  const pressure = weather?.pressure ?? null
  const delta = weather?.trendDeltaHpa ?? null
  const trend = weather?.trend ?? null

  const TrendIcon =
    trend === 'rising'  ? <ArrowUp   className="h-4 w-4 text-amber-500" aria-label="Rising" /> :
    trend === 'falling' ? <ArrowDown className="h-4 w-4 text-blue-500"  aria-label="Falling" /> :
    trend === 'stable'  ? <ArrowRight className="h-4 w-4 text-muted-foreground" aria-label="Stable" /> :
    null

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Risk cell */}
      <div className="rounded-xl border border-border bg-card p-3 space-y-0.5">
        <p className="text-xs text-muted-foreground">Headache risk</p>
        {isLoading && !prediction ? (
          <p className="text-2xl font-bold text-muted-foreground">—</p>
        ) : (
          <>
            <p className={`text-2xl font-bold ${RISK_STYLES[risk]}`}>
              {RISK_LABELS[risk]}
            </p>
            {confidence !== null && (
              <p className="text-xs text-muted-foreground">{confidence}% confidence</p>
            )}
          </>
        )}
      </div>

      {/* Pressure cell */}
      <div className="rounded-xl border border-border bg-card p-3 space-y-0.5">
        <p className="text-xs text-muted-foreground">Pressure</p>
        {isLoading && !weather ? (
          <p className="text-2xl font-bold text-muted-foreground">—</p>
        ) : pressure !== null ? (
          <>
            <p className="flex items-center gap-1 text-2xl font-bold tabular-nums">
              {TrendIcon}
              {pressure.toFixed(0)}
            </p>
            <p className="text-xs text-muted-foreground">
              hPa {delta !== null ? `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}` : ''}
            </p>
          </>
        ) : (
          <p className="text-2xl font-bold">{dash}</p>
        )}
      </div>
    </div>
  )
}
