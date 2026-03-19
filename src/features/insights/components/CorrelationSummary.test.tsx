import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import CorrelationSummary from './CorrelationSummary'
import type { CorrelationResult, ConfidenceScore } from '@/types/prediction'

function makeCorrelation(overrides: Partial<CorrelationResult> = {}): CorrelationResult {
  return {
    pearsonR: 0.72,
    pressureBuckets: [],
    baselineHeadacheRate: 0.2,
    dominantTrigger: 'drop',
    triggerWeights: {},
    dataWindowDays: 90,
    entryCount: 30,
    entriesWithWeather: 25,
    factorCorrelations: [],
    ...overrides,
  }
}

function makeConfidence(score: number, label: ConfidenceScore['label'] = 'good'): ConfidenceScore {
  return { score, label, breakdown: { base: score, bonuses: [], penalties: [] } }
}

describe('CorrelationSummary', () => {
  it('displays pearsonR as percentage', () => {
    render(<CorrelationSummary correlation={makeCorrelation({ pearsonR: 0.72 })} confidence={makeConfidence(70)} />)
    expect(screen.getByText('72%')).toBeTruthy()
  })

  it('uses absolute value for negative pearsonR', () => {
    render(<CorrelationSummary correlation={makeCorrelation({ pearsonR: -0.65 })} confidence={makeConfidence(70)} />)
    expect(screen.getByText('65%')).toBeTruthy()
  })

  it('shows dominant trigger label for drop', () => {
    render(<CorrelationSummary correlation={makeCorrelation({ dominantTrigger: 'drop' })} confidence={makeConfidence(70)} />)
    expect(screen.getByText('Pressure drops')).toBeTruthy()
  })

  it('shows dominant trigger label for none', () => {
    render(<CorrelationSummary correlation={makeCorrelation({ dominantTrigger: 'none' })} confidence={makeConfidence(70)} />)
    expect(screen.getByText('No clear pattern')).toBeTruthy()
  })

  it('shows entry count info', () => {
    render(<CorrelationSummary correlation={makeCorrelation()} confidence={makeConfidence(70)} />)
    // "25 of 30 entries with weather" — use a more specific match
    expect(screen.getByText(/25 of 30 entries with weather/)).toBeTruthy()
  })

  it('shows data window days', () => {
    render(<CorrelationSummary correlation={makeCorrelation({ dataWindowDays: 60 })} confidence={makeConfidence(70)} />)
    expect(screen.getByText(/60 days/)).toBeTruthy()
  })

  it('shows confidence bar', () => {
    render(<CorrelationSummary correlation={makeCorrelation()} confidence={makeConfidence(75)} />)
    const bar = screen.getByRole('progressbar')
    expect(bar.getAttribute('aria-valuenow')).toBe('75')
  })

  it('contributing factors section absent when all factors have none strength', () => {
    const correlation = makeCorrelation({
      factorCorrelations: [
        { factor: 'temperature', pearsonR: 0.05, strength: 'none', direction: 'none', sampleSize: 10 },
        { factor: 'aqi', pearsonR: 0.02, strength: 'none', direction: 'none', sampleSize: 8 },
      ],
    })
    render(<CorrelationSummary correlation={correlation} confidence={makeConfidence(70)} />)
    expect(screen.queryByText('Contributing factors')).not.toBeInTheDocument()
  })

  it('contributing factors section renders when at least one factor has non-none strength', () => {
    const correlation = makeCorrelation({
      factorCorrelations: [
        { factor: 'temperature', pearsonR: 0.65, strength: 'strong', direction: 'positive', sampleSize: 20 },
        { factor: 'aqi', pearsonR: 0.05, strength: 'none', direction: 'none', sampleSize: 15 },
      ],
    })
    render(<CorrelationSummary correlation={correlation} confidence={makeConfidence(70)} />)
    expect(screen.getByText('Contributing factors')).toBeInTheDocument()
    expect(screen.getByText('Temperature')).toBeInTheDocument()
    expect(screen.queryByText('Air quality')).not.toBeInTheDocument()
  })
})
