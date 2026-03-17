# Feature Registry — PainTracker

Track each feature's status, purpose, components, and dependencies.
Update this file whenever a feature is started, completed, or changed.

Status legend:  `planned` | `in-progress` | `done` | `deferred`

---

## Feature Map

| ID | Feature | Status | Depends On |
|---|---|---|---|
| F01 | Data layer (Dexie + repos) | done | — |
| F02 | Weather fetch + store | done | F01 |
| F03 | Log headache entry | in-progress | F01, F02 |
| F04 | Headache history list | planned | F01 |
| F05 | Pressure trend display | planned | F02 |
| F06 | Correlation insights | planned | F01, F02 |
| F07 | Risk alert / notifications | planned | F06 |
| F08 | Sleep log | planned | F01 |
| F09 | Supabase cloud sync | planned | F01 |
| F10 | Dashboard overview | planned | F03, F05, F06 |
| F11 | Settings page | planned | F09 |

---

## F01 — Data Layer

**Purpose:** Local-first persistence via Dexie.js (IndexedDB).

**Files:**
- `src/db/db.ts` — Dexie singleton
- `src/db/schema.ts` — table definitions
- `src/db/repositories/headacheRepository.ts`
- `src/db/repositories/weatherRepository.ts`
- `src/db/repositories/sleepRepository.ts`

**Acceptance criteria:**
- [ ] Dexie opens without error on first run
- [ ] All repositories have unit tests with in-memory Dexie
- [ ] Schema version tracked and migrations registered

**Notes:** Build and test this first before any UI.

---

## F02 — Weather Fetch + Store

**Purpose:** Fetch barometric pressure and weather from Open-Meteo API every 15 minutes. Store readings in Dexie. Compute trend.

**Files:**
- `src/features/weather/services/weatherApi.ts`
- `src/features/weather/services/pressureAnalysis.ts`
- `src/features/weather/hooks/useWeather.ts`
- `src/features/weather/store/weatherStore.ts` (Zustand)

**Key logic:**
- Fetch on mount and on interval
- Compute `trendDeltaHpa` = `current.pressure - reading3hAgo.pressure`
- Derive `PressureTrend` from threshold constants

**Acceptance criteria:**
- [ ] `pressureAnalysis.ts` unit-tested with fixture data
- [ ] `useWeather` mocks the API and asserts state transitions
- [ ] Readings older than 90 days pruned on fetch

---

## F03 — Log Headache Entry

**Purpose:** Main input flow. User logs severity + optional notes. Weather snapshot is auto-captured.

**Files:**
- `src/features/headache/components/HeadacheForm.tsx`
- `src/features/headache/components/SeveritySlider.tsx`
- `src/features/headache/hooks/useHeadacheLog.ts`
- `src/features/headache/services/headacheService.ts`
- `src/app/(app)/log/page.tsx`

**Key logic in `headacheService.ts`:**
- Validate severity range
- Attach current WeatherSnapshot from `weatherStore`
- Generate UUID

**Acceptance criteria:**
- [ ] Form submits and entry appears in history
- [ ] Weather snapshot is attached (checked in integration test)
- [ ] Duplicate submit within 1s is prevented

---

## F04 — Headache History List

**Purpose:** Scrollable, filterable list of past entries.

**Files:**
- `src/features/headache/components/HeadacheList.tsx`
- `src/features/headache/components/HeadacheListItem.tsx`
- `src/features/headache/hooks/useHeadacheHistory.ts`
- `src/app/(app)/history/page.tsx`

**Acceptance criteria:**
- [ ] Lists entries sorted newest first
- [ ] Filter by severity range works
- [ ] Empty state shown when no entries

---

## F05 — Pressure Trend Display

**Purpose:** Show current pressure and trend direction in UI.

**Files:**
- `src/features/weather/components/PressureCard.tsx`
- `src/features/weather/components/WeatherWidget.tsx`

**Acceptance criteria:**
- [ ] Displays hPa, trend arrow, and delta
- [ ] Color-coded by risk level (green/amber/red)

---

## F06 — Correlation Insights

**Purpose:** Compute correlation between pressure changes and headache events. Show user which conditions predict their headaches.

**Files:**
- `src/features/insights/services/correlationEngine.ts`
- `src/features/insights/hooks/useInsights.ts`
- `src/features/insights/components/CorrelationChart.tsx`
- `src/features/insights/components/RiskBanner.tsx`
- `src/app/(app)/insights/page.tsx`

**Algorithm (v1 — simple):**
1. For each headache entry, look at weather 0–6h prior
2. Count how many occurred during pressure drops vs rises vs stable
3. Express as percentage: "X% of your headaches followed a pressure drop"

**Acceptance criteria:**
- [ ] `correlationEngine` is a pure function, fully unit-tested
- [ ] Handles fewer than 5 entries gracefully (show "not enough data")

---

## F07 — Risk Alert / Notifications

**Purpose:** Proactively warn user when conditions match their personal pattern.

**Files:**
- `src/features/notifications/services/notificationService.ts`
- `src/features/notifications/hooks/useRiskAlert.ts`

**Deferred until:** F06 done and correlation thresholds are tuned.

---

## F08 — Sleep Log

**Purpose:** Manual sleep entry (duration + quality). Future: Samsung Health import.

**Files:**
- `src/features/sleep/components/SleepForm.tsx`
- `src/features/sleep/hooks/useSleepLog.ts`
- `src/db/repositories/sleepRepository.ts`

---

## F09 — Supabase Cloud Sync

**Purpose:** Mirror local Dexie data to Supabase for backup and future multi-device.

**Files:**
- `src/sync/supabaseClient.ts`
- `src/sync/syncService.ts`
- `src/sync/syncStore.ts`

**Sync strategy:** Queue-based. On save, enqueue item. Background worker drains queue. See `docs/SYNC.md`.

---

## F10 — Dashboard

**Purpose:** At-a-glance view: current pressure, recent entries, risk level, quick-log button.

**Files:**
- `src/app/(app)/dashboard/page.tsx`
- Uses components from: weather, headache, insights

---

## F11 — Settings

**Purpose:** Manage account, sync status, notification preferences, data export/delete.

**Deferred until:** Core features stable.
