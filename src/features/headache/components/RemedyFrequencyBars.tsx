'use client'

import type { RemedyEntry, RemedyTag } from '@/types/remedy'

const TAG_LABELS: Record<RemedyTag, string> = {
  'rest': 'Rest',
  'sleep': 'Sleep',
  'medication-otc': 'OTC Med',
  'medication-prescription': 'Rx Med',
  'hydration': 'Hydration',
  'cold-compress': 'Cold Compress',
  'dark-room': 'Dark Room',
  'caffeine': 'Caffeine',
  'walk': 'Walk',
  'stretching': 'Stretching',
  'other': 'Other',
}

const TAG_COLORS: Record<RemedyTag, string> = {
  'rest': 'bg-violet-500',
  'sleep': 'bg-indigo-500',
  'medication-otc': 'bg-blue-500',
  'medication-prescription': 'bg-sky-500',
  'hydration': 'bg-cyan-500',
  'cold-compress': 'bg-teal-500',
  'dark-room': 'bg-slate-500',
  'caffeine': 'bg-amber-500',
  'walk': 'bg-green-500',
  'stretching': 'bg-lime-500',
  'other': 'bg-zinc-400',
}

interface RemedyFrequencyBarsProps {
  remedies: RemedyEntry[]
}

interface TagStats {
  tag: RemedyTag
  count: number
  avgEffectiveness: number
}

function computeTagStats(remedies: RemedyEntry[]): TagStats[] {
  const counts = new Map<RemedyTag, number>()
  const ratingTotals = new Map<RemedyTag, number>()

  for (const remedy of remedies) {
    for (const tag of remedy.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1)
      ratingTotals.set(tag, (ratingTotals.get(tag) ?? 0) + remedy.effectivenessRating)
    }
  }

  return Array.from(counts.entries())
    .map(([tag, count]) => ({
      tag,
      count,
      avgEffectiveness: Math.round((ratingTotals.get(tag)! / count) * 10) / 10,
    }))
    .sort((a, b) => b.count - a.count)
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <span className="text-xs text-amber-400" aria-label={`${rating} stars average`}>
      {'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}
    </span>
  )
}

export default function RemedyFrequencyBars({ remedies }: RemedyFrequencyBarsProps) {
  if (remedies.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-2">No remedies logged yet.</p>
    )
  }

  const stats = computeTagStats(remedies)
  if (stats.length === 0) return null

  const maxCount = stats[0].count

  return (
    <div className="space-y-2">
      {stats.map(({ tag, count, avgEffectiveness }) => (
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
          <StarDisplay rating={avgEffectiveness} />
        </div>
      ))}
    </div>
  )
}
