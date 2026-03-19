# TODO — PainTracker Backlog

Items pending implementation, in rough priority order.

---

## In Progress

_(none)_

---

## Upcoming

### F05 — Pressure Display
Show current barometric pressure and recent trend on the dashboard.

### F06 — Insights
Correlate logged headaches with pressure changes over time.

### F10 — Dashboard
Unified home screen combining pressure display, recent headaches, and risk indicator.

---

## UX / Polish

- [ ] Body map for pain location input (see FEATURES.md backlog)
- [ ] Stiffness in limbs input (see FEATURES.md backlog)

## Settings — Theme Mode (backlog)

- [ ] Add Light / Dark / System theme toggle to Settings page
  - Icons: Sun (light), Moon (dark), Monitor (system) from lucide-react
  - Each mode gets a matching colour scheme (light = warm cream/white, dark = current indigo, system = follows OS)
  - Store preference in `settingsStore` (`themeMode: 'light' | 'dark' | 'system'`)
  - Apply via `useEffect` that toggles the `dark` class on `<html>`

---

## Bugs / Correctness

_(none known)_
