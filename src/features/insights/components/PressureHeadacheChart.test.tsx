import { render, screen } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import PressureHeadacheChart from './PressureHeadacheChart'
import type { WeatherData } from '@/types/weather'
import type { HeadacheEntry } from '@/types/headache'

// ─── Mock recharts ─────────────────────────────────────────────────────────────
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  ComposedChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="composed-chart">{children}</div>
  ),
  Line: () => <div data-testid="chart-line" />,
  Scatter: () => <div data-testid="chart-scatter" />,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  CartesianGrid: () => null,
}))

function makeWeather(overrides: Partial<WeatherData> = {}): WeatherData {
  return {
    timestamp: Date.now(),
    pressure: 1013,
    temperature: 20,
    humidity: 60,
    windSpeed: 10,
    trend: 'stable',
    trendDeltaHpa: 0,
    ...overrides,
  }
}

function makeEntry(overrides: Partial<HeadacheEntry> = {}): HeadacheEntry {
  return {
    id: 'e1',
    timestamp: Date.now(),
    severity: 3,
    weather: null,
    ...overrides,
  }
}

describe('PressureHeadacheChart', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders skeleton when loading', () => {
    const { container } = render(
      <PressureHeadacheChart pressureReadings={[]} headacheEvents={[]} isLoading />
    )
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('renders empty state when no data', () => {
    render(
      <PressureHeadacheChart pressureReadings={[]} headacheEvents={[]} isLoading={false} />
    )
    expect(screen.getByText(/log a few episodes/i)).toBeInTheDocument()
  })

  it('renders chart container when pressure data is present', () => {
    render(
      <PressureHeadacheChart
        pressureReadings={[makeWeather()]}
        headacheEvents={[]}
        isLoading={false}
      />
    )
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
  })

  it('renders chart container when only headache events present', () => {
    render(
      <PressureHeadacheChart
        pressureReadings={[]}
        headacheEvents={[makeEntry()]}
        isLoading={false}
      />
    )
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
  })
})
