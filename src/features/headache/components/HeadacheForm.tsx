'use client'

// ─── HeadacheForm ─────────────────────────────────────────────────────────────
// The main form for logging a headache entry.
// Validation via react-hook-form + zod. Non-native inputs use Controller.

import { useForm, Controller } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { z } from 'zod'
import { useHeadacheLog } from '../hooks/useHeadacheLog'
import SeveritySlider from './SeveritySlider'
import TriggerTagPicker, { ALL_TRIGGER_TAGS } from './TriggerTagPicker'
import type { TriggerTag } from '@/types/headache'

const schema = z.object({
  severity: z.number().int().min(1).max(5),
  notes: z.string().optional(),
  triggers: z.array(z.enum(ALL_TRIGGER_TAGS as [TriggerTag, ...TriggerTag[]])).optional(),
})

type FormValues = z.infer<typeof schema>

const DEFAULT_VALUES: FormValues = { severity: 3, notes: '', triggers: [] }

export default function HeadacheForm() {
  const { logHeadache, isSubmitting, error } = useHeadacheLog()
  const { control, register, handleSubmit, reset } = useForm<FormValues>({
    resolver: standardSchemaResolver(schema),
    defaultValues: DEFAULT_VALUES,
  })

  async function onSubmit(data: FormValues) {
    try {
      await logHeadache({
        severity: data.severity as 1 | 2 | 3 | 4 | 5,
        notes: data.notes,
        triggers: data.triggers as TriggerTag[] | undefined,
      })
      reset(DEFAULT_VALUES)
    } catch {
      // error already set in hook state — skip reset so user doesn't lose input
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Controller
        control={control}
        name="severity"
        render={({ field }) => (
          <SeveritySlider value={field.value} onChange={field.onChange} />
        )}
      />

      <div className="space-y-2">
        <label htmlFor="notes" className="text-sm font-medium">
          Notes
        </label>
        <textarea
          id="notes"
          {...register('notes')}
          rows={3}
          placeholder="Optional notes about this headache..."
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
        />
      </div>

      <Controller
        control={control}
        name="triggers"
        render={({ field }) => (
          <TriggerTagPicker
            selected={(field.value ?? []) as TriggerTag[]}
            onChange={field.onChange}
          />
        )}
      />

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity disabled:opacity-50"
      >
        {isSubmitting ? 'Saving...' : 'Log Headache'}
      </button>
    </form>
  )
}
