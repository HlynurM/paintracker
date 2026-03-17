// ─── Dexie Database Instance ──────────────────────────────────────────────────
// One database instance for the whole app — a singleton.
// Import `db` from here wherever you need to access IndexedDB.
//
// VERSION HISTORY
// v1 — initial schema; weatherReadings used `id` as PK (incorrect, WeatherData
//      has no id field). Kept in the chain so existing installs migrate cleanly.
// v2 — weatherReadings primary key corrected to `timestamp`. Existing weather
//      readings are dropped on upgrade (they were unreachable under the wrong PK).

import Dexie, { type EntityTable } from 'dexie'
import type { HeadacheEntry } from '@/types/headache'
import type { WeatherData } from '@/types/weather'
import type { SleepRecord } from '@/types/sleep'
import { DB_SCHEMA } from './schema'

class PainTrackerDB extends Dexie {
  headacheEntries!: EntityTable<HeadacheEntry, 'id'>
  weatherReadings!: EntityTable<WeatherData, 'timestamp'>
  sleepRecords!: EntityTable<SleepRecord, 'id'>

  constructor() {
    super('PainTrackerDB')

    // v1 — historical; never remove from the chain or existing users skip a migration.
    this.version(1).stores({
      headacheEntries: 'id, timestamp, severity',
      weatherReadings: 'id, timestamp',
      sleepRecords: 'id, date',
    })

    // v2 — current schema. Weather readings recreated with timestamp as PK.
    this.version(2).stores(DB_SCHEMA)
  }
}

export const db = new PainTrackerDB()
