'use client'

import {
  useInsightsPage,
  useInsightsStore,
  AnalysisWindowPicker,
  CorrelationSummary,
  PressureHeadacheChart,
  TriggerFrequencyBars,
} from '@/features/insights'
import { RemedyFrequencyBars } from '@/features/headache'

export default function InsightsPage() {
  const { analysisWindow, setWindow } = useInsightsStore()
  const {
    correlation,
    confidence,
    pressureReadings,
    headacheEvents,
    triggerFrequency,
    remedyEntries,
    outlierSummary,
    isLoading,
  } = useInsightsPage()

  return (
    <div className="flex flex-col gap-6 p-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-lg font-semibold">Insights</h1>
        <AnalysisWindowPicker window={analysisWindow} onChange={setWindow} />
      </div>

      {/* Correlation summary */}
      {correlation && confidence ? (
        <CorrelationSummary correlation={correlation} confidence={confidence} />
      ) : isLoading ? (
        <div className="h-32 rounded-xl border border-border bg-muted animate-pulse" />
      ) : (
        <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          No data yet. Log headache episodes to see analysis.
        </div>
      )}

      {/* Pressure & headache chart */}
      {(pressureReadings.length > 0 || headacheEvents.length > 0) && (
        <section className="rounded-xl border border-border bg-card p-4 space-y-3">
          <h2 className="text-sm font-semibold">Pressure &amp; Headache Events</h2>
          <PressureHeadacheChart
            pressureReadings={pressureReadings}
            headacheEvents={headacheEvents}
            isLoading={isLoading}
          />
        </section>
      )}

      {/* Trigger frequency */}
      {triggerFrequency.length > 0 && (
        <section className="rounded-xl border border-border bg-card p-4 space-y-3">
          <h2 className="text-sm font-semibold">Top Triggers</h2>
          <TriggerFrequencyBars triggers={triggerFrequency} />
        </section>
      )}

      {/* Remedy frequency */}
      <section className="rounded-xl border border-border bg-card p-4 space-y-3">
        <h2 className="text-sm font-semibold">What Works For You</h2>
        <RemedyFrequencyBars remedies={remedyEntries} />
      </section>

      {/* Outlier note */}
      {outlierSummary && outlierSummary.flaggedCount > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          {outlierSummary.flaggedCount} data point{outlierSummary.flaggedCount !== 1 ? 's' : ''} excluded from analysis as statistical outliers.
        </p>
      )}
    </div>
  )
}
