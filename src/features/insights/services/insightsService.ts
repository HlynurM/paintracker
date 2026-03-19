// ─── Insights Service ─────────────────────────────────────────────────────────
// Pure functions for computing dashboard statistics.
// No React, no side effects — safe to unit test in isolation.

import { startOfMonth, subMonths } from 'date-fns'
import type { HeadacheEntry, TriggerTag } from '@/types/headache'

export interface TriggerCount {
  tag: TriggerTag
  count: number
}

export interface MonthlyStats {
  thisMonthCount: number
  lastMonthCount: number
  avgSeverity: number | null  // null when no entries this month
  delta: number               // positive = more episodes this month vs last
}

/**
 * Count each TriggerTag across all entries, return sorted descending by count.
 */
export function computeTriggerFrequency(entries: HeadacheEntry[]): TriggerCount[] {
  const counts = new Map<TriggerTag, number>()

  for (const entry of entries) {
    for (const tag of entry.triggers ?? []) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1)
    }
  }

  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
}

/**
 * Partition entries into this month vs last month, compute counts and avg severity.
 */
export function computeMonthlyStats(entries: HeadacheEntry[], now: number): MonthlyStats {
  const thisMonthStart = startOfMonth(now).getTime()
  const lastMonthStart = startOfMonth(subMonths(now, 1)).getTime()

  const thisMonth = entries.filter((e) => e.timestamp >= thisMonthStart)
  const lastMonth = entries.filter(
    (e) => e.timestamp >= lastMonthStart && e.timestamp < thisMonthStart
  )

  const thisMonthCount = thisMonth.length
  const lastMonthCount = lastMonth.length

  const avgSeverity =
    thisMonthCount === 0
      ? null
      : Math.round((thisMonth.reduce((sum, e) => sum + e.severity, 0) / thisMonthCount) * 10) / 10

  return {
    thisMonthCount,
    lastMonthCount,
    avgSeverity,
    delta: thisMonthCount - lastMonthCount,
  }
}
