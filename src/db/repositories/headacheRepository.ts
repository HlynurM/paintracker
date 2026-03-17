// ─── Headache Repository ──────────────────────────────────────────────────────
// The only place that talks to the database for headache data.
// No business logic — only reads and writes.

import { db } from '@/db/db'
import type { HeadacheEntry } from '@/types/headache'

// Save a new entry (or overwrite an existing one with the same id).
// Uses `put` so re-syncing from the cloud does not create duplicates.
export async function saveHeadacheEntry(entry: HeadacheEntry): Promise<void> {
  await db.headacheEntries.put(entry)
}

// Partially update an existing entry by id. No-op if the id does not exist.
export async function updateHeadacheEntry(
  id: string,
  patch: Partial<HeadacheEntry>
): Promise<void> {
  await db.headacheEntries.update(id, patch)
}

// All entries, sorted newest first.
export async function getAllHeadacheEntries(): Promise<HeadacheEntry[]> {
  return db.headacheEntries.orderBy('timestamp').reverse().toArray()
}

// Entries within a Unix ms time range, newest first.
export async function getHeadacheEntriesInRange(
  fromMs: number,
  toMs: number
): Promise<HeadacheEntry[]> {
  return db.headacheEntries
    .where('timestamp')
    .between(fromMs, toMs)
    .reverse()
    .toArray()
}

// Remove a single entry by id. No-op if the id does not exist.
export async function deleteHeadacheEntry(id: string): Promise<void> {
  await db.headacheEntries.delete(id)
}

// Total entry count — used for "not enough data yet" guards.
export async function countHeadacheEntries(): Promise<number> {
  return db.headacheEntries.count()
}
