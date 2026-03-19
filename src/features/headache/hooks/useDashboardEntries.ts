'use client'

// ─── useDashboardEntries ──────────────────────────────────────────────────────
// Loads the 5 most recent headache entries for the dashboard.
// Exposes reload() so QuickLogPanel can trigger a refresh after submit.

import { useState, useEffect, useCallback } from 'react'
import { getAllHeadacheEntries } from '@/db/repositories/headacheRepository'
import type { HeadacheEntry } from '@/types/headache'

interface UseDashboardEntriesReturn {
  entries: HeadacheEntry[]
  isLoading: boolean
  error: string | null
  reload: () => Promise<void>
}

const MAX_ENTRIES = 5

export function useDashboardEntries(): UseDashboardEntriesReturn {
  const [entries, setEntries] = useState<HeadacheEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const all = await getAllHeadacheEntries()
      setEntries(all.slice(0, MAX_ENTRIES))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load entries')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  return { entries, isLoading, error, reload }
}
