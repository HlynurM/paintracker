# Data Model — PainTracker

## Source of Truth

Local-first: Dexie.js (IndexedDB) is the primary store.
Supabase mirrors data for cloud backup and future multi-device support.

---

## TypeScript Types  (`src/types/`)

### HeadacheEntry  (`types/headache.ts`)
```ts
type HeadacheSeverity = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

interface HeadacheEntry {
  id: string                    // UUID
  timestamp: number             // Unix ms
  severity: HeadacheSeverity
  notes?: string
  weather: WeatherSnapshot       // Captured at log time — immutable
  triggers?: TriggerTag[]
  durationMinutes?: number
}

type TriggerTag =
  | 'pressure-drop'
  | 'pressure-rise'
  | 'poor-sleep'
  | 'dehydration'
  | 'screen-time'
  | 'manual'
```

### WeatherData  (`types/weather.ts`)
```ts
type PressureTrend = 'rising' | 'falling' | 'stable'

interface WeatherData {
  timestamp: number
  pressure: number              // hPa
  temperature: number           // °C
  humidity: number              // %
  windSpeed: number             // km/h
  airQualityIndex?: number      // AQI (future)
  trend: PressureTrend
  trendDeltaHpa: number         // change over last 3h
}

// Snapshot captured at headache-log time — never changes
type WeatherSnapshot = Readonly<WeatherData>
```

### SleepRecord  (`types/sleep.ts`)
```ts
type SleepSource = 'manual' | 'samsung-health'

interface SleepRecord {
  id: string
  date: string                  // ISO date: "2026-03-04"
  durationMinutes: number
  quality: 1 | 2 | 3 | 4 | 5   // 1=very poor, 5=excellent
  source: SleepSource
}
```

---

## Dexie Schema  (`src/db/schema.ts`)

```ts
// Database version history — increment on every schema change
// v1: initial tables
// v2: add durationMinutes to headacheEntries (example)

const SCHEMA_V1 = {
  headacheEntries: '++id, timestamp, severity',
  weatherReadings: '++id, timestamp',
  sleepRecords: '++id, date',
}
```

**Index strategy:**
- `headacheEntries`: index `timestamp` for time-range queries, `severity` for filtering
- `weatherReadings`: index `timestamp` for pressure-history queries
- `sleepRecords`: index `date` (unique) for daily lookup

---

## Repositories  (`src/db/repositories/`)

Each repository has exactly four operations. Add more only when the UI genuinely requires it.

### headacheRepository
```ts
save(entry: HeadacheEntry): Promise<void>
getAll(): Promise<HeadacheEntry[]>
getRange(from: number, to: number): Promise<HeadacheEntry[]>  // timestamps
delete(id: string): Promise<void>
```

### weatherRepository
```ts
save(data: WeatherData): Promise<void>
getLatest(): Promise<WeatherData | undefined>
getRange(from: number, to: number): Promise<WeatherData[]>
prune(olderThanMs: number): Promise<void>   // keep DB lean
```

### sleepRepository
```ts
save(record: SleepRecord): Promise<void>
getByDate(date: string): Promise<SleepRecord | undefined>
getRange(from: string, to: string): Promise<SleepRecord[]>
delete(id: string): Promise<void>
```

---

## Supabase Tables  (`sync/`)

Mirror of Dexie. All columns nullable where client may not have value yet.

| Table | Columns |
|---|---|
| `headache_entries` | id, user_id, timestamp, severity, notes, weather (jsonb), triggers (text[]), duration_minutes, synced_at |
| `weather_readings` | id, user_id, timestamp, pressure, temperature, humidity, wind_speed, aqi, trend, trend_delta_hpa |
| `sleep_records` | id, user_id, date, duration_minutes, quality, source |

**Sync rules:**
- Client writes locally first, queues a sync job
- Supabase is append/upsert only — no deletes propagate automatically
- Conflict resolution: latest `synced_at` wins

---

## Data Lifecycle

```
Weather API (every 15min)
  → weatherRepository.save()
  → prune readings older than 90 days

User logs headache
  → capture current WeatherData as WeatherSnapshot
  → headacheRepository.save()
  → schedule sync

Daily
  → correlationEngine reads headache + weather ranges
  → produces InsightSummary (not persisted, computed on demand)
```

---

## Pressure Thresholds  (`src/config/constants.ts`)

```ts
// Risk levels based on 3-hour delta
PRESSURE_THRESHOLDS = {
  LOW_RISK:    { delta: 0,    label: 'stable' },
  MEDIUM_RISK: { delta: 3,    label: 'moderate change' },  // ±3 hPa
  HIGH_RISK:   { delta: 6,    label: 'significant change' } // ±6 hPa
}
```

---

## Schema Migration Rules

- **Never mutate existing column types** — add new columns or new tables only
- Each migration lives in `db/migrations/vN.ts` and is applied in `db/db.ts` upgrade callbacks
- Test migrations with a fixture database before merging
