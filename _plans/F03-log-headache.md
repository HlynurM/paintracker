# F03 — Log Headache Entry: Implementation Plan

## Context

F03 is the core user action — logging a headache. The data layer (F01) and weather feature (F02) are done. The headache service (`createHeadacheEntry`) is implemented. What's missing is the hook, the UI components, and the weather initializer that makes weather available app-wide.

The log page (`/log`) currently shows a stub. After this feature, it renders a fully functional form.

---

## Files to Create

### 1. `src/config/constants.ts` — add one constant
```ts
export const DEBOUNCE_GUARD_MS = 1000
```

---

### 2. `src/features/headache/hooks/useHeadacheLog.ts`
The central integration point. Owns: debounce guard, store read at submit time, repository write, isSubmitting/error state.

Key logic:
- `const lastSavedAt = useRef<number | null>(null)` — debounce state
- Read weather at action time (not as a subscription): `useWeatherStore.getState().currentWeather`
- Call `createHeadacheEntry(data, currentWeather)` then `saveHeadacheEntry(entry)`
- On success: update `lastSavedAt.current`, resolve normally
- On error: set `error`, re-throw so the form can skip `reset()`
- Debounce check at top of `logHeadache`: if `Date.now() - lastSavedAt.current < DEBOUNCE_GUARD_MS`, return silently

Returns: `{ logHeadache, isSubmitting, error }`

> Why `getState()` not a selector subscription: The hook does not need to re-render when weather changes. Value is only needed at the moment of submit. This is standard Zustand for "read once at action time."

---

### 3. `src/features/headache/hooks/useHeadacheLog.test.ts`
Uses `renderHook` + `act`. Mocks: `saveHeadacheEntry` (vi.mock), `useWeatherStore.getState` (vi.mock).

Scenarios:
- Happy path → `saveHeadacheEntry` called once, `isSubmitting` → false, no error
- Weather null → save still called, entry has `weather: null`
- Double-submit within 1s → `saveHeadacheEntry` called exactly once
- Save throws → `error` is set, promise rejects
- Boundary severity 1 → succeeds
- Boundary severity 5 → succeeds

---

### 4. `src/features/headache/services/headacheService.test.ts`
Pure function tests — no mocks needed.

Scenarios:
- Valid input → entry has correct severity, UUID, timestamp within 100ms
- Severity 0 or 6 → throws `RangeError`
- Notes `'   '` → entry has `notes: undefined`
- `currentWeather: null` → entry has `weather: null`, no throw
- Returned `weather` is a copy (not the same reference as input)

---

### 5. `src/features/headache/components/SeveritySlider.tsx`
Props: `{ value: number; onChange: (value: number) => void }`

- `<input type="range" min={1} max={5} step={1} />` — parse `e.target.value` to integer before calling onChange
- Show label from `SEVERITY_LABELS[value]` (e.g. "3 — Significant")
- Default export (component convention)

---

### 6. `src/features/headache/components/SeveritySlider.test.tsx`
- Renders correct label for value 3 ("Significant")
- Changing slider calls onChange with an integer, not a string
- Boundary: value 1 → "Mild", value 5 → "Debilitating"

---

### 7. `src/features/headache/components/TriggerTagPicker.tsx`
Props: `{ selected: TriggerTag[]; onChange: (tags: TriggerTag[]) => void }`

