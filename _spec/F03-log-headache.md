# F03 — Log Headache Entry

> **Status:** in-progress
> **Branch:** spec/f03-log-headache
> **Created:** 2026-03-17
> **Depends on:** F01, F02

---

## Purpose

The primary user action: log a headache event by selecting a severity slider (1–5) and optionally adding notes or trigger tags. The current weather snapshot is captured automatically at submission time so the entry carries the conditions at that exact moment. The entry is persisted to local storage immediately.

---

## Acceptance Criteria

- [ ] A headache can be logged by selecting a severity slider between 1 and 5. Whole numbers.
- [ ] Current weather conditions are automatically attached to the entry at the moment of submission.
- [ ] Notes and trigger tags are optional — the form submits successfully without them.
- [ ] After a successful log, the form resets to its defaults (default severity 3, notes cleared, triggers cleared).
- [ ] The submit button is disabled while a save is in progress, preventing double-submission.
- [ ] If weather data is currently unavailable, the entry is still saved (weather field is left empty — user is not blocked).

---

## Functional Requirements

1. The form collects:
   - `severity` — required, integer 1–5, presented as a slider
   - `notes` — optional, free text
   - `triggers` — optional, multi-select from predefined `TriggerTag` values
2. `timestamp` is set to `Date.now()` at the moment of form submission — it is not editable by the user in this feature.
3. A `WeatherSnapshot` is read from `weatherStore.currentWeather` at submit time and attached to the entry.
4. A UUID is generated client-side (`crypto.randomUUID()`) for the entry `id`.
5. `headacheService.logHeadache(formData)` validates that `severity` is in range 1–5 before saving; throws on invalid input.
6. Duplicate submission within 1 second of the last save is silently rejected (debounce guard in the service).
7. On successful save, the form resets to its default state (severity defaults to 3, notes cleared, triggers cleared).
8. If `weatherStore.currentWeather` is null (weather not yet loaded or failed), the entry is saved with a null/empty weather snapshot — the user is not blocked.
9. Notes with only whitespace are trimmed to an empty string before saving.
10. The form component calls only the `useHeadacheLog` hook — it does not call the service or repository directly.
11. The submit button is disabled while a save is in progress (`isSubmitting: true`).

---

## Data Contracts

### `HeadacheFormData` (user input — what the form submits)

| Field | Type | Required | Notes |
|---|---|---|---|
| `severity` | `HeadacheSeverity` (1–5) | Yes | |
| `notes` | `string` | No | trimmed before save |
| `triggers` | `TriggerTag[]` | No | predefined values only |

### `HeadacheEntry` (persisted to DB)

Extends `HeadacheFormData` plus fields added by the service:

| Field | Type | Source |
|---|---|---|
| `id` | `string` | `crypto.randomUUID()` |
| `timestamp` | `number` | `Date.now()` at submit |
| `weather` | `WeatherSnapshot` | `weatherStore.currentWeather` at submit time |

### `useHeadacheLog` hook output

| Field | Type | Notes |
|---|---|---|
| `logHeadache(data)` | `(data: HeadacheFormData) => Promise<void>` | |
| `isSubmitting` | `boolean` | true during save |
| `error` | `string \| null` | set if save fails |

### Available `TriggerTag` values

`'pressure-drop'` | `'pressure-rise'` | `'poor-sleep'` | `'dehydration'` | `'screen-time'` | `'stress'` | `'manual'`

---

## Edge Cases

- `weatherStore.currentWeather` is null → entry is saved with null weather; no error is thrown or shown to the user. Allow retry from API history?
- User taps submit twice rapidly (within 1 second) → second call is silently dropped; only one entry is saved.
- Severity slider at boundary values (1 and 5) → both must submit successfully.
- Notes field contains only spaces or newlines → trimmed to `''` before saving (treated as no notes).
- Form submitted while offline → save to Dexie succeeds (local-first); Supabase sync is queued for later (F09).
- Save throws an unexpected error → `error` is set in the hook; form is not reset; user can retry.

---

## Out of Scope

- Editing an existing entry — handled in F04.
- `durationMinutes` field — not in the MVP form; can be added later.
- Custom trigger tag creation — only predefined `TriggerTag` union values for MVP.
- User-selectable date/time override for the entry timestamp.
- Success toast or confirmation message beyond form reset (can add in F10 dashboard layer).

---

## Test Guidelines

- **Layer:** unit for `headacheService`; component test for `HeadacheForm`
- **Key scenarios — `headacheService`:**
  - Valid input → entry saved with correct UUID, timestamp within ~100ms of call, weather snapshot attached
  - Severity `0` or `6` → throws a validation error; nothing is saved
  - Notes `'   '` → saved entry has `notes: ''`
  - Second call within 1 second of first → second save does not occur (count stays at 1)
  - `currentWeather` null → entry saved successfully with null weather; no error thrown
- **Key scenarios — `HeadacheForm` component:**
  - Slider defaults to 3 on mount
  - Submitting fires `logHeadache` with the correct severity value
  - After successful submit, severity resets to 3 and notes field clears
  - Submit button is disabled while `isSubmitting` is true
  - Error state renders an error message when `error` is set
- **Do NOT test:**
  - Dexie internals (trust repository)
  - UUID uniqueness (trust `crypto.randomUUID`)
  - CSS or visual layout of the slider
