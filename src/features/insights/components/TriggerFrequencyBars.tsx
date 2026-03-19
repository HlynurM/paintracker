'use client'

// ─── TriggerFrequencyBars ─────────────────────────────────────────────────────
// Proportional CSS horizontal bars showing trigger tag frequency.
// No recharts — pure Tailwind.

import type { TriggerCount } from '../services/insightsService'
import type { TriggerTag } from '@/types/headache'

const TAG_COLORS: Record<TriggerTag, string> = {
  'poor-sleep': 'bg-violet-500',
  'dehydration': 'bg-sky-400',
  'screen-time': 'bg-yellow-400',
  'stress': 'bg-amber-500',
  'manual': 'bg-zinc-400',
}

const TAG_LABELS: Record<TriggerTag, string> = {
  'poor-sleep': 'Poor Sleep',
  'dehydration': 'Dehydration',
  'screen-time': 'Screen Time',
  'stress': 'Stress',
  'manual': 'Manual',
}

interface TriggerFrequencyBarsProps {
  triggers: TriggerCount[]
}

export default function TriggerFrequencyBars({ triggers }: TriggerFrequencyBarsProps) {
  if (triggers.length === 0) return null

  const maxCount = triggers[0].count

  return (
    <div className="space-y-2">
      {triggers.map(({ tag, count }) => (
        <div key={tag} className="flex items-center gap-3 text-sm">
          <span className="w-28 shrink-0 text-xs text-muted-foreground">{TAG_LABELS[tag]}</span>
          <div className="flex flex-1 items-center gap-2">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all ${TAG_COLORS[tag]}`}
                style={{ width: `${(count / maxCount) * 100}%` }}
              />
            </div>
            <span className="w-4 text-right text-xs tabular-nums text-muted-foreground">
              {count}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
