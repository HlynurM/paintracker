import { db } from '@/db/db'
import type { RemedyEntry } from '@/types/remedy'

export async function saveRemedyEntry(entry: RemedyEntry): Promise<void> {
  await db.remedies.put(entry)
}

export async function getRemediesForEntry(headacheEntryId: string): Promise<RemedyEntry[]> {
  return db.remedies.where('headacheEntryId').equals(headacheEntryId).toArray()
}

export async function getAllRemedyEntries(): Promise<RemedyEntry[]> {
  return db.remedies.orderBy('timestamp').reverse().toArray()
}

export async function deleteRemedyEntry(id: string): Promise<void> {
  await db.remedies.delete(id)
}
