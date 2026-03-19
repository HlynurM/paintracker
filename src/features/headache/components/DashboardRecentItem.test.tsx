import { render, screen } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import DashboardRecentItem from './DashboardRecentItem'
import type { HeadacheEntry } from '@/types/headache'

// Mock date-fns to avoid time-dependent output
vi.mock('date-fns', async (importOriginal) => {
  const actual = await importOriginal<typeof import('date-fns')>()
  return {
    ...actual,
    formatDistanceToNow: () => '2 hours ago',
  }
})

function makeEntry(overrides: Partial<HeadacheEntry> = {}): HeadacheEntry {
  return {
    id: 'e1',
    timestamp: Date.now() - 2 * 60 * 60 * 1000,
    severity: 4,
    weather: null,
    ...overrides,
  }
}

describe('DashboardRecentItem', () => {
  it('renders severity label', () => {
    render(<DashboardRecentItem entry={makeEntry({ severity: 4 })} />)
    expect(screen.getByText('Severe')).toBeInTheDocument()
  })

  it('renders relative time', () => {
    render(<DashboardRecentItem entry={makeEntry()} />)
    expect(screen.getByText('2 hours ago')).toBeInTheDocument()
  })

  it('shows — when weather is null', () => {
    render(<DashboardRecentItem entry={makeEntry({ weather: null })} />)
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('shows pressure and trend arrow when weather is present', () => {
    const entry = makeEntry({
      weather: {
        timestamp: Date.now(),
        pressure: 1009,
        temperature: 10,
        humidity: 70,
        windSpeed: 15,
        trend: 'falling',
        trendDeltaHpa: -3,
      },
    })
    render(<DashboardRecentItem entry={entry} />)
    expect(screen.getByText('↓ 1009 hPa')).toBeInTheDocument()
  })

  it('is a link to /history', () => {
    render(<DashboardRecentItem entry={makeEntry()} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/history')
  })
})
