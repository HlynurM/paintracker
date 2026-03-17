# Sync Architecture — PainTracker

## Philosophy

**Local-first.** The app works fully offline. Supabase is a backup/mirror,
not the primary data source. All reads/writes go to Dexie first.

---

## Sync Flow

```
User action (log headache)
  ↓
headacheRepository.save(entry)           ← Dexie write (synchronous feel)
  ↓
syncStore.enqueue({ type: 'headache', id: entry.id })
  ↓ (background, when online)
syncService.drainQueue()
  ↓
supabaseClient.upsert('headache_entries', entry)
  ↓
syncStore.markSynced(entry.id)
```

---

## Sync Store (Zustand)  (`src/sync/syncStore.ts`)

```ts
interface SyncStore {
  queue: SyncJob[]
  status: 'idle' | 'syncing' | 'error' | 'offline'
  lastSyncedAt: number | null
  enqueue: (job: SyncJob) => void
  markSynced: (id: string) => void
  setStatus: (status: SyncStore['status']) => void
}

interface SyncJob {
  id: string           // item id
  type: 'headache' | 'weather' | 'sleep'
  action: 'upsert' | 'delete'
  retries: number
}
```

---

## Conflict Resolution

Simple rule: **last write wins by `synced_at` timestamp**.

- Each Supabase row has a `synced_at` column (UTC ms)
- On upsert, client sends current timestamp
- If server row has newer `synced_at`, server wins (handled by Supabase RLS or upsert policy)

Edge cases:
- Offline edits from two devices → merge on next sync; if same `id`, latest timestamp wins
- Delete: soft-delete only (`deleted_at` column), never hard-delete until both sides confirm

---

## Supabase Auth

- Auth via magic link or OAuth (phase 2)
- Row-Level Security (RLS) on all tables: `user_id = auth.uid()`
- Anon access disabled

---

## syncService  (`src/sync/syncService.ts`)

```
syncService
  .drainQueue()       ← processes all queued jobs in order
  .pushOne(job)       ← upserts single item to Supabase
  .pullAll()          ← full re-sync from Supabase (e.g. new device)
  .scheduleNext()     ← sets up retry with exponential backoff
```

---

## Retry Policy

| Attempt | Delay |
|---|---|
| 1st | immediate |
| 2nd | 30s |
| 3rd | 5min |
| 4th+ | 30min |

After 5 failures, job stays in queue, user notified in Settings.

---

## Environment Variables Required

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Accessed only through `src/config/env.ts`. Never read `process.env` directly elsewhere.

---

## When to Implement

Build sync **after** local data layer (F01) is fully working and tested.
Local-first means sync is an enhancement, not a requirement for core app functionality.
