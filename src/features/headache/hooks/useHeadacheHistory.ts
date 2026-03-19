'use client'

// ─── useHeadacheHistory Hook ──────────────────────────────────────────────────
// Loads all headache entries, exposes filter, delete, and update actions.

import { useState, useEffect, useCallback } from 'react'
import { getAllHeadacheEntries, deleteHeadacheEntry } from '@/db/repositories/headacheRepository'
import { updateHeadache } from '../services/headacheService'
import type { HeadacheEntry, HeadacheFormData } from '@/types/headache'

interface UseHeadacheHistoryReturn {
  entries: HeadacheEntry[]
  filteredEntries: HeadacheEntry[]
  isLoading: boolean
  error: string | null
  deleteEntry: (id: string) => Promise<void>
  updateEntry: (id: string, patch: Partial<HeadacheFormData>) => Promise<void>
  severityFilter: number
  setSeverityFilter: (n: number) => void
}

export function useHeadacheHistory(): UseHeadacheHistoryReturn {
  const [entries, setEntries] = useState<HeadacheEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [severityFilter, setSeverityFilter] = useState(1)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getAllHeadacheEntries()
      setEntries(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load entries')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const deleteEntry = useCallback(
    async (id: string) => {
      try {
        await deleteHeadacheEntry(id)
        await load()
      } catch {
        // tolerates already-deleted — no crash
      }
    },
    [load]
  )

  const updateEntry = useCallback(
    async (id: string, patch: Partial<HeadacheFormData>) => {
      await updateHeadache(id, patch)
      await load()
    },
    [load]
  )

  const filteredEntries = entries.filter((e) => e.severity >= severityFilter)

  return {
    entries,
    filteredEntries,
    isLoading,
    error,
    deleteEntry,
    updateEntry,
    severityFilter,
    setSeverityFilter,
  }
}
