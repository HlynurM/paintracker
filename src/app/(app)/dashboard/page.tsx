'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useWeatherStore } from '@/features/weather/store/weatherStore'
import { useDashboardEntries, DashboardRecentList, QuickLogPanel } from '@/features/headache'
import {
  useDashboardInsights,
  usePrediction,
  PressureHeadacheChart,
  TriggerFrequencyBars,
  DashboardRiskRow,
} from '@/features/insights'
import { SEVERITY_TEXT_CLASSES } from '@/lib/severityColors'

export default function DashboardPage() {
  const [showQuickLog, setShowQuickLog] = useState(false)
  const { entries, isLoading: entriesLoading, reload } = useDashboardEntries()
  const { pressureReadings, headacheEvents, triggerFrequency, monthlyStats, isLoading: insightsLoading } =
    useDashboardInsights()
  const { prediction, isLoading: predictionLoading } = usePrediction()
  const { currentWeather, isLoading: weatherLoading } = useWeatherStore()

  const hasEntries = entries.length > 0
  const { thisMonthCount, avgSeverity, delta } = monthlyStats

  const deltaText =
    delta === 0 ? '= vs last month' :
    delta > 0   ? `+${delta} vs last month` :
                  `${delta} vs last month`

  const deltaClass =
    delta === 0 ? 'text-muted-foreground' :
    delta > 0   ? 'text-red-400' :
                  'text-green-400'

  const roundedAvg = avgSeverity != null ? Math.round(avgSeverity) : null
  const avgClass = roundedAvg != null
    ? (SEVERITY_TEXT_CLASSES[roundedAvg] ?? 'text-foreground')
    : 'text-muted-foreground'

  return (
    <div className="flex flex-col gap-6 p-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Dashboard</h1>
        <button
          type="button"
          onClick={() => setShowQuickLog(true)}
          className="rounded-full bg-violet-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-violet-500 transition-colors"
        >
          + Record
        </button>
      </div>

      {/* Compact risk + pressure row */}
      <DashboardRiskRow
        prediction={prediction}
        weather={currentWeather}
        isLoading={predictionLoading || weatherLoading}
      />

      {/* 7-Day Pressure & Headache Events chart — hidden until there is data */}
      {(hasEntries || pressureReadings.length > 0) && (
        <section className="rounded-xl border border-border bg-card p-3 space-y-3">
          <h2 className="text-sm font-semibold">7-Day Pressure &amp; Headache Events</h2>
          <PressureHeadacheChart
            pressureReadings={pressureReadings}
            headacheEvents={headacheEvents}
            isLoading={insightsLoading}
          />
        </section>
      )}

      {/* Recent headaches — above stats */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Recent Headaches</h2>
          {hasEntries && (
            <Link
              href="/history"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              View all →
            </Link>
          )}
        </div>
        <DashboardRecentList entries={entries} isLoading={entriesLoading} />
      </section>

      {/* Inline stats row — no card wrapper */}
      {hasEntries && (
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
      )}

      {/* Top triggers — no card wrapper */}
      {triggerFrequency.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold">Top Triggers</h2>
          <TriggerFrequencyBars triggers={triggerFrequency} />
        </section>
      )}

      {/* Quick log panel */}
      <QuickLogPanel
        open={showQuickLog}
        onOpenChange={setShowQuickLog}
        onSuccess={reload}
      />
    </div>
  )
}
