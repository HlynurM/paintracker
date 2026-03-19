// ─── Dev Seed Utility ─────────────────────────────────────────────────────────
// Populates IndexedDB with ~60 days of realistic test data so the prediction
// engine (F06) can be exercised in the browser.
// This file is imported only from dev-guarded UI — never in production paths.

import { saveHeadacheEntry } from '@/db/repositories/headacheRepository'
import { saveWeatherReading } from '@/db/repositories/weatherRepository'
import { saveSleepRecord } from '@/db/repositories/sleepRepository'
import { saveRemedyEntry } from '@/db/repositories/remedyRepository'
import { db } from '@/db/db'
import type { HeadacheEntry, HeadacheSeverity, TriggerTag } from '@/types/headache'
import type { WeatherData, PressureTrend } from '@/types/weather'
import type { SleepRecord } from '@/types/sleep'
import type { RemedyEntry, RemedyTag } from '@/types/remedy'

export interface SeedResult {
  headaches: number
  weather: number
  sleep: number
  remedies: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uuid(): string {
  return crypto.randomUUID()
}

/** Return a Unix-ms timestamp for `daysAgo` days before now, optionally offset by hours. */
function daysAgoMs(daysAgo: number, hoursOffset = 0): number {
  const now = Date.now()
  return now - daysAgo * 24 * 60 * 60 * 1000 + hoursOffset * 60 * 60 * 1000
}

/** ISO date string (YYYY-MM-DD) for `daysAgo` days before today. */
function isoDate(daysAgo: number): string {
  const d = new Date(daysAgoMs(daysAgo))
  return d.toISOString().slice(0, 10)
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val))
}

// ─── Weather seed ─────────────────────────────────────────────────────────────

/**
 * Build 62 daily weather readings spanning days 62 → 0 (today).
 * Four drop events, two rise events, stable elsewhere.
 * Includes air quality spikes around days 35 and 55.
 */
function buildWeatherReadings(): WeatherData[] {
  const readings: WeatherData[] = []

  // Pressure schedule — indexed by daysAgo (0 = today, 62 = oldest)
  // We work oldest → newest so we can compute delta vs previous reading.

  // Drop events: daysAgo 7–9, 14–16, 28–30, 43–45
  // Rise events: daysAgo 20–22, 52–54
  const dropDays = new Set([7, 8, 9, 14, 15, 16, 28, 29, 30, 43, 44, 45])
  const riseDays = new Set([20, 21, 22, 52, 53, 54])
  // Dusty days: around 35 and 55
  const dustyDays = new Set([33, 34, 35, 36, 53, 54, 55])

  let pressure = 1013
  // Previous pressure 3h ago — simulate with a small carry-over
  let prevPressure = 1013

  // Build oldest → newest (daysAgo 62 down to 0)
  for (let daysAgo = 62; daysAgo >= 0; daysAgo--) {
    let deltaPressure: number
    let trend: PressureTrend

    if (dropDays.has(daysAgo)) {
      // −4 to −8 hPa on drop days
      deltaPressure = -(4 + Math.round(Math.random() * 4))
      trend = 'falling'
    } else if (riseDays.has(daysAgo)) {
      // +3 to +6 hPa on rise days
      deltaPressure = 3 + Math.round(Math.random() * 3)
      trend = 'rising'
    } else {
      // Stable: −1 to +1
      deltaPressure = Math.round((Math.random() * 2 - 1) * 10) / 10
      trend = 'stable'
    }

    pressure = clamp(pressure + deltaPressure, 995, 1030)
    const trendDeltaHpa = parseFloat((pressure - prevPressure).toFixed(1))

    const airQualityIndex = dustyDays.has(daysAgo)
      ? 60 + Math.round(Math.random() * 20) // 60–80
      : 15 + Math.round(Math.random() * 30) // 15–45

    readings.push({
      timestamp: daysAgoMs(daysAgo, 9), // recorded at 09:00 each day
      pressure: parseFloat(pressure.toFixed(1)),
      temperature: 18 + Math.round(Math.random() * 10),
      humidity: 55 + Math.round(Math.random() * 30),
      windSpeed: 5 + Math.round(Math.random() * 20),
      airQualityIndex,
      trend,
      trendDeltaHpa,
    })

    prevPressure = pressure
  }

  return readings
}

