import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect } from 'vitest'
import TriggerTagPicker from './TriggerTagPicker'
import type { TriggerTag } from '@/types/headache'

describe('TriggerTagPicker', () => {
  it('renders 5 tags', () => {
    render(<TriggerTagPicker selected={[]} onChange={vi.fn()} />)
    expect(screen.getByText('Poor Sleep')).toBeInTheDocument()
    expect(screen.getByText('Dehydration')).toBeInTheDocument()
    expect(screen.getByText('Screen Time')).toBeInTheDocument()
    expect(screen.getByText('Stress')).toBeInTheDocument()
    expect(screen.getByText('Manual')).toBeInTheDocument()
    expect(screen.queryByText('Pressure Drop')).not.toBeInTheDocument()
    expect(screen.queryByText('Pressure Rise')).not.toBeInTheDocument()
  })

  it('clicking unselected tag calls onChange with tag added', async () => {
    const handleChange = vi.fn()
    render(<TriggerTagPicker selected={[]} onChange={handleChange} />)

    await userEvent.click(screen.getByText('Stress'))

    expect(handleChange).toHaveBeenCalledWith(['stress'] as TriggerTag[])
  })

  it('clicking selected tag calls onChange with tag removed', async () => {
    const handleChange = vi.fn()
    render(<TriggerTagPicker selected={['stress', 'dehydration']} onChange={handleChange} />)

    await userEvent.click(screen.getByText('Stress'))

    expect(handleChange).toHaveBeenCalledWith(['dehydration'] as TriggerTag[])
  })

  it('multiple tags can be selected simultaneously', async () => {
    const handleChange = vi.fn()
    render(<TriggerTagPicker selected={['poor-sleep']} onChange={handleChange} />)

    await userEvent.click(screen.getByText('Stress'))

    expect(handleChange).toHaveBeenCalledWith(['poor-sleep', 'stress'] as TriggerTag[])
  })
})
