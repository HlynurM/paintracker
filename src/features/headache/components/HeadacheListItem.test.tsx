import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect } from 'vitest'
import HeadacheListItem from './HeadacheListItem'
import type { HeadacheEntry } from '@/types/headache'
import type { WeatherSnapshot } from '@/types/weather'

const weather: WeatherSnapshot = {
  timestamp: 0,
  pressure: 1013.25,
  temperature: 20,
  humidity: 50,
  windSpeed: 10,
  trend: 'stable',
  trendDeltaHpa: 0,
}

const entry: HeadacheEntry = {
  id: 'abc-1',
  timestamp: new Date('2024-06-15T14:30:00').getTime(),
  severity: 3,
  weather,
  notes: 'Test notes here',
  triggers: [],
}

describe('HeadacheListItem', () => {
  it('renders severity label and pressure', () => {
    render(<HeadacheListItem entry={entry} onEdit={() => {}} onDelete={() => {}} />)
    expect(screen.getByText(/3 — Significant/)).toBeInTheDocument()
    expect(screen.getByText(/1013\.\d/)).toBeInTheDocument()
  })

  it('renders notes', () => {
    render(<HeadacheListItem entry={entry} onEdit={() => {}} onDelete={() => {}} />)
    expect(screen.getByText('Test notes here')).toBeInTheDocument()
  })

  it('does not render notes when notes is absent', () => {
    const noNotes = { ...entry, notes: undefined }
    render(<HeadacheListItem entry={noNotes} onEdit={() => {}} onDelete={() => {}} />)
    expect(screen.queryByText('Test notes here')).not.toBeInTheDocument()
  })

  it('does not render pressure when weather is null', () => {
    const noWeather = { ...entry, weather: null }
    render(<HeadacheListItem entry={noWeather} onEdit={() => {}} onDelete={() => {}} />)
    expect(screen.queryByText(/hPa/)).not.toBeInTheDocument()
  })

  it('calls onEdit with the full entry when Edit is clicked', async () => {
    const onEdit = vi.fn()
    render(<HeadacheListItem entry={entry} onEdit={onEdit} onDelete={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: /edit/i }))
    expect(onEdit).toHaveBeenCalledWith(entry)
  })

  it('calls onDelete with entry id when Delete is clicked', async () => {
    const onDelete = vi.fn()
    render(<HeadacheListItem entry={entry} onEdit={() => {}} onDelete={onDelete} />)
    await userEvent.click(screen.getByRole('button', { name: /delete/i }))
    expect(onDelete).toHaveBeenCalledWith('abc-1')
  })

  it('exposes data-timestamp attribute', () => {
    const { container } = render(
      <HeadacheListItem entry={entry} onEdit={() => {}} onDelete={() => {}} />
    )
    const el = container.querySelector(`[data-timestamp="${entry.timestamp}"]`)
    expect(el).not.toBeNull()
  })
})
