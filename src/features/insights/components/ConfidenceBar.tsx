'use client'

import type { ConfidenceLabel } from '@/types/prediction'

interface ConfidenceBarProps {
  score: number
  label: ConfidenceLabel
}

const LABEL_COLORS: Record<ConfidenceLabel, { bar: string; chip: string; text: string }> = {
  insufficient: {
    bar: 'bg-muted-foreground/40',
    chip: 'bg-muted text-muted-foreground',
    text: 'text-muted-foreground',
  },
  low: {
    bar: 'bg-amber-400',
    chip: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    text: 'text-amber-600',
  },
  moderate: {
    bar: 'bg-blue-500',
    chip: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    text: 'text-blue-600',
  },
  good: {
    bar: 'bg-green-500',
    chip: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    text: 'text-green-600',
  },
}

const LABEL_TEXT: Record<ConfidenceLabel, string> = {
  insufficient: 'Insufficient data',
  low: 'Low confidence',
  moderate: 'Moderate confidence',
  good: 'Good confidence',
}

export default function ConfidenceBar({ score, label }: ConfidenceBarProps) {
  const colors = LABEL_COLORS[label]

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${colors.bar}`}
            style={{ width: `${score}%` }}
            role="progressbar"
            aria-valuenow={score}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
        <span className={`text-xs tabular-nums font-medium ${colors.text}`}>{score}%</span>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors.chip}`}>
          {LABEL_TEXT[label]}
        </span>
      </div>
    </div>
  )
}
