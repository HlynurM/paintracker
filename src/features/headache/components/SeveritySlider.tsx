// ─── SeveritySlider ───────────────────────────────────────────────────────────
// Range input for selecting headache severity (1–5).
// Shows a human-readable label for the current value.

import { SEVERITY_LABELS } from '@/config/constants'

interface SeveritySliderProps {
  value: number
  onChange: (value: number) => void
}

export default function SeveritySlider({ value, onChange }: SeveritySliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor="severity-slider" className="text-sm font-medium">
          Severity
        </label>
        <span className="text-sm text-muted-foreground">
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
        className="w-full accent-foreground"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Mild</span>
        <span>Debilitating</span>
      </div>
    </div>
  )
}
