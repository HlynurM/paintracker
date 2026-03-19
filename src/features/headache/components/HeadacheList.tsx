'use client'

// ─── HeadacheList ─────────────────────────────────────────────────────────────
// Scrollable history list of logged headaches with filter, edit, and delete.

import { useState, useEffect } from 'react'
import { useHeadacheHistory } from '../hooks/useHeadacheHistory'
import HeadacheListItem from './HeadacheListItem'
import HeadacheEditPanel from './HeadacheEditPanel'
import RemedyLogPanel from './RemedyLogPanel'
import { getAllRemedyEntries } from '@/db/repositories/remedyRepository'
import type { HeadacheEntry } from '@/types/headache'
import type { RemedyEntry } from '@/types/remedy'

export default function HeadacheList() {
  const {
    filteredEntries,
    isLoading,
    error,
    deleteEntry,
    updateEntry,
    severityFilter,
    setSeverityFilter,
  } = useHeadacheHistory()

  const [editingEntry, setEditingEntry] = useState<HeadacheEntry | null>(null)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [remedyPanelEntryId, setRemedyPanelEntryId] = useState<string | null>(null)
  const [remedyMap, setRemedyMap] = useState<Map<string, RemedyEntry[]>>(new Map())

  async function loadRemedies() {
    const all = await getAllRemedyEntries()
    const map = new Map<string, RemedyEntry[]>()
    for (const remedy of all) {
      const existing = map.get(remedy.headacheEntryId) ?? []
      map.set(remedy.headacheEntryId, [...existing, remedy])
    }
    setRemedyMap(map)
  }

  useEffect(() => {
    loadRemedies()
  }, [])

  async function confirmDelete() {
    if (pendingDeleteId) {
      await deleteEntry(pendingDeleteId)
      setPendingDeleteId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-20 rounded-lg border border-border bg-muted animate-pulse" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-8 text-center space-y-3">
        <p className="text-sm text-destructive">{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="text-sm underline text-muted-foreground hover:text-foreground"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Severity filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Min severity:</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setSeverityFilter(level)}
              className={`w-8 h-8 rounded text-xs font-medium transition-colors ${
                severityFilter === level
                  ? 'bg-foreground text-background'
                  : 'border border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* List or empty state */}
      {filteredEntries.length === 0 ? (
        <div className="py-12 text-center text-sm text-muted-foreground">
          No headaches logged yet.
        </div>
      ) : (
        <div className="space-y-2">
          {filteredEntries.map((entry) => (
            <HeadacheListItem
              key={entry.id}
              entry={entry}
              onEdit={setEditingEntry}
              onDelete={setPendingDeleteId}
              remedies={remedyMap.get(entry.id)}
              onRemedyLog={setRemedyPanelEntryId}
            />
          ))}
        </div>
      )}

      {/* Delete confirmation dialog */}
      {pendingDeleteId && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Confirm deletion"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
        >
          <div className="rounded-lg bg-card p-6 shadow-lg space-y-4 max-w-sm mx-4 w-full">
            <p className="text-sm font-medium">Delete this entry?</p>
            <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setPendingDeleteId(null)}
                className="px-4 py-2 text-sm rounded-md border border-border hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 text-sm rounded-md bg-destructive text-white hover:opacity-90 transition-opacity"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit panel */}
      {editingEntry && (
        <HeadacheEditPanel
          entry={editingEntry}
          onSave={async (patch) => {
            await updateEntry(editingEntry.id, patch)
            setEditingEntry(null)
          }}
          onClose={() => setEditingEntry(null)}
        />
      )}

      {/* Remedy log panel */}
      {remedyPanelEntryId && (
        <RemedyLogPanel
          open={remedyPanelEntryId !== null}
          onOpenChange={(open) => { if (!open) setRemedyPanelEntryId(null) }}
          headacheEntryId={remedyPanelEntryId}
          onSuccess={loadRemedies}
        />
      )}
    </div>
  )
}
