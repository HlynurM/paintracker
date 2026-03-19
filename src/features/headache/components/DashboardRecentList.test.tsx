import { render, screen } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import DashboardRecentList from './DashboardRecentList'
import type { HeadacheEntry } from '@/types/headache'

vi.mock('date-fns', async (importOriginal) => {
  const actual = await importOriginal<typeof import('date-fns')>()
  return {
    ...actual,
    formatDistanceToNow: () => '1 day ago',
  }
})

function makeEntry(id: string): HeadacheEntry {
  return { id, timestamp: Date.now(), severity: 2, weather: null }
}

describe('DashboardRecentList', () => {
  it('shows loading skeleton', () => {
    const { container } = render(<DashboardRecentList entries={[]} isLoading />)
    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(3)
  })

  it('shows onboarding message when no entries', () => {
    render(<DashboardRecentList entries={[]} isLoading={false} />)
    expect(screen.getByText(/log your first episode/i)).toBeInTheDocument()
  })

  it('renders an item for each entry', () => {
    const entries = [makeEntry('e1'), makeEntry('e2'), makeEntry('e3')]
    render(<DashboardRecentList entries={entries} isLoading={false} />)
    expect(screen.getAllByRole('link')).toHaveLength(3)
  })

  it('does not render onboarding when entries present', () => {
    render(<DashboardRecentList entries={[makeEntry('e1')]} isLoading={false} />)
    expect(screen.queryByText(/log your first episode/i)).not.toBeInTheDocument()
  })
})
