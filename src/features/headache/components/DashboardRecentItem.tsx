'use client'

// ─── DashboardRecentItem ──────────────────────────────────────────────────────
// Single row in the dashboard's recent entries list.
// Tapping navigates to /history.

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { SEVERITY_LABELS } from '@/config/constants'
import { SEVERITY_COLORS } from '@/lib/severityColors'
import type { HeadacheEntry } from '@/types/headache'

interface DashboardRecentItemProps {
  entry: HeadacheEntry
}

const TREND_ARROW: Record<string, string> = {
  rising: '↑',
  falling: '↓',
  stable: '→',
}

export default function DashboardRecentItem({ entry }: DashboardRecentItemProps) {
  const timeAgo = formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })
  const severityColor = SEVERITY_COLORS[entry.severity]
  const label = SEVERITY_LABELS[entry.severity]
  const weather = entry.weather

  const pressureText = weather
    ? `${TREND_ARROW[weather.trend] ?? '→'} ${weather.pressure} hPa`
    : '—'

  return (
    <Link
      href="/history"
      className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted/50"
    >
      <span
        className="size-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: severityColor }}
        aria-hidden
      />
      <span className="min-w-0 flex-1 text-sm">
        <span className="font-medium">{label}</span>
        <span className="mx-1.5 text-muted-foreground">·</span>
        <span className="text-muted-foreground">{timeAgo}</span>
      </span>
      <span className="shrink-0 text-xs text-muted-foreground">{pressureText}</span>
    </Link>
  )
}
