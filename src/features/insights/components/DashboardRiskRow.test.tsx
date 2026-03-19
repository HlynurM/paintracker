import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import DashboardRiskRow from './DashboardRiskRow'
import type { PredictionResult } from '@/types/prediction'
import type { WeatherData } from '@/types/weather'

function makePrediction(risk: PredictionResult['risk'], confidence = 72): PredictionResult {
  return {
    risk,
    riskScore: 0.5,
    confidence: { score: confidence, label: 'good', breakdown: { base: confidence, bonuses: [], penalties: [] } },
    factors: [],
    horizonHours: 24,
  }
}

function makeWeather(pressure = 1013, delta = -3.5): WeatherData {
  return {
    timestamp: Date.now(),
    pressure,
    temperature: 20,
    humidity: 65,
    windSpeed: 10,
    trend: delta < 0 ? 'falling' : delta > 0 ? 'rising' : 'stable',
    trendDeltaHpa: delta,
  }
}

describe('DashboardRiskRow', () => {
  it('renders dashes when prediction and weather are null', () => {
    render(<DashboardRiskRow prediction={null} weather={null} isLoading={false} />)
    // Both cells show fallback dashes
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(2)
  })

  it('renders risk label when prediction is provided', () => {
    render(<DashboardRiskRow prediction={makePrediction('high')} weather={null} isLoading={false} />)
    expect(screen.getByText('High')).toBeInTheDocument()
  })

  it('renders pressure value when weather is provided', () => {
    render(<DashboardRiskRow prediction={null} weather={makeWeather(1008, -4.2)} isLoading={false} />)
    expect(screen.getByText('1008')).toBeInTheDocument()
  })

  it('renders all risk levels correctly', () => {
    const { rerender } = render(<DashboardRiskRow prediction={makePrediction('low')} weather={null} isLoading={false} />)
    expect(screen.getByText('Low')).toBeInTheDocument()

    rerender(<DashboardRiskRow prediction={makePrediction('medium')} weather={null} isLoading={false} />)
    expect(screen.getByText('Medium')).toBeInTheDocument()

    rerender(<DashboardRiskRow prediction={makePrediction('high')} weather={null} isLoading={false} />)
    expect(screen.getByText('High')).toBeInTheDocument()
  })
})
