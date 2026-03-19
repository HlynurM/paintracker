'use client'

import type { CorrelationResult, ConfidenceScore, WeatherFactorCorrelation } from '@/types/prediction'
import ConfidenceBar from './ConfidenceBar'

interface CorrelationSummaryProps {
  correlation: CorrelationResult
  confidence: ConfidenceScore
}

const FACTOR_LABELS: Record<WeatherFactorCorrelation['factor'], string> = {
  temperature: 'Temperature',
  aqi: 'Air quality',
  wind: 'Wind',
  humidity: 'Humidity',
}

export default function CorrelationSummary({ correlation, confidence }: CorrelationSummaryProps) {
  const pearsonPercent = Math.round(Math.abs(correlation.pearsonR) * 100)
  const direction = correlation.pearsonR >= 0 ? 'positive' : 'negative'

  const dominantLabels: Record<CorrelationResult['dominantTrigger'], string> = {
    drop: 'Pressure drops',
    rise: 'Pressure rises',
    both: 'Drops & rises',
    none: 'No clear pattern',
  }

  const significantFactors = (correlation.factorCorrelations ?? []).filter(
    (f) => f.strength !== 'none'
  )

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-4">
      <h2 className="text-sm font-semibold">Correlation Analysis</h2>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-0.5">
          <p className="text-xs text-muted-foreground">Correlation strength</p>
          <p className="text-2xl font-bold tabular-nums">{pearsonPercent}%</p>
          <p className="text-xs text-muted-foreground capitalize">{direction}</p>
        </div>
        <div className="space-y-0.5">
          <p className="text-xs text-muted-foreground">Main trigger</p>
          <p className="text-sm font-semibold">{dominantLabels[correlation.dominantTrigger]}</p>
          <p className="text-xs text-muted-foreground">
            {correlation.entriesWithWeather} of {correlation.entryCount} entries with weather
          </p>
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">Model confidence</p>
        <ConfidenceBar score={confidence.score} label={confidence.label} />
      </div>

      {significantFactors.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Contributing factors</p>
          <div className="space-y-1.5">
            {significantFactors.map((f) => (
              <div key={f.factor} className="flex items-center gap-2 text-xs">
                <span className="w-24 shrink-0 text-muted-foreground">{FACTOR_LABELS[f.factor]}</span>
                <div className="flex flex-1 items-center gap-1.5">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all ${
                        f.direction === 'positive' ? 'bg-amber-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.abs(f.pearsonR) * 100}%` }}
                    />
                  </div>
                  <span className="w-8 text-right tabular-nums text-muted-foreground">
                    {Math.round(Math.abs(f.pearsonR) * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {correlation.entryCount > 0 && (
        <p className="text-xs text-muted-foreground">
          Data window: {correlation.dataWindowDays} days · {correlation.entryCount} entries
        </p>
      )}
    </div>
  )
}
