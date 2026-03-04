// ─── Headache Types ───────────────────────────────────────────────────────────
// These are the core domain types for the headache feature.
// Every other part of the app that touches headache data uses these — never
// redefine them elsewhere.

import type { WeatherSnapshot } from './weather'

// A branded number type so TypeScript prevents passing a plain `number`
// where a severity is expected. Range: 1–10.
export type HeadacheSeverity = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

// Tags the user can apply to explain a potential trigger.
// Using a union type instead of a free string keeps data clean and queryable.
export type TriggerTag =
  | 'pressure-drop'
  | 'pressure-rise'
  | 'poor-sleep'
  | 'dehydration'
  | 'screen-time'
  | 'stress'
  | 'manual' // user added a custom note instead

// The main entity — one logged headache event.
export interface HeadacheEntry {
  id: string                    // UUID generated on the client
  timestamp: number             // Unix milliseconds (Date.now())
  severity: HeadacheSeverity
  notes?: string
  weather: WeatherSnapshot      // Weather at the exact moment of logging — frozen
  triggers?: TriggerTag[]
  durationMinutes?: number      // Optional: filled in later
}

// What the user submits in the form — weather gets added by the service,
// id and timestamp get generated automatically.
export type HeadacheFormData = Pick<HeadacheEntry, 'severity' | 'notes' | 'triggers'>
