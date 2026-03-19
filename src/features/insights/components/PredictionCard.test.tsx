import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import PredictionCard from './PredictionCard'
import type { PredictionResult, ConfidenceScore } from '@/types/prediction'

function makeConfidence(score: number, label: ConfidenceScore['label'] = 'good'): ConfidenceScore {
  return { score, label, breakdown: { base: score, bonuses: [], penalties: [] } }
}

function makePrediction(
  risk: PredictionResult['risk'],
  confidenceScore = 70
): PredictionResult {
  return {
    risk,
    riskScore: 0.5,
    confidence: makeConfidence(confidenceScore),
    factors: [
      { label: 'Pressure change', contribution: 0.4 },
      { label: 'Sleep quality', contribution: 0.1 },
    ],
    horizonHours: 24,
  }
}

describe('PredictionCard', () => {
  it('renders skeleton when loading', () => {
    const { container } = render(<PredictionCard prediction={null} isLoading={true} />)
    expect(container.querySelector('.animate-pulse')).toBeTruthy()
  })

  it('shows unlock message when prediction is null', () => {
    render(<PredictionCard prediction={null} isLoading={false} />)
    expect(screen.getByText(/log more episodes/i)).toBeTruthy()
  })

  it('shows unlock message when risk is unknown', () => {
    render(<PredictionCard prediction={makePrediction('unknown', 0)} isLoading={false} />)
    expect(screen.getByText(/log more episodes/i)).toBeTruthy()
  })

  it('shows high risk badge', () => {
    render(<PredictionCard prediction={makePrediction('high')} isLoading={false} />)
    expect(screen.getByText('High Risk')).toBeTruthy()
  })

  it('shows medium risk badge', () => {
    render(<PredictionCard prediction={makePrediction('medium')} isLoading={false} />)
    expect(screen.getByText('Medium Risk')).toBeTruthy()
  })

  it('shows low risk badge', () => {
    render(<PredictionCard prediction={makePrediction('low')} isLoading={false} />)
    expect(screen.getByText('Low Risk')).toBeTruthy()
  })

  it('shows top 2 factors', () => {
    render(<PredictionCard prediction={makePrediction('high')} isLoading={false} />)
    expect(screen.getByText('Pressure change')).toBeTruthy()
    expect(screen.getByText('Sleep quality')).toBeTruthy()
  })

  it('shows horizon hours', () => {
    render(<PredictionCard prediction={makePrediction('low')} isLoading={false} />)
    expect(screen.getByText(/24h/)).toBeTruthy()
  })
})
