import { describe, it, expect } from 'vitest'
import { createRemedyEntry } from './remedyService'
import type { RemedyFormData } from '@/types/remedy'

const baseFormData: RemedyFormData = {
  tags: ['rest', 'hydration'],
  effectivenessRating: 4,
  timeToReliefMinutes: 30,
  notes: 'Helped a lot',
}

describe('createRemedyEntry', () => {
  it('generates a UUID id', () => {
    const entry = createRemedyEntry('headache-123', baseFormData)
    expect(entry.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    )
  })

  it('sets headacheEntryId from parameter', () => {
    const entry = createRemedyEntry('headache-abc', baseFormData)
    expect(entry.headacheEntryId).toBe('headache-abc')
  })

  it('sets timestamp to current time (within 1s)', () => {
    const before = Date.now()
    const entry = createRemedyEntry('h1', baseFormData)
    const after = Date.now()
    expect(entry.timestamp).toBeGreaterThanOrEqual(before)
    expect(entry.timestamp).toBeLessThanOrEqual(after)
  })

  it('copies all form data fields', () => {
    const entry = createRemedyEntry('h1', baseFormData)
    expect(entry.tags).toEqual(['rest', 'hydration'])
    expect(entry.effectivenessRating).toBe(4)
    expect(entry.timeToReliefMinutes).toBe(30)
    expect(entry.notes).toBe('Helped a lot')
  })

  it('handles optional fields being undefined', () => {
    const minimal: RemedyFormData = {
      tags: ['rest'],
      effectivenessRating: 3,
    }
    const entry = createRemedyEntry('h1', minimal)
    expect(entry.timeToReliefMinutes).toBeUndefined()
    expect(entry.notes).toBeUndefined()
  })

  it('generates unique ids on each call', () => {
    const a = createRemedyEntry('h1', baseFormData)
    const b = createRemedyEntry('h1', baseFormData)
    expect(a.id).not.toBe(b.id)
  })
})
