export type RemedyTag =
  | 'rest'
  | 'sleep'
  | 'medication-otc'
  | 'medication-prescription'
  | 'hydration'
  | 'cold-compress'
  | 'dark-room'
  | 'caffeine'
  | 'walk'
  | 'stretching'
  | 'other'

export interface RemedyEntry {
  id: string
  headacheEntryId: string
  timestamp: number
  tags: RemedyTag[]
  effectivenessRating: 1 | 2 | 3 | 4 | 5
  timeToReliefMinutes?: number
  notes?: string
}

export type RemedyFormData = Pick<
  RemedyEntry,
  'tags' | 'effectivenessRating' | 'timeToReliefMinutes' | 'notes'
>
