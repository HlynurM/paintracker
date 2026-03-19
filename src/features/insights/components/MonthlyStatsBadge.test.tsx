import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import MonthlyStatsBadge from './MonthlyStatsBadge'
import type { MonthlyStats } from '../services/insightsService'

function stats(overrides: Partial<MonthlyStats> = {}): MonthlyStats {
  return {
    thisMonthCount: 0,
    lastMonthCount: 0,
    avgSeverity: null,
    delta: 0,
    ...overrides,
  }
}

describe('MonthlyStatsBadge', () => {
  it('shows episode count', () => {
    render(<MonthlyStatsBadge stats={stats({ thisMonthCount: 7 })} />)
    expect(screen.getByText('7')).toBeInTheDocument()
  })

  it('shows avg severity formatted to 1dp', () => {
    render(<MonthlyStatsBadge stats={stats({ avgSeverity: 3.4 })} />)
    expect(screen.getByText('3.4')).toBeInTheDocument()
  })

  it('shows — when avgSeverity is null', () => {
    render(<MonthlyStatsBadge stats={stats({ avgSeverity: null })} />)
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('shows positive delta with + sign', () => {
    render(<MonthlyStatsBadge stats={stats({ delta: 3 })} />)
    expect(screen.getByText('+3 vs last month')).toBeInTheDocument()
  })

  it('shows negative delta', () => {
    render(<MonthlyStatsBadge stats={stats({ delta: -2 })} />)
    expect(screen.getByText('-2 vs last month')).toBeInTheDocument()
  })

  it('shows neutral text when delta is 0', () => {
    render(<MonthlyStatsBadge stats={stats({ delta: 0 })} />)
    expect(screen.getByText('= vs last month')).toBeInTheDocument()
  })
})
