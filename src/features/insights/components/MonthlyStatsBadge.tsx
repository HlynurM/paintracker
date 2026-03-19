'use client'

// ─── MonthlyStatsBadge ────────────────────────────────────────────────────────
// Three stat blocks in a horizontal row: episode count, avg severity, delta.

import { SEVERITY_TEXT_CLASSES } from '@/lib/severityColors'
import type { MonthlyStats } from '../services/insightsService'

interface MonthlyStatsBadgeProps {
  stats: MonthlyStats
}

export default function MonthlyStatsBadge({ stats }: MonthlyStatsBadgeProps) {
  const { thisMonthCount, avgSeverity, delta } = stats

  const deltaText =
    delta === 0
      ? '= vs last month'
      : delta > 0
      ? `+${delta} vs last month`
      : `${delta} vs last month`

  const deltaClass =
    delta === 0
      ? 'text-muted-foreground'
      : delta > 0
      ? 'text-red-400'
      : 'text-green-400'

  const roundedAvg = avgSeverity != null ? Math.round(avgSeverity) : null
  const avgClass =
    roundedAvg != null
      ? (SEVERITY_TEXT_CLASSES[roundedAvg] ?? 'text-foreground')
      : 'text-muted-foreground'

  return (
    <div className="grid grid-cols-3 gap-2 text-center">
      <div className="rounded-lg bg-muted/50 p-3">
        <p className="text-2xl font-bold">{thisMonthCount}</p>
        <p className="text-xs text-muted-foreground">episodes</p>
      </div>
      <div className="rounded-lg bg-muted/50 p-3">
        <p className={`text-2xl font-bold ${avgClass}`}>
          {avgSeverity != null ? avgSeverity.toFixed(1) : '—'}
        </p>
        <p className="text-xs text-muted-foreground">avg severity</p>
      </div>
      <div className="rounded-lg bg-muted/50 p-3">
        <p className={`text-lg font-semibold ${deltaClass}`}>{deltaText}</p>
        <p className="text-xs text-muted-foreground">vs last month</p>
      </div>
    </div>
  )
}
