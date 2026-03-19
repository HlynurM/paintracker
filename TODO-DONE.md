# TODO-DONE — Completed Items

---

## F01 — Data Layer
Local-first IndexedDB schema via Dexie.js. Repositories for headache entries. Shared TypeScript types.

## F02 — Weather
Barometric pressure fetching and storage. Weather data types and repository.

## F03 — Log Headache
HeadacheForm with severity slider, trigger tag picker, notes input. Zustand store + service + repository wired end-to-end.

## F04 — History
HeadacheList and HeadacheListItem components. Edit panel (HeadacheEditPanel). useHeadacheHistory hook. History page at `/history`.

## Trigger exclusivity
`pressure-drop` and `pressure-rise` are now mutually exclusive in TriggerTagPicker — selecting one auto-deselects the other.

## Dark mode + log page card layout
Global dark mode enabled via `className="dark"` on `<html>`. Log page wrapped in a centered `max-w-sm` card. SeveritySlider constrained to `max-w-xs`.
