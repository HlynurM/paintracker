'use client'

import { ANALYSIS_WINDOWS } from '@/config/constants'
import type { AnalysisWindow } from '@/config/constants'

interface AnalysisWindowPickerProps {
  window: AnalysisWindow
  onChange: (w: AnalysisWindow) => void
}

const WINDOW_LABELS: Record<AnalysisWindow, string> = {
  '30d': '30d',
  '60d': '60d',
  '90d': '90d',
  'all': 'All',
}

export default function AnalysisWindowPicker({ window, onChange }: AnalysisWindowPickerProps) {
  return (
    <div className="flex gap-1" role="group" aria-label="Analysis window">
      {ANALYSIS_WINDOWS.map((w) => (
        <button
          key={w}
          type="button"
          onClick={() => onChange(w)}
          aria-pressed={window === w}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            window === w
              ? 'bg-foreground text-background'
              : 'border border-border text-muted-foreground hover:text-foreground'
          }`}
        >
          {WINDOW_LABELS[w]}
        </button>
      ))}
    </div>
  )
}