- Define `ALL_TRIGGER_TAGS: TriggerTag[]` as a local constant (union types aren't iterable at runtime)
- One `<button type="button">` per tag with toggle logic (add/remove from selected array)
- Visual distinction for selected vs unselected tags
- Default export

---

### 8. `src/features/headache/components/TriggerTagPicker.test.tsx`
- All 7 tags render
- Clicking unselected tag → onChange called with tag added
- Clicking selected tag → onChange called with tag removed

---

### 9. `src/features/headache/components/HeadacheForm.tsx`
`'use client'` — the form root.

- `react-hook-form` + `standardSchemaResolver` (Zod v4 compatible — `@hookform/resolvers/standard-schema`) with Zod schema co-located:
  ```ts
  const schema = z.object({
    severity: z.number().int().min(1).max(5),
    notes: z.string().optional(),
    triggers: z.array(z.enum([...ALL_TRIGGER_TAGS])).optional(),
  })
  ```
- Default values: `{ severity: 3, notes: '', triggers: [] }`
- `SeveritySlider` and `TriggerTagPicker` wired via `Controller` (non-native inputs)
- `<textarea>` for notes via `register('notes')`
- Submit handler:
  ```ts
  async function onSubmit(data) {
    try {
      await logHeadache(data)
      reset({ severity: 3, notes: '', triggers: [] }) // only on success
    } catch { /* error already in hook state, skip reset */ }
  }
  ```
- Submit button: `disabled={isSubmitting}` — text "Log Headache" / "Saving..."
- Error: `{error && <p role="alert">{error}</p>}`
- Default export

> **Note:** `@hookform/resolvers` v5 dropped the `/zod` export. Use `standardSchemaResolver` from `@hookform/resolvers/standard-schema` — Zod v4 implements the Standard Schema spec.

---

### 10. `src/features/headache/components/HeadacheForm.test.tsx`
Mock pattern — control hook return values per test via a shared mutable object:
```ts
const hookReturn = { logHeadache: mockFn, isSubmitting: false, error: null }
vi.mock('../hooks/useHeadacheLog', () => ({ useHeadacheLog: () => hookReturn }))
```

Scenarios:
- Slider defaults to 3, label shows "Significant"
- Submit fires `logHeadache` with correct severity value
- After successful submit → severity resets to 3, notes cleared
- Submit button is disabled when `isSubmitting: true`
- Error renders in `role="alert"` when `error` is set
- Form NOT reset when `logHeadache` rejects (notes value preserved)

---

### 11. `src/components/layout/WeatherInitializer.tsx` (new)
```tsx
'use client'
import { useWeather } from '@/features/weather'
export default function WeatherInitializer() {
  useWeather()
  return null
}
```
Starts the weather fetch+interval for the entire `(app)` route group. Renders nothing.

---

## Files to Modify

### 12. `src/app/(app)/layout.tsx`
Add `<WeatherInitializer />` as a child of AppShell so weather fetches on app load:
```tsx
import WeatherInitializer from '@/components/layout/WeatherInitializer'
// ...
<AppShell>
  <WeatherInitializer />
  {children}
</AppShell>
```

---

### 13. `src/app/(app)/log/page.tsx`
Replace stub with the form. Page stays a Server Component:
```tsx
import HeadacheForm from '@/features/headache/components/HeadacheForm'
export default function LogPage() {
  return (
    <div className="p-4">
      <h1 className="mb-4 text-xl font-semibold">Log Headache</h1>
      <HeadacheForm />
    </div>
  )
}
```

---

### 14. `src/features/headache/index.ts`
Add new public exports:
```ts
export { useHeadacheLog } from './hooks/useHeadacheLog'
export { default as HeadacheForm } from './components/HeadacheForm'
```
`SeveritySlider` and `TriggerTagPicker` are internal — not exported from the public index.

---

## Architectural Decisions

| Decision | Choice | Why |
|---|---|---|
| Debounce location | Hook (`useRef`) not service | Services are pure functions; debounce requires mutable state across calls |
| Weather read method | `useWeatherStore.getState()` at call time | Avoids unnecessary re-renders when weather updates; value only needed at submit |
| Error + form reset | Hook re-throws; component skips `reset()` in catch | Hook owns error state; component owns form state — clean boundary |
| Weather initialization | `WeatherInitializer` client component in `(app)/layout` | Layout must stay a Server Component; this is the minimal `'use client'` boundary |
| shadcn/ui | Not used for F03 | `src/components/ui/` is empty; plain HTML + Tailwind is sufficient for this form |
| Zod schema location | Co-located in `HeadacheForm.tsx` | Not shared; belongs with the one form that uses it |
| Resolver | `standardSchemaResolver` from `@hookform/resolvers/standard-schema` | `@hookform/resolvers` v5 dropped `/zod`; Zod v4 uses Standard Schema spec |

---

## Verification

1. Run `pnpm dev` — navigate to `/log`, confirm form renders with slider, notes, trigger tags, submit button
2. Submit a headache — verify entry appears in IndexedDB (DevTools → Application → IndexedDB → PainTrackerDB → headacheEntries)
3. Submit twice rapidly — second submit should be ignored (check count in IndexedDB)
4. Submit while weather is unavailable (offline or before first fetch) — form should still save
5. Run `pnpm test:run` — all new test files should pass
6. Run `npx tsc --noEmit` and check for zero `src/` errors
