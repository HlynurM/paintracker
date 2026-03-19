// ─── Headache Feature — Public API ───────────────────────────────────────────
// Only import from this file when other features or pages need headache data.

export { createHeadacheEntry, updateHeadache } from './services/headacheService'
export { useHeadacheLog } from './hooks/useHeadacheLog'
export { useHeadacheHistory } from './hooks/useHeadacheHistory'
export { useDashboardEntries } from './hooks/useDashboardEntries'
export { default as HeadacheForm } from './components/HeadacheForm'
export { default as HeadacheList } from './components/HeadacheList'
export { default as HeadacheEditPanel } from './components/HeadacheEditPanel'
export { default as DashboardRecentItem } from './components/DashboardRecentItem'
export { default as DashboardRecentList } from './components/DashboardRecentList'
export { default as QuickLogPanel } from './components/QuickLogPanel'
export { useRemedyLog } from './hooks/useRemedyLog'
export { default as RemedyLogPanel } from './components/RemedyLogPanel'
export { default as RemedyTagPicker } from './components/RemedyTagPicker'
export { default as RemedyFrequencyBars } from './components/RemedyFrequencyBars'
export type { HeadacheEntry, HeadacheFormData, HeadacheSeverity, TriggerTag } from '@/types/headache'
