# Architecture — PainTracker

## Guiding Principles

1. **Vertical feature slices** — each feature owns its UI, hooks, and business logic
2. **Horizontal data layer** — repositories are shared because multiple features read the same data
3. **Strict layer contracts** — no layer reaches past its immediate neighbor
4. **Zero framework code in business logic** — services and utils are plain TypeScript

---

## Layer Stack

```
┌─────────────────────────────────────────────┐
│  Pages / Routes  (app/)                     │  Next.js App Router pages
├─────────────────────────────────────────────┤
│  Feature Components  (features/*/components)│  React UI, Tailwind, shadcn/ui
├─────────────────────────────────────────────┤
│  Custom Hooks  (features/*/hooks)           │  Glue: store ↔ service ↔ component
├─────────────────────────────────────────────┤
│  Zustand Store  (features/*/store)          │  Client-side state slices
│  Services  (features/*/services)            │  Pure business logic (no React)
├─────────────────────────────────────────────┤
│  Repositories  (db/repositories)            │  Data-access only, no logic
├─────────────────────────────────────────────┤
│  Dexie DB  (db/)     Supabase  (sync/)      │  Persistence
└─────────────────────────────────────────────┘
```

### Layer rules
| Layer | May import from | Must NOT import from |
|---|---|---|
| Pages | Feature components, shared components | Repositories, db directly |
| Components | Hooks, shared components, types | Services, stores directly |
| Hooks | Stores, services, repositories | Dexie, Supabase clients directly |
| Services | Types, lib/, utils | React, stores, db |
| Repositories | db/schema, types | Services, stores, React |
| db/ | types | Everything above |

---

## Folder Structure

```
paintracker/                         ← Next.js project root
├── src/
│   ├── app/                         ← Next.js App Router (routing only)
│   │   ├── (app)/                   ← Route group with app shell
│   │   │   ├── layout.tsx           ← AppShell wrapper
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── log/
│   │   │   │   └── page.tsx         ← Log a new headache entry
│   │   │   ├── history/
│   │   │   │   └── page.tsx
│   │   │   ├── insights/
│   │   │   │   └── page.tsx
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   ├── api/
│   │   │   └── sync/route.ts        ← Supabase sync endpoint (if needed)
│   │   ├── layout.tsx               ← Root layout (fonts, providers)
│   │   └── page.tsx                 ← Redirect to /dashboard
│   │
│   ├── features/                    ← Vertical feature slices
│   │   ├── headache/
│   │   │   ├── components/
│   │   │   │   ├── HeadacheForm.tsx
│   │   │   │   ├── HeadacheForm.test.tsx
│   │   │   │   ├── SeveritySlider.tsx
│   │   │   │   └── SeveritySlider.test.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useHeadacheLog.ts
│   │   │   │   └── useHeadacheLog.test.ts
│   │   │   ├── services/
│   │   │   │   ├── headacheService.ts    ← Pure business logic
│   │   │   │   └── headacheService.test.ts
│   │   │   ├── store/
│   │   │   │   └── headacheStore.ts     ← Zustand slice
│   │   │   └── index.ts                 ← Public re-exports for this feature
│   │   │
│   │   ├── weather/
│   │   │   ├── components/
│   │   │   │   ├── PressureCard.tsx
│   │   │   │   ├── PressureCard.test.tsx
│   │   │   │   ├── WeatherWidget.tsx
│   │   │   │   └── WeatherWidget.test.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useWeather.ts
│   │   │   │   └── useWeather.test.ts
│   │   │   ├── services/
│   │   │   │   ├── weatherApi.ts         ← External API calls (Open-Meteo)
│   │   │   │   ├── pressureAnalysis.ts   ← Pure: trend detection, thresholds
│   │   │   │   └── pressureAnalysis.test.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── insights/
│   │   │   ├── components/
│   │   │   │   ├── CorrelationChart.tsx
│   │   │   │   └── RiskBanner.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useInsights.ts
│   │   │   ├── services/
│   │   │   │   ├── correlationEngine.ts  ← Core: pressure ↔ headache correlation
│   │   │   │   └── correlationEngine.test.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── sleep/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── index.ts
│   │   │
│   │   └── notifications/
│   │       ├── hooks/
│   │       │   └── useRiskAlert.ts
│   │       ├── services/
│   │       │   └── notificationService.ts
│   │       └── index.ts
│   │
│   ├── db/                          ← Data layer (Dexie.js)
│   │   ├── db.ts                    ← Dexie instance (singleton)
│   │   ├── schema.ts                ← Table definitions & types
│   │   ├── migrations/              ← Version upgrade scripts
│   │   │   └── v1.ts
│   │   └── repositories/           ← Data access (no business logic)
│   │       ├── headacheRepository.ts
│   │       ├── headacheRepository.test.ts
│   │       ├── weatherRepository.ts
│   │       └── sleepRepository.ts
│   │
│   ├── sync/                        ← Supabase cloud sync
│   │   ├── supabaseClient.ts
│   │   ├── syncService.ts
│   │   └── syncStore.ts             ← Zustand: sync status, last synced
│   │
│   ├── types/                       ← Shared TypeScript types
│   │   ├── index.ts                 ← Re-exports everything
│   │   ├── headache.ts
│   │   ├── weather.ts
│   │   └── sleep.ts
│   │
│   ├── components/                  ← Shared UI (not feature-specific)
│   │   ├── ui/                      ← shadcn/ui primitives (auto-generated, do not edit)
│   │   ├── layout/
│   │   │   ├── AppShell.tsx
│   │   │   ├── Navigation.tsx
│   │   │   └── Header.tsx
│   │   └── common/
│   │       ├── LoadingSpinner.tsx
│   │       ├── ErrorBoundary.tsx
│   │       └── EmptyState.tsx
│   │
│   ├── hooks/                       ← Shared hooks (not feature-specific)
│   │   └── useDebounce.ts
│   │
│   ├── lib/                         ← Pure utilities — no React, no side effects
│   │   ├── dateUtils.ts
│   │   ├── pressureUtils.ts
│   │   └── formatters.ts
│   │
│   └── config/
│       ├── constants.ts             ← Pressure thresholds, severity levels, etc.
│       └── env.ts                   ← Typed environment variable access
│
├── public/
├── docs/                            ← Living documentation (see /docs/)
└── tests/                           ← Integration/e2e tests (if added later)
```

---

## Data Flow — Log a Headache Entry

```
User fills HeadacheForm
  → calls useHeadacheLog hook
  → hook calls headacheService.createEntry(data)
  → service validates, enriches with weather snapshot
  → hook calls headacheRepository.save(entry)
  → repository writes to Dexie
  → syncStore schedules Supabase push
  → hook updates headacheStore (optimistic UI)
  → component re-renders via store subscription
```

---

## Feature Public API Pattern

Each `features/*/index.ts` exports only what other features or pages need:

```ts
// features/headache/index.ts
export { HeadacheForm } from './components/HeadacheForm'
export { useHeadacheLog } from './hooks/useHeadacheLog'
export type { HeadacheEntry } from '@/types/headache'
// Never export internals: store slices, raw repositories
```

---

## State Management

- **Zustand** per feature slice, composed in `src/store/index.ts` if global state needed
- No cross-feature store imports — features communicate via shared types and repositories
- Derived/computed state lives in hooks or services, not the store

---

## Environment Variables

All env access goes through `src/config/env.ts`. Never import `process.env` directly elsewhere.
