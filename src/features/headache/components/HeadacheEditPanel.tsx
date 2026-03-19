'use client'

// ─── HeadacheEditPanel ────────────────────────────────────────────────────────
// Side panel (Dialog-based) for editing an existing headache entry.
// Timestamp is read-only; severity, notes, and triggers are editable.

import { useState } from 'react'
import { Dialog } from 'radix-ui'
import { format } from 'date-fns'
import SeveritySlider from './SeveritySlider'
import TriggerTagPicker from './TriggerTagPicker'
import type { HeadacheEntry, HeadacheFormData, HeadacheSeverity, TriggerTag } from '@/types/headache'

interface HeadacheEditPanelProps {
  entry: HeadacheEntry
  onSave: (patch: Partial<HeadacheFormData>) => Promise<void>
  onClose: () => void
}

export default function HeadacheEditPanel({ entry, onSave, onClose }: HeadacheEditPanelProps) {
  const [severity, setSeverity] = useState<HeadacheSeverity>(entry.severity)
  const [notes, setNotes] = useState(entry.notes ?? '')
  const [triggers, setTriggers] = useState<TriggerTag[]>(entry.triggers ?? [])
  const [isSaving, setIsSaving] = useState(false)

  async function handleSave() {
    setIsSaving(true)
    try {
      await onSave({ severity, notes, triggers })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog.Root open onOpenChange={(open) => { if (!open) onClose() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <Dialog.Content
          className="fixed right-0 top-0 z-50 h-full w-full max-w-sm bg-card shadow-xl flex flex-col"
          aria-describedby="edit-panel-desc"
        >
          <div className="flex items-center justify-between p-4 border-b border-border">
            <Dialog.Title className="text-sm font-semibold">Edit Entry</Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                ✕
              </button>
            </Dialog.Close>
          </div>

          <div id="edit-panel-desc" className="sr-only">
            Edit your headache entry
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <p className="text-xs text-muted-foreground">
              {format(new Date(entry.timestamp), 'PPPp')}
            </p>

            <SeveritySlider
              value={severity}
              onChange={(v) => setSeverity(v as HeadacheSeverity)}
            />

            <div className="space-y-2">
              <label htmlFor="edit-notes" className="text-sm font-medium">
                Notes
              </label>
              <textarea
                id="edit-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
              />
            </div>

            <TriggerTagPicker selected={triggers} onChange={setTriggers} />
          </div>

          <div className="p-4 border-t border-border flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-md border border-border px-4 py-2 text-sm hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 rounded-md bg-foreground text-background px-4 py-2 text-sm font-medium transition-opacity disabled:opacity-50"
            >
              {isSaving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
