import type { RemedyEntry, RemedyFormData } from '@/types/remedy'

export function createRemedyEntry(
  headacheEntryId: string,
  data: RemedyFormData
): RemedyEntry {
  return {
    id: crypto.randomUUID(),
    headacheEntryId,
    timestamp: Date.now(),
    tags: data.tags,
    effectivenessRating: data.effectivenessRating,
    timeToReliefMinutes: data.timeToReliefMinutes,
    notes: data.notes,
  }
}
