// ─── Headache Feature — Public API ───────────────────────────────────────────
// Only import from this file when other features or pages need headache data.

export { createHeadacheEntry } from './services/headacheService'
export type { HeadacheEntry, HeadacheFormData, HeadacheSeverity, TriggerTag } from '@/types/headache'
