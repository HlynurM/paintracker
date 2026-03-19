// ─── SeveritySlider ───────────────────────────────────────────────────────────
// Range input for selecting headache severity (1–5).
// Full-width, colour-coded track gradient and thumb.

import { SEVERITY_LABELS } from '@/config/constants'
import { SEVERITY_COLORS, SEVERITY_TEXT_CLASSES } from '@/lib/severityColors'

interface SeveritySliderProps {
  value: number
  onChange: (value: number) => void
}

const TRACK_GRADIENT =
  'linear-gradient(to right, #4ade80, #a3e635, #fbbf24, #f97316, #ef4444)'

export default function SeveritySlider({ value, onChange }: SeveritySliderProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label htmlFor="severity-slider" className="text-sm font-medium">
          Severity
        </label>
        <span className={`text-2xl font-bold ${SEVERITY_TEXT_CLASSES[value]}`}>
          {value} — {SEVERITY_LABELS[value]}
        </span>
      </div>
      <input
        id="severity-slider"
        type="range"
        min={1}
        max={5}
        step={1}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="severity-slider"
        style={{
          background: TRACK_GRADIENT,
          ['--thumb-color' as string]: SEVERITY_COLORS[value],
        }}
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Mild</span>
        <span>Moderate</span>
        <span>Significant</span>
        <span>Severe</span>
        <span>Debilitating</span>
      </div>
    </div>
  )
}