// ─── Headache seed ────────────────────────────────────────────────────────────

interface HeadacheSpec {
  daysAgo: number
  hoursOffset?: number
  severity: HeadacheSeverity
  triggers: TriggerTag[]
  notes?: string
  trendDeltaHpa: number
  trend: PressureTrend
  pressure?: number
  durationMinutes?: number
}

const headacheSpecs: HeadacheSpec[] = [
  // ── Drop cluster 1: days 7–9 ──────────────────────────────────────────
  { daysAgo: 7,  severity: 4, triggers: [], trendDeltaHpa: -5.2, trend: 'falling', pressure: 1006, durationMinutes: 180 },
  { daysAgo: 8,  severity: 5, triggers: [], trendDeltaHpa: -6.8, trend: 'falling', pressure: 1001, durationMinutes: 240, notes: 'Very severe — had to lie down' },
  // Near-duplicate of day 8 — 1 hour later, lower severity (edge case: duplicate guard)
  { daysAgo: 8,  hoursOffset: 1, severity: 2, triggers: [], trendDeltaHpa: -6.8, trend: 'falling', pressure: 1001 },
  { daysAgo: 9,  severity: 3, triggers: [], trendDeltaHpa: -4.1, trend: 'falling', pressure: 999, durationMinutes: 120 },

  // ── Drop cluster 2: days 14–16 ────────────────────────────────────────
  { daysAgo: 14, severity: 4, triggers: [], trendDeltaHpa: -5.5, trend: 'falling', pressure: 1005, durationMinutes: 150 },
  { daysAgo: 15, severity: 5, triggers: ['poor-sleep'], trendDeltaHpa: -7.2, trend: 'falling', pressure: 999, durationMinutes: 300, notes: 'Slept badly the night before' },
  { daysAgo: 16, severity: 3, triggers: [], trendDeltaHpa: -4.8, trend: 'falling', pressure: 997, durationMinutes: 90 },

  // ── Rise-triggered entries ────────────────────────────────────────────
  { daysAgo: 21, severity: 2, triggers: [], trendDeltaHpa: 4.3, trend: 'rising', pressure: 1018 },
  { daysAgo: 22, severity: 3, triggers: [], trendDeltaHpa: 5.1, trend: 'rising', pressure: 1021, durationMinutes: 60 },

  // ── Mild/stable entries ───────────────────────────────────────────────
  { daysAgo: 24, severity: 1, triggers: ['stress'], trendDeltaHpa: 0.2, trend: 'stable', pressure: 1015 },
  { daysAgo: 26, severity: 2, triggers: ['dehydration'], trendDeltaHpa: -0.5, trend: 'stable', pressure: 1013 },
  { daysAgo: 31, severity: 1, triggers: ['screen-time'], trendDeltaHpa: 0.8, trend: 'stable', pressure: 1014 },
  { daysAgo: 33, severity: 2, triggers: ['stress', 'dehydration'], trendDeltaHpa: 0.3, trend: 'stable', pressure: 1012 },

  // ── Drop cluster 3: days 28–30 ────────────────────────────────────────
  { daysAgo: 28, severity: 3, triggers: [], trendDeltaHpa: -4.4, trend: 'falling', pressure: 1004, durationMinutes: 120 },
  { daysAgo: 29, severity: 4, triggers: [], trendDeltaHpa: -5.9, trend: 'falling', pressure: 1000, durationMinutes: 200 },

  // ── Extreme delta outlier: day 35 (IQR outlier, far below floor) ──────
  { daysAgo: 35, severity: 4, triggers: [], trendDeltaHpa: -16.0, trend: 'falling', pressure: 996, durationMinutes: 240, notes: 'Sudden storm' },

  // ── More mild/stable ──────────────────────────────────────────────────
  { daysAgo: 37, severity: 1, triggers: ['screen-time'], trendDeltaHpa: 0.1, trend: 'stable', pressure: 1013 },
  { daysAgo: 39, severity: 2, triggers: ['dehydration'], trendDeltaHpa: -0.3, trend: 'stable', pressure: 1012 },

  // ── Isolated severity-5 during stable weather (day 40) — adds noise ───
  { daysAgo: 40, severity: 5, triggers: ['stress'], trendDeltaHpa: 0.4, trend: 'stable', pressure: 1014, durationMinutes: 360, notes: 'Very stressful day at work' },

  // ── Extreme delta rise outlier: day 51 ───────────────────────────────
  { daysAgo: 51, severity: 3, triggers: [], trendDeltaHpa: 14.0, trend: 'rising', pressure: 1028, notes: 'Rapid pressure surge' },

  // ── Drop cluster 4: days 43–45 ────────────────────────────────────────
  { daysAgo: 43, severity: 4, triggers: [], trendDeltaHpa: -5.1, trend: 'falling', pressure: 1005, durationMinutes: 180 },
  { daysAgo: 44, severity: 5, triggers: ['poor-sleep'], trendDeltaHpa: -6.6, trend: 'falling', pressure: 1000, durationMinutes: 270, notes: 'Woke up with it' },
  { daysAgo: 45, severity: 3, triggers: [], trendDeltaHpa: -4.2, trend: 'falling', pressure: 998, durationMinutes: 90 },

  // ── Rise cluster 2 ────────────────────────────────────────────────────
  { daysAgo: 53, severity: 2, triggers: [], trendDeltaHpa: 4.8, trend: 'rising', pressure: 1020 },
  { daysAgo: 54, severity: 3, triggers: [], trendDeltaHpa: 5.3, trend: 'rising', pressure: 1023, durationMinutes: 75 },

  // ── Mild/stable continued ─────────────────────────────────────────────
  { daysAgo: 47, severity: 2, triggers: ['stress'], trendDeltaHpa: -0.7, trend: 'stable', pressure: 1011 },
  { daysAgo: 49, severity: 1, triggers: ['screen-time'], trendDeltaHpa: 0.5, trend: 'stable', pressure: 1013 },

  // ── No-weather entries ────────────────────────────────────────────────
  { daysAgo: 55, severity: 2, triggers: ['stress'],       trendDeltaHpa: 0, trend: 'stable', pressure: 1013 },
  { daysAgo: 57, severity: 3, triggers: ['dehydration'],  trendDeltaHpa: 0, trend: 'stable', pressure: 1012 },
  { daysAgo: 59, severity: 2, triggers: ['stress'],       trendDeltaHpa: 0, trend: 'stable', pressure: 1014 },
  { daysAgo: 61, severity: 3, triggers: ['dehydration'],  trendDeltaHpa: 0, trend: 'stable', pressure: 1013 },

  // ── Recent mild entries ───────────────────────────────────────────────
  { daysAgo: 3,  severity: 2, triggers: ['screen-time'],  trendDeltaHpa: -0.4, trend: 'stable', pressure: 1012 },
  { daysAgo: 1,  severity: 1, triggers: ['stress'],       trendDeltaHpa: 0.2,  trend: 'stable', pressure: 1014 },
]

