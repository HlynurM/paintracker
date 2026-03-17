# F01 — Data Layer (Dexie + Repositories)

> **Status:** done
> **Branch:** —
> **Created:** 2026-03-17
> **Depends on:** —

---

## Purpose

Local-first persistence via Dexie.js (IndexedDB). Provides typed repository functions for reading and writing headache entries, weather readings, and sleep records. All other features read and write data exclusively through these repositories — no feature touches the database directly. This layer must remain stable; everything else builds on top of it.

---

## Acceptance Criteria

- [ ] The app opens without error on a fresh install with no existing database.
- [ ] A headache entry saved to the database can be retrieved with all fields intact.
- [ ] Deleting a headache entry removes it permanently — it does not reappear after reload.
- [ ] Weather readings outside a queried time range are not returned.
- [ ] Weather readings older than the configured retention window are automatically pruned after each new save.

---

## Functional Requirements

1. Dexie opens without error on first run with no existing database.
2. Schema version is tracked; bumping the version number triggers a registered migration before any query runs.
3. `headacheEntries` table: primary key `id` (UUID), indexed on `timestamp` and `severity`.
4. `weatherReadings` table: primary key `timestamp` (Unix ms — the natural unique key per reading, no separate id field).
5. `sleepRecords` table: primary key `id` (UUID), indexed on `date` (ISO date string, lexicographically sortable).
6. All repository functions are `async` — IndexedDB is always asynchronous.
7. `saveHeadacheEntry` uses `put` (upsert), not `add`, so re-syncing from Supabase does not create duplicates.
8. `getAllHeadacheEntries` returns all entries sorted newest-first by `timestamp`.
9. `getHeadacheEntriesInRange(fromMs, toMs)` returns entries within a Unix ms time range, newest-first.
10. `deleteHeadacheEntry(id)` removes a single entry by UUID.
11. `countHeadacheEntries()` returns total count — used by insights for "not enough data" guard.
12. `saveWeatherReading(data)` upserts by `timestamp` (primary key).
13. `getWeatherReadingsInRange(fromMs, toMs)` returns readings within a time range.
14. `pruneOldWeatherReadings(beforeMs)` deletes all readings with `timestamp < beforeMs`.

---

## Data Contracts

### `headacheEntries` — `HeadacheEntry`

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | UUID, generated client-side |
| `timestamp` | `number` | Unix ms |
| `severity` | `HeadacheSeverity` (1–10) | |
| `notes` | `string?` | Optional free text |
| `weather` | `WeatherSnapshot` | Frozen at log time — no foreign key |
| `triggers` | `TriggerTag[]?` | Optional predefined tags |
| `durationMinutes` | `number?` | Optional, filled in later |

### `weatherReadings` — `WeatherData`

| Field | Type | Notes |
|---|---|---|
| `timestamp` | `number` | Unix ms — also the primary key |
| `pressure` | `number` | hPa |
| `temperature` | `number` | °C |
| `humidity` | `number` | % relative humidity |
| `windSpeed` | `number` | km/h |
| `trend` | `PressureTrend` | `'rising'` \| `'falling'` \| `'stable'` |
| `trendDeltaHpa` | `number` | pressure now − pressure 3h ago |

### Repository contract summary

| Method | Returns | Notes |
|---|---|---|
| `saveHeadacheEntry(entry)` | `Promise<void>` | upsert |
| `getAllHeadacheEntries()` | `Promise<HeadacheEntry[]>` | newest-first |
| `getHeadacheEntriesInRange(from, to)` | `Promise<HeadacheEntry[]>` | Unix ms bounds |
| `updateHeadacheEntry(id, patch)` | `Promise<void>` | partial update — needed by F04 |
| `deleteHeadacheEntry(id)` | `Promise<void>` | |
| `countHeadacheEntries()` | `Promise<number>` | |
| `saveWeatherReading(data)` | `Promise<void>` | upsert by timestamp |
| `getWeatherReadingsInRange(from, to)` | `Promise<WeatherData[]>` | |
| `pruneOldWeatherReadings(beforeMs)` | `Promise<void>` | called after each fetch |

---

## Edge Cases

- Database does not exist on first run — Dexie creates it automatically; no setup code needed.
- Schema version mismatch (returning user, old browser DB) — migration must complete before any query runs.
- `put` on an existing entry (same UUID) overwrites silently — correct behavior for cloud re-sync.
- `getHeadacheEntriesInRange` with `from > to` returns empty array, no error.
- `getWeatherReadingsInRange` with no readings in range returns empty array.
- `deleteHeadacheEntry` with a non-existent id — no error thrown, operation is a no-op.
- `updateHeadacheEntry` with a non-existent id — no error thrown.
- Querying any table when it is empty returns an empty array, never throws.

---

## Out of Scope

- No business logic inside repositories (no validation, computation, or derivation).
- No Supabase interaction — that is F09.
- Sleep repository (`sleepRecords`) is defined and available but not actively exercised until F08.
- No migration for V1 → V2 beyond the schema change already in place.

---

## Test Guidelines

- **Layer:** unit — use `fake-indexeddb` to run an in-memory Dexie instance in Vitest (no browser needed)
- **Key scenarios to cover:**
  - Fresh DB opens without error
  - `saveHeadacheEntry` → `getAllHeadacheEntries` returns the saved entry with all fields intact
  - `getHeadacheEntriesInRange` filters correctly — entry at boundary is included; entry outside is excluded
  - `deleteHeadacheEntry` removes entry; subsequent `getAllHeadacheEntries` excludes it
  - `put` on duplicate UUID does not create a second record (count stays at 1)
  - `updateHeadacheEntry` with a patch — only patched fields change, other fields are preserved
  - `pruneOldWeatherReadings(cutoffMs)` removes readings with `timestamp < cutoffMs`, keeps newer ones
  - `countHeadacheEntries` returns correct count after saves and deletes
- **Do NOT test:**
  - Internal Dexie mechanics (trust the library)
  - IndexedDB browser compatibility (not our responsibility)
