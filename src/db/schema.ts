// ─── Dexie Schema ─────────────────────────────────────────────────────────────
// This file defines the shape of the IndexedDB database.
//
// IMPORTANT RULES FOR DEXIE SCHEMAS:
// 1. The version number must increase every time you change a table or index.
// 2. Only list columns you need to QUERY/SORT BY — not every column.
//    Dexie stores all object properties; you only index what you search on.
// 3. `++id` = auto-increment integer primary key
//    `id` = primary key you provide (we provide UUIDs)
//    `timestamp` = a regular index (for sorting/filtering by time)
//
// HOW MIGRATIONS WORK:
//   When you bump the version and add `.upgrade()`, Dexie runs the upgrade
//   function on existing users' databases. See db/migrations/ for examples.

// The schema object maps table name → index string.
// Format: "primaryKey, index1, index2"
export const SCHEMA_V1 = {
  headacheEntries: 'id, timestamp, severity',
  weatherReadings: 'id, timestamp',
  sleepRecords: 'id, date',
} as const

// V2: weatherReadings primary key changed from `id` (WeatherData has no id field)
// to `timestamp` (the natural unique key for a point-in-time reading).
// headacheEntries.weather embeds a WeatherSnapshot at log time — no foreign key needed.
// Correlation queries join by time range: find weatherReadings near headacheEntry.timestamp.
export const SCHEMA_V2 = {
  // `id` UUID primary key, `timestamp` index for range queries, `severity` for filters.
  headacheEntries: 'id, timestamp, severity',

  // `timestamp` (Unix ms) IS the primary key — each reading is unique per moment.
  // No separate `id` field on WeatherData; timestamp is both identity and sort key.
  weatherReadings: 'timestamp',

  // `id` UUID primary key, `date` index for daily lookup ("2026-03-04" sorts correctly).
  sleepRecords: 'id, date',
} as const
