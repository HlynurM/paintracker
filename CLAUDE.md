# PainTracker - Headache & Weather Pressure Tracker

## Project Purpose
Track headaches in correlation with barometric pressure changes, air quality or other related weather conditions.
Predict weather-triggered headache events over time in order to warn or notify risk ahead of time.

## Tech Stack
- Next.js 16 App Router
- TypeScript 5
- Tailwind CSS v4 + shadcn/ui
- Dexie.js for local-first IndexedDB storage
- Supabase for cloud sync (secondary, local-first)
- Zustand v5 for state management
- Vitest + React Testing Library

## Living Documentation (read before building any feature)
- `docs/ARCHITECTURE.md` — folder structure, layer rules, data flow
- `docs/DATA.md` — types, Dexie schema, repository contracts
- `docs/FEATURES.md` — feature registry with status and acceptance criteria
- `docs/TESTING.md` — testing strategy per layer, conventions
- `docs/SYNC.md` — Supabase sync architecture

## Feature Specs
- `_spec/` — one file per feature (F01, F02, …), planned → in-progress → done

## Folder Conventions
```
src/
  app/              ← Next.js routes only (no logic)
  features/         ← Vertical feature slices
    {name}/
      components/   ← React UI (co-located .test.tsx)
      hooks/        ← Glue between store/service and UI
      services/     ← Pure business logic (no React)
      store/        ← Zustand slice
      index.ts      ← Public API of the feature
  db/               ← Dexie instance, schema, repositories
  sync/             ← Supabase sync
  types/            ← Shared TS types
  components/       ← Shared UI (layout/, common/, ui/)
  lib/              ← Pure utilities (no React, no side effects)
  config/           ← constants.ts, env.ts
```

## Layer Rules (strict)
- Components never call repositories directly
- Services contain no React (no hooks, no JSX)
- Repositories contain no business logic
- All env vars accessed only via `src/config/env.ts`
- Features communicate via shared types, not by importing each other's internals

## Key Conventions
- Named exports for utilities and hooks; default exports for components
- Never use `any` type — always define proper types
- All components and hooks must have a co-located `.test.tsx` / `.test.ts` file
- Feature public API exposed only through `features/{name}/index.ts`
- Use `src/config/constants.ts` for all magic numbers (pressure thresholds, etc.)

## Build Order
F01 (data layer) → F02 (weather) → F03 (log headache) → F04 (history) → F05 (pressure display) → F06 (insights) → F10 (dashboard)

## Do Not
- Do not use class components
- Do not use Redux (use Zustand)
- Do not use CSS Modules (use Tailwind)
- Do not import `process.env` directly — use `src/config/env.ts`
- Do not commit or push to git without asking me first. No automatic updates.

## Later Phase
- Add pain location (body map), stiffness in limbs (see FEATURES.md for backlog)
