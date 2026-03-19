import { differenceInDays } from 'date-fns'
import type { HeadacheEntry, TriggerTag } from '@/types/headache'
import type { CorrelationResult, PressureBucket, WeatherFactorCorrelation } from '@/types/prediction'

const NUM_BUCKETS = 6

const BUCKET_DEFINITIONS: Array<{ label: string; min: number; max: number }> = [
  { label: '< −6 hPa', min: -Infinity, max: -6 },
  { label: '−6 to −3 hPa', min: -6, max: -3 },
  { label: '−3 to 0 hPa', min: -3, max: 0 },
  { label: '0 to +3 hPa', min: 0, max: 3 },
  { label: '+3 to +6 hPa', min: 3, max: 6 },
  { label: '> +6 hPa', min: 6, max: Infinity },
]

function mean(values: number[]): number {
  return values.reduce((sum, v) => sum + v, 0) / values.length
}

function pearsonR(xs: number[], ys: number[]): number {
  if (xs.length < 3) return 0
  const xBar = mean(xs)
  const yBar = mean(ys)
  let sumXY = 0
  let sumXX = 0
  let sumYY = 0
  for (let i = 0; i < xs.length; i++) {
    const dx = xs[i] - xBar
    const dy = ys[i] - yBar
    sumXY += dx * dy
    sumXX += dx * dx
    sumYY += dy * dy
  }
  const denominator = Math.sqrt(sumXX * sumYY)
  if (denominator === 0) return 0
  return sumXY / denominator
}

function strengthFromR(r: number): WeatherFactorCorrelation['strength'] {
  const abs = Math.abs(r)
  if (abs >= 0.5) return 'strong'
  if (abs >= 0.3) return 'moderate'
  if (abs >= 0.1) return 'weak'
  return 'none'
}

function directionFromR(r: number): WeatherFactorCorrelation['direction'] {
  if (r > 0) return 'positive'
  if (r < 0) return 'negative'
  return 'none'
}

export function computeCorrelation(entries: HeadacheEntry[]): CorrelationResult {
  const weatherEntries = entries.filter((e) => e.weather !== null)

  // Pearson R: |pressure delta| vs severity
  const xsMag = weatherEntries.map((e) => Math.abs(e.weather!.trendDeltaHpa))
  const ysSev = weatherEntries.map((e) => e.severity)
  const computedR = pearsonR(xsMag, ysSev)

  // Date span
  let totalDaySpan = 1
  if (entries.length >= 2) {
    const timestamps = entries.map((e) => e.timestamp)
    const minTs = Math.min(...timestamps)
    const maxTs = Math.max(...timestamps)
    totalDaySpan = Math.max(differenceInDays(new Date(maxTs), new Date(minTs)), 1)
  }

  const baselineHeadacheRate = entries.length / totalDaySpan

  // Pressure buckets
  // relativeRisk: (bucketCount * NUM_BUCKETS) / totalEntries
  // This gives 1.0 for uniform distribution, > 1.5 for elevated risk
  const pressureBuckets: PressureBucket[] = BUCKET_DEFINITIONS.map(({ label, min, max }) => {
    const bucketEntries = weatherEntries.filter((e) => {
      const delta = e.weather!.trendDeltaHpa
      return delta >= min && delta < max
    })
    const headacheCount = bucketEntries.length
    const totalDays = Math.max(Math.round(totalDaySpan / NUM_BUCKETS), 1)
    const headacheRate = headacheCount / totalDaySpan
    const relativeRisk =
      entries.length === 0
        ? 0
        : (headacheCount * NUM_BUCKETS) / Math.max(entries.length, 1)

    return {
      rangeLabel: label,
      minDelta: min,
      maxDelta: max,
      headacheCount,
      totalDays,
      headacheRate,
      relativeRisk,
    }
  })

  // dominantTrigger: compare max relativeRisk in drop vs rise buckets
  const dropBuckets = pressureBuckets.slice(0, 3) // < 0 deltas
  const riseBuckets = pressureBuckets.slice(3)     // >= 0 deltas
  const maxDropRisk = Math.max(...dropBuckets.map((b) => b.relativeRisk))
  const maxRiseRisk = Math.max(...riseBuckets.map((b) => b.relativeRisk))

  let dominantTrigger: CorrelationResult['dominantTrigger'] = 'none'
  const dropElevated = maxDropRisk >= 1.5
  const riseElevated = maxRiseRisk >= 1.5
  if (dropElevated && riseElevated) dominantTrigger = 'both'
  else if (dropElevated) dominantTrigger = 'drop'
  else if (riseElevated) dominantTrigger = 'rise'

  // Trigger weights: proportion of entries with each trigger tag
  const allTags: TriggerTag[] = [
    'poor-sleep', 'dehydration', 'screen-time', 'stress', 'manual',
  ]
  const triggerWeights: Partial<Record<TriggerTag, number>> = {}
  for (const tag of allTags) {
    const count = entries.filter((e) => e.triggers?.includes(tag)).length
    if (count > 0) {
      triggerWeights[tag] = count / Math.max(entries.length, 1)
    }
  }

  // Weather factor correlations: temperature, aqi, humidity, wind vs severity
  type FactorKey = WeatherFactorCorrelation['factor']
  const factors: FactorKey[] = ['temperature', 'aqi', 'wind', 'humidity']
  const factorCorrelations: WeatherFactorCorrelation[] = factors.map((factor) => {
    const pairs: Array<{ x: number; y: number }> = []
    for (const e of weatherEntries) {
      const w = e.weather!
      let x: number | null | undefined = null
      if (factor === 'temperature') x = w.temperature
      else if (factor === 'aqi') x = w.airQualityIndex ?? null
      else if (factor === 'wind') x = w.windSpeed
      else if (factor === 'humidity') x = w.humidity
      if (x != null) {
        pairs.push({ x, y: e.severity })
      }
    }
    const r = pearsonR(pairs.map((p) => p.x), pairs.map((p) => p.y))
    return {
      factor,
      pearsonR: r,
      strength: strengthFromR(r),
      direction: pairs.length >= 3 ? directionFromR(r) : 'none',
      sampleSize: pairs.length,
    }
  })

  return {
    pearsonR: computedR,
    pressureBuckets,
    baselineHeadacheRate,
    dominantTrigger,
    triggerWeights,
    dataWindowDays: totalDaySpan,
    entryCount: entries.length,
    entriesWithWeather: weatherEntries.length,
    factorCorrelations,
  }
}
