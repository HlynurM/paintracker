'use client'

import { useState } from 'react'
import { createRemedyEntry } from '../services/remedyService'
import { saveRemedyEntry, getRemediesForEntry } from '@/db/repositories/remedyRepository'
import type { RemedyEntry, RemedyFormData } from '@/types/remedy'

interface UseRemedyLogReturn {
  logRemedy: (headacheEntryId: string, data: RemedyFormData) => Promise<void>
  fetchRemedies: (headacheEntryId: string) => Promise<RemedyEntry[]>
  isSubmitting: boolean
  error: string | null
}

export function useRemedyLog(): UseRemedyLogReturn {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function logRemedy(headacheEntryId: string, data: RemedyFormData): Promise<void> {
    setIsSubmitting(true)
    setError(null)
    try {
      const entry = createRemedyEntry(headacheEntryId, data)
      await saveRemedyEntry(entry)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save remedy')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function fetchRemedies(headacheEntryId: string): Promise<RemedyEntry[]> {
    return getRemediesForEntry(headacheEntryId)
  }

  return { logRemedy, fetchRemedies, isSubmitting, error }
}
