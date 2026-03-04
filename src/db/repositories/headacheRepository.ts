// ─── Headache Repository ──────────────────────────────────────────────────────
// The repository is the ONLY place that talks to the database for headache data.
// It does NO business logic — it only reads and writes.
//
// WHY THIS PATTERN?
//   If you later swap Dexie for something else, you only change this file.
//   Services and hooks don't know or care how data is stored.
//
// RULE: Functions here are async because IndexedDB is always async.

import { db } from '@/db/db'
import type { HeadacheEntry } from '@/types/headache'

// Save a new entry (or overwrite an existing one with the same id).
// We use `put` rather than `add` so re-syncing from Supabase works.
export async function saveHeadacheEntry(entry: HeadacheEntry): Promise<void> {
  await db.headacheEntries.put(entry)
}

// Get ALL entries, sorted newest first.
// Use this for the history list.
export async function getAllHeadacheEntries(): Promise<HeadacheEntry[]> {
  return db.headacheEntries.orderBy('timestamp').reverse().toArray()
}

// Get entries within a time range (Unix ms).
// Use this for the correlation engine — "entries in the last 30 days".
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

// Delete a single entry by its id.
export async function deleteHeadacheEntry(id: string): Promise<void> {
  await db.headacheEntries.delete(id)
}

// How many entries exist? Used for "not enough data" checks.
export async function countHeadacheEntries(): Promise<number> {
  return db.headacheEntries.count()
}
