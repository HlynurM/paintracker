import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import TriggerFrequencyBars from './TriggerFrequencyBars'
import type { TriggerCount } from '../services/insightsService'

describe('TriggerFrequencyBars', () => {
  it('renders nothing when triggers list is empty', () => {
    const { container } = render(<TriggerFrequencyBars triggers={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders a bar for each trigger', () => {
    const triggers: TriggerCount[] = [
      { tag: 'stress', count: 5 },
      { tag: 'poor-sleep', count: 3 },
    ]
    render(<TriggerFrequencyBars triggers={triggers} />)
    expect(screen.getByText('Stress')).toBeInTheDocument()
    expect(screen.getByText('Poor Sleep')).toBeInTheDocument()
  })

  it('renders trigger counts', () => {
    const triggers: TriggerCount[] = [
      { tag: 'stress', count: 8 },
      { tag: 'dehydration', count: 2 },
    ]
    render(<TriggerFrequencyBars triggers={triggers} />)
    expect(screen.getByText('8')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('first bar has 100% width (max count)', () => {
    const triggers: TriggerCount[] = [
      { tag: 'stress', count: 10 },
      { tag: 'poor-sleep', count: 5 },
    ]
    const { container } = render(<TriggerFrequencyBars triggers={triggers} />)
    const bars = container.querySelectorAll('[style*="width:"]')
    expect((bars[0] as HTMLElement).style.width).toBe('100%')
    expect((bars[1] as HTMLElement).style.width).toBe('50%')
  })
})
