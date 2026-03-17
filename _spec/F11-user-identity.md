# F11 — User Identity & Data Ownership

> **Status:** planned
> **Branch:** spec/f11-user-identity
> **Created:** 2026-03-17
> **Depends on:** F01

---

## Purpose

Every piece of data collected by PainTracker — headache entries, weather readings, sleep records — belongs to someone. Right now no ownership concept exists, which makes future cloud sync and multi-user support impossible to add cleanly. This feature introduces the simplest possible user identity: a UUID-based profile created automatically on first launch, stored locally, and stamped onto all data records. No login, no accounts — just a stable ID that ties data together and is ready to travel to the cloud when that day comes.

---

## Acceptance Criteria

A user-visible checklist. Each item is something a human can verify by using the app.

- [ ] On first launch the app silently creates a user profile (no prompt, no interruption).
- [ ] The profile has a display name that defaults to `"Me"` and can be edited in Settings.
- [ ] All new headache entries are saved with the user's ID attached.
- [ ] All new weather readings are saved with the user's ID attached.
- [ ] All new sleep records are saved with the user's ID attached.
- [ ] Existing records saved before this feature are backfilled with the local user's ID during migration (they are not orphaned).
- [ ] If the user profile is somehow missing on any subsequent launch, a new one is created automatically rather than crashing.

---

## Functional Requirements

1. On app boot, `userService.getOrCreateUser()` is called once before any other data operation. It reads the `userProfile` table; if empty, it inserts a new `UserProfile` with a generated UUID and `name: "Me"`.
2. The resulting `userId` is written into a Zustand store (`userStore`) and is accessible app-wide via `useUser()`.
3. `HeadacheEntry`, `WeatherData`, and `SleepRecord` types each gain a required `userId: string` field.
4. All repository save methods accept (and store) `userId` as part of the record — no repository generates or infers it.
5. The `userRepository` exposes `getProfile()` and `saveProfile(profile)`. `getProfile()` returns `undefined` if no profile exists yet.
6. A Dexie schema migration (v2 → v3, or whichever is next) adds a `userProfile` table and a `userId` index to `headacheEntries`, `weatherReadings`, and `sleepRecords`. The upgrade callback backfills `userId` on all existing records using the newly created (or existing) profile's `id`.
7. The user's display name is editable via a settings form. Changing the name updates only the `UserProfile` record — it does not touch any data records.
8. Services (`headacheService`, `weatherService`, etc.) must read `userId` from the store, not accept it as a parameter from the UI.

---

## Data Contracts

### `userProfile` — `UserProfile`

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | UUID, generated once by `crypto.randomUUID()` |
| `name` | `string` | Display name; defaults to `"Me"` |
| `createdAt` | `number` | Unix ms — when the profile was first created |

### Updated shared types

`HeadacheEntry`, `WeatherData`, and `SleepRecord` each gain:

| Field | Type | Notes |
|---|---|---|
| `userId` | `string` | UUID matching `UserProfile.id` |

### `userRepository` contract

| Method | Returns | Notes |
|---|---|---|
| `getProfile()` | `Promise<UserProfile \| undefined>` | Returns `undefined` on fresh install |
| `saveProfile(profile)` | `Promise<void>` | Upsert by `id` |

### `userStore` shape

```ts
interface UserState {
  userId: string | null
  userName: string
  setUser: (profile: UserProfile) => void
}
```

---

## Files

**Create:**
- `src/types/user.ts` — `UserProfile` interface
- `src/db/repositories/userRepository.ts` — `getProfile`, `saveProfile`
- `src/features/user/services/userService.ts` — `getOrCreateUser()`, `updateUserName(name)`
- `src/features/user/store/userStore.ts` — Zustand slice holding `userId` and `userName`
- `src/features/user/hooks/useUser.ts` — exposes `{ userId, userName, updateName }`
- `src/features/user/components/UserNameForm.tsx` — simple name-edit input for Settings
- `src/features/user/components/UserNameForm.test.tsx` — component tests
- `src/features/user/hooks/useUser.test.ts` — hook tests
- `src/features/user/services/userService.test.ts` — service tests
- `src/features/user/index.ts` — public API (`useUser`, `UserNameForm`)
- `src/db/migrations/v3.ts` — backfill migration (TODO: confirm current schema version in `db.ts`)

**Modify:**
- `src/types/headache.ts` — add `userId: string` to `HeadacheEntry`
- `src/types/weather.ts` — add `userId: string` to `WeatherData`
- `src/types/sleep.ts` — add `userId: string` to `SleepRecord`
- `src/db/schema.ts` — add `userProfile` table; add `userId` to existing table index strings; bump schema version
- `src/db/db.ts` — register v3 upgrade callback that runs the migration
- `src/app/layout.tsx` (or root provider) — call `getOrCreateUser()` and populate the store on app boot
- Any existing service that calls a repository `save` method — pass `userId` from the store

---

## Edge Cases

- **Fresh install:** `userProfile` table is empty. `getOrCreateUser()` creates a new profile and returns it. The migration upgrade runs but finds no existing rows to backfill — this is fine.
- **Returning user (pre-F11 data):** Dexie upgrade fires; existing records have no `userId`. The migration reads (or creates) the profile and writes its `id` into all existing rows.
- **`getProfile()` returns `undefined` on a subsequent launch** (e.g. corrupted DB): `getOrCreateUser()` treats this as a fresh install and creates a new profile. Data may be orphaned from the old ID — acceptable edge case at this stage.
- **`crypto.randomUUID()` unavailable** (very old browser): fall back to a manual UUID v4 generator in `src/lib/uuid.ts`.
- **Concurrent calls to `getOrCreateUser()`** on the same boot: the Zustand store check (`userId !== null`) prevents double-creation; only one DB write occurs.
- **Name field left blank:** `updateUserName` rejects an empty string and keeps the current name, showing a validation message.

---

## Out of Scope

- Multi-user switching or per-user data isolation (only one user profile exists locally).
- Authentication, login, passwords, or OAuth.
- Cloud sync of the `UserProfile` record (Supabase will use this `userId` as `user_id`, but the sync wiring is F09's responsibility).
- User avatars or profile photos.
- Account deletion or data export.
- Any UI beyond the name-edit field in Settings.

---

## Test Guidelines

- **Layer:** unit (service + repository using `fake-indexeddb`), component (UserNameForm)
- **Key scenarios to cover:**
  - `getOrCreateUser()` on empty DB → creates profile with UUID and name `"Me"`, returns it
  - `getOrCreateUser()` when profile exists → returns existing profile, does NOT create a second one
  - `updateUserName("Alice")` → `getProfile()` returns profile with `name: "Alice"`
  - `updateUserName("")` → throws / returns error; name unchanged
  - `UserNameForm` renders current name; submitting new name calls `updateName`; empty submit shows error
  - `useUser()` returns `userId` and `userName` from store after boot
- **Do NOT test:**
  - Dexie internals or IndexedDB mechanics
  - Migration backfill logic directly (covered by the DB integration test in F01's test suite patterns)
  - UUID format validity (trust `crypto.randomUUID()`)
