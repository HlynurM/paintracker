'use client'

// ─── PressureHeadacheChart ────────────────────────────────────────────────────
// 7-day pressure line + headache event dots in a recharts ComposedChart.

import { format } from 'date-fns'
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { SEVERITY_COLORS } from '@/lib/severityColors'
import { SEVERITY_LABELS } from '@/config/constants'
import type { WeatherData } from '@/types/weather'
import type { HeadacheEntry } from '@/types/headache'

interface PressureHeadacheChartProps {
  pressureReadings: WeatherData[]
  headacheEvents: HeadacheEntry[]
  isLoading: boolean
}

interface ChartPoint {
  timestamp: number
  pressure: number
}

interface ScatterPoint {
  timestamp: number
  pressure: number
  severity: number
  fill: string
}

function CustomDot(props: {
  cx?: number
  cy?: number
  payload?: ScatterPoint
}) {
  const { cx, cy, payload } = props
  if (cx == null || cy == null || payload == null) return null
  return (
    <circle
      cx={cx}
      cy={cy}
      r={5}
      fill={payload.fill}
      stroke="#1e1e2e"
      strokeWidth={1.5}
    />
  )
}

export default function PressureHeadacheChart({
  pressureReadings,
  headacheEvents,
  isLoading,
}: PressureHeadacheChartProps) {
  if (isLoading) {
    return (
      <div className="h-48 w-full animate-pulse rounded-lg bg-muted" />
    )
  }

  const hasData = pressureReadings.length > 0 || headacheEvents.length > 0

  if (!hasData) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg border border-border text-sm text-muted-foreground">
        Log a few episodes to see patterns here
      </div>
    )
  }

  const lineData: ChartPoint[] = pressureReadings.map((r) => ({
    timestamp: r.timestamp,
    pressure: r.pressure,
  }))

  // Determine median pressure for placing dots when weather is null
  const pressureValues = pressureReadings.map((r) => r.pressure)
  const medianPressure =
    pressureValues.length > 0
      ? pressureValues[Math.floor(pressureValues.length / 2)]
      : 1013

  const scatterData: ScatterPoint[] = headacheEvents
    .map((e) => ({
      timestamp: e.timestamp,
      pressure: e.weather?.pressure ?? medianPressure,
      severity: e.severity,
      fill: SEVERITY_COLORS[e.severity],
    }))

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
          <XAxis
            dataKey="timestamp"
            type="number"
            domain={['dataMin', 'dataMax']}
            tickFormatter={(v: number) => format(new Date(v), 'MMM d')}
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={['auto', 'auto']}
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const d = payload[0].payload as ChartPoint | ScatterPoint
              const isSeverity = 'severity' in d
              return (
                <div className="rounded-md border border-border bg-card px-3 py-2 text-xs shadow-md">
                  <p className="font-medium">{format(new Date(d.timestamp), 'MMM d, HH:mm')}</p>
                  <p>{d.pressure} hPa</p>
                  {isSeverity && (
                    <p style={{ color: (d as ScatterPoint).fill }}>
                      Severity {(d as ScatterPoint).severity} — {SEVERITY_LABELS[(d as ScatterPoint).severity]}
                    </p>
                  )}
                </div>
              )
            }}
          />
          {lineData.length > 0 && (
            <Line
              data={lineData}
              dataKey="pressure"
              type="monotone"
              stroke="#6366f1"
              strokeWidth={2}
              dot={false}
              name="Pressure"
            />
          )}
          {scatterData.length > 0 && (
            <Scatter
              data={scatterData}
              dataKey="pressure"
              name="Headache"
              shape={(props: {
                cx?: number
                cy?: number
                payload?: ScatterPoint
              }) => <CustomDot {...props} />}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
