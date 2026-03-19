'use client'

// ─── HeadacheListItem ─────────────────────────────────────────────────────────
// Renders a single headache entry row with edit/delete actions.

import { format } from 'date-fns'
import { SEVERITY_LABELS } from '@/config/constants'
import type { HeadacheEntry } from '@/types/headache'
import type { RemedyEntry } from '@/types/remedy'

const TAG_LABELS: Record<string, string> = {
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

interface HeadacheListItemProps {
  entry: HeadacheEntry
  onEdit: (entry: HeadacheEntry) => void
  onDelete: (id: string) => void
  remedies?: RemedyEntry[]
  onRemedyLog?: (id: string) => void
}

export default function HeadacheListItem({
  entry,
  onEdit,
  onDelete,
  remedies,
  onRemedyLog,
}: HeadacheListItemProps) {
  const date = new Date(entry.timestamp)
  const hasRemedies = remedies && remedies.length > 0

  const remedyTagsPreview = hasRemedies
    ? [...new Set(remedies.flatMap((r) => r.tags))]
        .slice(0, 3)
        .map((t) => TAG_LABELS[t] ?? t)
        .join(', ')
    : null

  return (
    <div
      data-timestamp={entry.timestamp}
      className="flex items-start justify-between rounded-lg border border-border bg-card p-4 gap-3"
    >
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold">{format(date, 'PPP')}</span>
          <span className="text-xs text-muted-foreground">{format(date, 'p')}</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium">
            {entry.severity} — {SEVERITY_LABELS[entry.severity]}
          </span>
          {entry.weather?.pressure != null && (
            <span className="text-xs text-muted-foreground">
              {entry.weather.pressure.toFixed(1)} hPa
            </span>
          )}
        </div>
        {entry.notes && (
          <p className="text-sm text-muted-foreground line-clamp-2">{entry.notes}</p>
        )}
        {hasRemedies ? (
          <p className="text-xs text-green-600 dark:text-green-400 font-medium">
            ✓ {remedyTagsPreview}
          </p>
        ) : (
          onRemedyLog && (
            <button
              type="button"
              onClick={() => onRemedyLog(entry.id)}
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
            >
              + What helped?
            </button>
          )
        )}
      </div>
      <div className="flex gap-2 shrink-0">
        <button
          type="button"
          onClick={() => onEdit(entry)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(entry.id)}
          className="text-xs text-destructive hover:opacity-70 transition-opacity"
        >
          Delete
        </button>
      </div>
    </div>
  )
}
