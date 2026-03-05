// ─── Dexie Database Instance ──────────────────────────────────────────────────
// One database instance for the whole app — a singleton.
// Import `db` from here wherever you need to access IndexedDB.
//
// Dexie wraps the browser's IndexedDB API with a much nicer interface.
// Think of it like a tiny local database that lives in the browser.
//
// Docs: https://dexie.org/docs/Tutorial/Getting-started

import Dexie, { type EntityTable } from 'dexie'
import type { HeadacheEntry } from '@/types/headache'
import type { WeatherData } from '@/types/weather'
import type { SleepRecord } from '@/types/sleep'
import { SCHEMA_V1, SCHEMA_V2 } from './schema'

// Extend Dexie with typed tables — this gives us full TypeScript autocomplete
// when doing db.headacheEntries.where(...).
class PainTrackerDB extends Dexie {
  // EntityTable<T, PrimaryKey> — second arg is the primary key field name.
  headacheEntries!: EntityTable<HeadacheEntry, 'id'>
  // WeatherData uses `timestamp` (Unix ms) as its primary key — no separate id field.
  weatherReadings!: EntityTable<WeatherData, 'timestamp'>
  sleepRecords!: EntityTable<SleepRecord, 'id'>

  constructor() {
    super('PainTrackerDB')

    // V1 — kept for migration chain; do not remove.
    this.version(1).stores(SCHEMA_V1)

    // V2 — fixes weatherReadings primary key from `id` → `timestamp`.
    // WeatherData has no `id` field; timestamp is the natural unique key.
    // The object store is recreated automatically by Dexie; existing weather
    // readings are dropped (they were unreachable under the wrong PK anyway).
    this.version(2).stores(SCHEMA_V2)
  }
}

// Export the singleton — import this in repositories, never create a new Dexie()
export const db = new PainTrackerDB()
