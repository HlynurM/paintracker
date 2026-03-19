'use client'

import { useState } from 'react'
import { Dialog } from 'radix-ui'
import RemedyTagPicker from './RemedyTagPicker'
import { useRemedyLog } from '../hooks/useRemedyLog'
import type { RemedyTag } from '@/types/remedy'

interface RemedyLogPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  headacheEntryId: string
  onSuccess: () => void
}

export default function RemedyLogPanel({
  open,
  onOpenChange,
  headacheEntryId,
  onSuccess,
}: RemedyLogPanelProps) {
  const { logRemedy, isSubmitting, error } = useRemedyLog()
  const [tags, setTags] = useState<RemedyTag[]>([])
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(3)
  const [timeToRelief, setTimeToRelief] = useState('')
  const [notes, setNotes] = useState('')

  function reset() {
    setTags([])
    setRating(3)
    setTimeToRelief('')
    setNotes('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (tags.length === 0) return

    await logRemedy(headacheEntryId, {
      tags,
      effectivenessRating: rating,
      timeToReliefMinutes: timeToRelief ? parseInt(timeToRelief, 10) : undefined,
      notes: notes.trim() || undefined,
    })

    reset()
    onOpenChange(false)
    onSuccess()
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <Dialog.Content
          className="fixed bottom-0 left-0 right-0 z-50 max-h-[90dvh] overflow-y-auto rounded-t-2xl bg-card shadow-xl"
          aria-describedby="remedy-log-desc"
        >
          <div className="flex items-center justify-between p-4 border-b border-border">
            <Dialog.Title className="text-sm font-semibold">What helped this time?</Dialog.Title>
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

          <div id="remedy-log-desc" className="sr-only">
            Log what helped relieve your headache
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-6">
            <RemedyTagPicker selected={tags} onChange={setTags} />

            <div className="space-y-2">
              <span className="text-sm font-medium">Effectiveness</span>
              <div className="flex gap-1">
                {([1, 2, 3, 4, 5] as const).map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    aria-label={`${star} star${star !== 1 ? 's' : ''}`}
                    className={`text-xl transition-opacity ${
                      star <= rating ? 'opacity-100' : 'opacity-30'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="time-to-relief" className="text-sm font-medium">
                Time to relief (minutes, optional)
              </label>
              <input
                id="time-to-relief"
                type="number"
                min={0}
                value={timeToRelief}
                onChange={(e) => setTimeToRelief(e.target.value)}
                placeholder="e.g. 30"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="remedy-notes" className="text-sm font-medium">
                Notes (optional)
              </label>
              <textarea
                id="remedy-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Anything else that helped..."
                rows={2}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting || tags.length === 0}
              className="w-full rounded-lg bg-violet-600 py-2.5 text-sm font-medium text-white hover:bg-violet-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving…' : 'Save'}
            </button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
