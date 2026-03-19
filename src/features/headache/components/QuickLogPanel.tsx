'use client'

// ─── QuickLogPanel ────────────────────────────────────────────────────────────
// Bottom-sheet dialog for quick headache logging from the dashboard.
// Same pattern as HeadacheEditPanel but contains HeadacheForm.

import { useState } from 'react'
import { Dialog } from 'radix-ui'
import SeveritySlider from './SeveritySlider'
import HeadacheForm from './HeadacheForm'
import type { HeadacheSeverity } from '@/types/headache'

interface QuickLogPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export default function QuickLogPanel({ open, onOpenChange, onSuccess }: QuickLogPanelProps) {
  const [severity, setSeverity] = useState<HeadacheSeverity>(3)

  function handleSuccess() {
    onSuccess()
    onOpenChange(false)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <Dialog.Content
          className="fixed bottom-0 left-0 right-0 z-50 max-h-[90dvh] overflow-y-auto rounded-t-2xl bg-card shadow-xl"
          aria-describedby="quick-log-desc"
        >
          <div className="flex items-center justify-between p-4 border-b border-border">
            <Dialog.Title className="text-sm font-semibold">Log Headache</Dialog.Title>
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

          <div id="quick-log-desc" className="sr-only">
            Log a new headache episode
          </div>

          <div className="p-4 space-y-6">
            <SeveritySlider
              value={severity}
              onChange={(v) => setSeverity(v as HeadacheSeverity)}
            />
            <HeadacheForm
              severity={severity}
              onSeverityChange={(v) => setSeverity(v as HeadacheSeverity)}
              onSuccess={handleSuccess}
            />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
