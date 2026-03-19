import type { RemedyTag } from '@/types/remedy'

export const ALL_REMEDY_TAGS: RemedyTag[] = [
  'rest',
  'sleep',
  'medication-otc',
  'medication-prescription',
  'hydration',
  'cold-compress',
  'dark-room',
  'caffeine',
  'walk',
  'stretching',
  'other',
]

const TAG_LABELS: Record<RemedyTag, string> = {
  'rest': 'Rest',
  'sleep': 'Sleep',
  'medication-otc': 'OTC Med',
  'medication-prescription': 'Rx Med',
  'hydration': 'Hydration',
  'cold-compress': 'Cold Compress',
  'dark-room': 'Dark Room',
  'caffeine': 'Caffeine',
  'walk': 'Walk',
  'stretching': 'Stretching',
  'other': 'Other',
}

interface RemedyTagPickerProps {
  selected: RemedyTag[]
  onChange: (tags: RemedyTag[]) => void
}

export default function RemedyTagPicker({ selected, onChange }: RemedyTagPickerProps) {
  function toggle(tag: RemedyTag) {
    if (selected.includes(tag)) {
      onChange(selected.filter((t) => t !== tag))
    } else {
      onChange([...selected, tag])
    }
  }

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium">What helped?</span>
      <div className="flex flex-wrap gap-2">
        {ALL_REMEDY_TAGS.map((tag) => {
          const isSelected = selected.includes(tag)
          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggle(tag)}
              aria-pressed={isSelected}
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
