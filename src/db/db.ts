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
import { SCHEMA_V1 } from './schema'

// Extend Dexie with typed tables — this gives us full TypeScript autocomplete
// when doing db.headacheEntries.where(...).
class PainTrackerDB extends Dexie {
  // EntityTable<T, PrimaryKey> tells Dexie: this table holds T objects
  // keyed by their `id` field.
  headacheEntries!: EntityTable<HeadacheEntry, 'id'>
  weatherReadings!: EntityTable<WeatherData, 'id'>
  sleepRecords!: EntityTable<SleepRecord, 'id'>

  constructor() {
    super('PainTrackerDB')

    // Version 1 — initial schema
    // To add a new version: this.version(2).stores({...}).upgrade(tx => {...})
    this.version(1).stores(SCHEMA_V1)
  }
}

// Export the singleton — import this in repositories, never create a new Dexie()
export const db = new PainTrackerDB()
