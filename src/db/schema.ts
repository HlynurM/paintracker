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
  // Index `timestamp` so we can query "entries in the last 7 days" efficiently.
  // Index `severity` so we can filter by severity range.
  headacheEntries: 'id, timestamp, severity',

  // Index `timestamp` for pressure-history time-range queries.
  weatherReadings: 'id, timestamp',

  // Index `date` for daily lookup. The date string "2026-03-04" sorts correctly.
  sleepRecords: 'id, date',
} as const
