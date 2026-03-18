// ─── TriggerTagPicker ─────────────────────────────────────────────────────────
// Toggle buttons for selecting headache trigger tags.
// ALL_TRIGGER_TAGS is defined here (union types aren't iterable at runtime).

import type { TriggerTag } from '@/types/headache'

export const ALL_TRIGGER_TAGS: TriggerTag[] = [
  'pressure-drop',
  'pressure-rise',
  'poor-sleep',
  'dehydration',
  'screen-time',
  'stress',
  'manual',
]

const TAG_LABELS: Record<TriggerTag, string> = {
  'pressure-drop': 'Pressure Drop',
  'pressure-rise': 'Pressure Rise',
  'poor-sleep': 'Poor Sleep',
  'dehydration': 'Dehydration',
  'screen-time': 'Screen Time',
  'stress': 'Stress',
  'manual': 'Manual',
}

interface TriggerTagPickerProps {
  selected: TriggerTag[]
  onChange: (tags: TriggerTag[]) => void
}

export default function TriggerTagPicker({ selected, onChange }: TriggerTagPickerProps) {
  function toggle(tag: TriggerTag) {
    if (selected.includes(tag)) {
      onChange(selected.filter((t) => t !== tag))
    } else {
      onChange([...selected, tag])
    }
  }

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium">Triggers</span>
      <div className="flex flex-wrap gap-2">
        {ALL_TRIGGER_TAGS.map((tag) => {
          const isSelected = selected.includes(tag)
          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggle(tag)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                isSelected
                  ? 'bg-foreground text-background'
                  : 'border border-border bg-background text-muted-foreground hover:text-foreground'
              }`}
            >
              {TAG_LABELS[tag]}
            </button>
          )
        })}
      </div>
    </div>
  )
}
