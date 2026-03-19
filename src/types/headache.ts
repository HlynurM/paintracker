// ─── Headache Types ───────────────────────────────────────────────────────────

import type { WeatherSnapshot } from './weather'

// Severity on a 1–5 scale.
// 1 = Mild, 2 = Moderate, 3 = Significant, 4 = Severe, 5 = Debilitating
export type HeadacheSeverity = 1 | 2 | 3 | 4 | 5

// Tags the user can apply to explain a potential trigger.
// Note: pressure-drop and pressure-rise are NOT user tags — the weather snapshot
// (trendDeltaHpa, trend) already encodes pressure context automatically at log time.
export type TriggerTag =
  | 'poor-sleep'
  | 'dehydration'
  | 'screen-time'
  | 'stress'
  | 'manual'

// The main entity — one logged headache event.
export interface HeadacheEntry {
  id: string                         // UUID generated on the client
  timestamp: number                  // Unix ms (Date.now() at submit time)
  severity: HeadacheSeverity
  notes?: string
  weather: WeatherSnapshot | null    // null if weather was unavailable at log time
  triggers?: TriggerTag[]
  durationMinutes?: number           // optional, filled in later
}

// What the user submits in the form — weather, id, and timestamp are added by the service.
export type HeadacheFormData = Pick<HeadacheEntry, 'severity' | 'notes' | 'triggers'>
