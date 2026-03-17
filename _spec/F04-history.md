# F04 — Headache History

> **Status:** planned
> **Branch:** spec/f04-history
> **Created:** 2026-03-17
> **Depends on:** F01, F03

---

## Purpose

A scrollable list of all logged headache entries sorted newest-first, with inline edit and delete. Supports filtering by minimum severity. Entries expose their `timestamp` so a calendar view can be layered on top in a future iteration without rewriting this feature.

---

## Acceptance Criteria

- [ ] All previously logged headaches are listed in newest-first order.
- [ ] Each entry shows its date/time, severity, barometric pressure at log time, and a preview of notes.
- [ ] Tapping an entry opens an edit panel pre-filled with its current values.
- [ ] Editing an entry (severity, notes, triggers) and saving persists the changes.
- [ ] Deleting an entry requires a confirmation prompt; confirmed deletion removes it from the list.
- [ ] A minimum severity filter hides entries below the chosen threshold without reloading the page.
- [ ] An empty state message is shown when no entries have been logged.

---

## Functional Requirements

1. Loads all headache entries via `useHeadacheHistory` hook, sorted newest-first.
2. Each list item displays: formatted date/time, severity number + label, barometric pressure at log time, and truncated notes (2 lines max).
3. Tapping/clicking an entry opens an edit panel (sheet or modal) pre-populated with the entry's current values.
4. Edit panel allows changing: `severity`, `notes`, and `triggers`. `timestamp` is not editable.
5. On edit save, `headacheService.updateHeadache(id, patch)` is called with only the changed fields.
6. Before deleting an entry, a confirmation prompt is shown. On confirm, the entry is removed from the DB.
7. An empty state message is shown when no entries exist.
8. A minimum severity filter (e.g. "show only severity ≥ 6") hides entries below the threshold client-side — no re-fetch needed.
9. The list item component exposes `entry.timestamp` in a data attribute or prop so a future calendar layer can group entries by date without structural changes.
10. The `useHeadacheHistory` hook reloads the list after a successful add, edit, or delete.

---

## Data Contracts

### `useHeadacheHistory` hook output

| Field | Type | Notes |
|---|---|---|
| `entries` | `HeadacheEntry[]` | sorted newest-first, all entries |
| `filteredEntries` | `HeadacheEntry[]` | entries after severity filter applied |
| `isLoading` | `boolean` | |
| `error` | `string \| null` | |
| `deleteEntry(id)` | `(id: string) => Promise<void>` | |
| `updateEntry(id, patch)` | `(id: string, patch: Partial<HeadacheFormData>) => Promise<void>` | |
| `severityFilter` | `number` | minimum severity to show; default `1` (show all) |
| `setSeverityFilter` | `(n: number) => void` | |

### New repository method required (addition to F01)

| Method | Signature | Returns |
|---|---|---|
| `updateHeadacheEntry` | `(id: string, patch: Partial<HeadacheEntry>) => Promise<void>` | upserts with merged fields |

### `HeadacheListItemProps`

| Prop | Type | Notes |
|---|---|---|
| `entry` | `HeadacheEntry` | |
| `onEdit` | `(entry: HeadacheEntry) => void` | |
| `onDelete` | `(id: string) => void` | triggers confirmation |

---

## Edge Cases

- Entry deleted between page load and user clicking delete → handle gracefully; treat as already-gone (no crash, no error shown to user).
- Edit saved with no changes → idempotent `put`; no error, no visible change.
- Notes field in edit panel contains only whitespace → trim to `''` before saving (consistent with F03).
- History loads while a new entry is being saved from F03 → list refreshes after save completes (hook re-fetches on change).
- Severity filter set to 10 with no matching entries → shows the same empty state as zero entries (no special message needed).
- Very long notes → truncated in list view (2 lines with `overflow: hidden`); full text shown in edit panel.
- User opens edit panel then navigates away → unsaved changes are discarded, no prompt needed for MVP.

---

## Out of Scope

- Full calendar UI — entries carry `timestamp` for future grouping, but rendering a calendar widget is a separate feature.
- Bulk delete or select-all.
- Filtering by date range (MVP only filters by minimum severity).
- Pagination — load all entries for MVP; add virtual scroll later if performance becomes an issue.
- Sorting options (MVP is always newest-first).

---

## Test Guidelines

- **Layer:** unit for `updateHeadacheEntry` repository method; component test for list, item, edit, and delete flows
- **Key scenarios — repository (`updateHeadacheEntry`):**
  - Save an entry, then update with a severity patch → stored entry has new severity, other fields unchanged
  - `updateHeadacheEntry` with a non-existent id → no error thrown; operation is a no-op
- **Key scenarios — `HeadacheList` component:**
  - Renders all entries in newest-first order
  - Empty state renders when `entries` is `[]`
  - Severity filter `>= 7` hides entries with severity 1–6; entries 7–10 remain
  - Filter set back to 1 → all entries reappear (no re-fetch)
- **Key scenarios — delete flow:**
  - Clicking delete shows confirmation prompt
  - Confirming calls `deleteEntry` with correct id → item removed from rendered list
  - Cancelling confirmation → entry remains
- **Key scenarios — edit flow:**
  - Clicking an entry opens edit panel with pre-populated values (severity, notes, triggers)
  - Changing severity and saving calls `updateEntry` with correct patch
  - After save, edit panel closes and list item reflects updated values
- **Do NOT test:**
  - Dexie internals
  - Modal animation or transition behavior
  - Navigation (trust Next.js router)