// No-weather entries (last 4 above) should have weather: null
const noWeatherDays = new Set([55, 57, 59, 61])

function buildHeadacheEntries(): HeadacheEntry[] {
  return headacheSpecs.map((spec) => {
    const ts = daysAgoMs(spec.daysAgo, spec.hoursOffset ?? 14) // default 14:00

    const hasWeather = !noWeatherDays.has(spec.daysAgo)

    const weather = hasWeather
      ? {
          timestamp: ts,
          pressure: spec.pressure ?? 1013,
          temperature: 20,
          humidity: 65,
          windSpeed: 10,
          trend: spec.trend,
          trendDeltaHpa: spec.trendDeltaHpa,
        }
      : null

    return {
      id: uuid(),
      timestamp: ts,
      severity: spec.severity,
      notes: spec.notes,
      weather,
      triggers: spec.triggers,
      durationMinutes: spec.durationMinutes,
    }
  })
}

// ─── Sleep seed ───────────────────────────────────────────────────────────────

/** Poor-sleep nights are the night before a major drop cluster. */
const poorSleepDays = new Set([6, 13, 27, 42]) // night before cluster starts
const goodSleepDays = new Set([23, 24, 25, 26, 35, 36, 37, 38])
// Gaps — no record on these days (~8 gaps)
const sleepGapDays = new Set([10, 17, 32, 46, 50, 56, 60, 62])

