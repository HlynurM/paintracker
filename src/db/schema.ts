// ─── Dexie Schema ─────────────────────────────────────────────────────────────
// Defines the IndexedDB table structure for the current database version.
//
// RULES:
// 1. Only list columns you need to QUERY or SORT BY — Dexie stores all fields
//    automatically; you only index what you search on.
// 2. `id` = primary key you supply (we use UUIDs)
//    `timestamp` = primary key for weather (natural unique key per reading)
// 3. Bump the version in db.ts and add an upgrade callback when this changes.
//
// Historical versions live in db.ts as inline entries in the version chain.
// This file only ever describes the live, current schema.

export const DB_SCHEMA = {
  // UUID primary key; query by time range and filter by severity.
  headacheEntries: 'id, timestamp, severity',

  // Timestamp IS the primary key — each reading is unique to a moment in time.
  // No separate id field on WeatherData.
  weatherReadings: 'timestamp',

  // UUID primary key; query by ISO date string (lexicographic sort works for YYYY-MM-DD).
  sleepRecords: 'id, date',
} as const

// v3: adds remedy entries linked to headache entries via headacheEntryId FK.
export const DB_SCHEMA_V3 = {
  ...DB_SCHEMA,
  remedies: 'id, headacheEntryId, timestamp',
} as const
