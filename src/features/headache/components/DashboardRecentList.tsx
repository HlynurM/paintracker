'use client'

// ─── DashboardRecentList ──────────────────────────────────────────────────────
// Shows up to 5 recent entries, a loading skeleton, or an onboarding prompt.

import DashboardRecentItem from './DashboardRecentItem'
import type { HeadacheEntry } from '@/types/headache'

interface DashboardRecentListProps {
  entries: HeadacheEntry[]
  isLoading: boolean
}

export default function DashboardRecentList({ entries, isLoading }: DashboardRecentListProps) {
  if (isLoading) {
    return (
      <div className="space-y-2" aria-label="Loading recent entries">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-10 w-full animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Log your first episode to get started.
      </p>
    )
  }

  return (
    <div className="divide-y divide-border">
      {entries.map((entry) => (
        <DashboardRecentItem key={entry.id} entry={entry} />
      ))}
    </div>
  )
}