function buildSleepRecords(): SleepRecord[] {
  const records: SleepRecord[] = []

  for (let daysAgo = 61; daysAgo >= 1; daysAgo--) {
    if (sleepGapDays.has(daysAgo)) continue

    let quality: 1 | 2 | 3 | 4 | 5
    let durationMinutes: number

    if (poorSleepDays.has(daysAgo)) {
      quality = Math.random() < 0.5 ? 1 : 2
      durationMinutes = 240 + Math.round(Math.random() * 60) // 240–300
    } else if (goodSleepDays.has(daysAgo)) {
      quality = 5
      durationMinutes = 450 + Math.round(Math.random() * 60) // 450–510
    } else {
      quality = (3 + (Math.random() < 0.5 ? 0 : 1)) as 3 | 4
      durationMinutes = 420 + Math.round(Math.random() * 60) // 420–480
    }

    records.push({
      id: uuid(),
      date: isoDate(daysAgo),
      durationMinutes,
      quality,
      source: 'manual',
    })
  }

  return records
}

// ─── Remedy seed ──────────────────────────────────────────────────────────────

interface RemedySpec {
  tags: RemedyTag[]
  effectivenessRating: 1 | 2 | 3 | 4 | 5
  timeToReliefMinutes?: number
}

function remedySpecForSeverity(severity: HeadacheSeverity): RemedySpec | null {
  // ~50% of entries get a remedy
  if (Math.random() < 0.5) return null

  if (severity >= 4) {
    const usePrescription = Math.random() < 0.4
    return {
      tags: usePrescription
        ? ['medication-prescription', 'rest']
        : ['medication-otc', 'rest'],
      effectivenessRating: (4 + Math.round(Math.random())) as 4 | 5,
      timeToReliefMinutes: [30, 45, 60][Math.floor(Math.random() * 3)],
    }
  }

  if (severity === 3) {
    return {
      tags: ['hydration', 'rest'],
      effectivenessRating: (3 + Math.round(Math.random())) as 3 | 4,
      timeToReliefMinutes: Math.random() < 0.5 ? 20 : 30,
    }
  }

  // Mild (1–2)
  return {
    tags: Math.random() < 0.5 ? ['walk'] : ['stretching'],
    effectivenessRating: (2 + Math.round(Math.random())) as 2 | 3,
  }
}

function buildRemedyEntries(headaches: HeadacheEntry[]): RemedyEntry[] {
  const remedies: RemedyEntry[] = []

  for (const h of headaches) {
    const spec = remedySpecForSeverity(h.severity)
    if (!spec) continue

    remedies.push({
      id: uuid(),
      headacheEntryId: h.id,
      timestamp: h.timestamp + 30 * 60 * 1000, // 30 min after headache logged
      tags: spec.tags,
      effectivenessRating: spec.effectivenessRating,
      timeToReliefMinutes: spec.timeToReliefMinutes,
    })
  }

  return remedies
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function seedTestDatabase(): Promise<SeedResult> {
  const weatherReadings = buildWeatherReadings()
  const headacheEntries = buildHeadacheEntries()
  const sleepRecords = buildSleepRecords()
  const remedyEntries = buildRemedyEntries(headacheEntries)

  // Write all in parallel — each table is independent
  await Promise.all([
    ...weatherReadings.map(saveWeatherReading),
    ...headacheEntries.map(saveHeadacheEntry),
    ...sleepRecords.map(saveSleepRecord),
    ...remedyEntries.map(saveRemedyEntry),
  ])

  return {
    headaches: headacheEntries.length,
    weather: weatherReadings.length,
    sleep: sleepRecords.length,
    remedies: remedyEntries.length,
  }
}

export async function clearAllData(): Promise<void> {
  await Promise.all([
    db.headacheEntries.clear(),
    db.weatherReadings.clear(),
    db.sleepRecords.clear(),
    db.remedies.clear(),
  ])
}
