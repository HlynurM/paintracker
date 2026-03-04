// ─── Sleep Types ──────────────────────────────────────────────────────────────
// Not part of the MVP but defined here now so the data model is consistent
// from the start. Better to define types early than retrofit them.

export type SleepSource = 'manual' | 'samsung-health'

export interface SleepRecord {
  id: string
  date: string                  // ISO date string: "2026-03-04"
  durationMinutes: number
  quality: 1 | 2 | 3 | 4 | 5   // 1 = very poor, 5 = excellent
  source: SleepSource
}
