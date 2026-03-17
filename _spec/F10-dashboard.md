# F10 — Dashboard Overview

> **Status:** planned
> **Branch:** spec/f10-dashboard
> **Created:** 2026-03-17
> **Depends on:** F03, F04, F05

---

## Purpose

The home screen. Answers "how am I doing right now, and what happened recently?" in a single view. Shows the current pressure and risk level, a quick-log button to record a headache without navigating away, and a summary of the 5 most recent entries. Designed to be the first screen the user sees every time they open the app.

---

## Acceptance Criteria

- [ ] The home screen shows the current pressure widget and the 5 most recent headache entries.
- [ ] A "Log Headache" button opens the log form without navigating away from the dashboard.
- [ ] After logging, the recent entries list updates to show the new entry at the top.
- [ ] Tapping a recent entry navigates to the full history view.
- [ ] A "View all history" link is present and navigates to the full history page.
- [ ] If no entries exist, an onboarding prompt replaces the mini-list.
- [ ] The weather widget shows a loading skeleton independently — the rest of the dashboard renders without waiting for weather.

---

## Functional Requirements

1. Renders the `WeatherWidget` (F05) at the top — current pressure, trend arrow, risk color.
2. Renders a prominent "Log Headache" button. Tapping it opens the `HeadacheForm` (F03) as a sheet or inline panel — the user does not leave the dashboard.
3. After a successful log from the quick-log panel, the panel closes and the recent entries list updates without a full page reload.
4. Shows the 5 most recent headache entries as a mini-list. Each item shows: relative date (e.g. "2 hours ago"), severity number + label, and pressure at log time.
5. Each mini-list item is tappable and navigates to the full history view (F04) with that entry in focus.
6. A "View all history" link navigates to the full history page.
7. If no entries exist, replaces the mini-list with an onboarding prompt: "Log your first headache to get started."
8. If fewer than 5 entries exist, shows however many are available — no empty placeholder slots.
9. Dashboard reads from `weatherStore` (for the widget) and calls `getAllHeadacheEntries` (limited to 5, newest-first) for the mini-list. No new data sources.
10. Weather widget shows its own loading skeleton while weather is loading — the rest of the dashboard renders independently.

---

## Data Contracts

No new types introduced. Composes from existing contracts:

| Source | Data used |
|---|---|
| `weatherStore` via `useWeather` | `currentWeather`, `risk`, `isLoading`, `error` |
| `headacheRepository.getAllHeadacheEntries()` | first 5 entries, newest-first |
| `HeadacheEntry` | `id`, `timestamp`, `severity`, `weather.pressure` |

### `DashboardRecentItem` (display shape, not stored)

| Field | Type | Source |
|---|---|---|
| `id` | `string` | `entry.id` |
| `relativeTime` | `string` | formatted from `entry.timestamp` |
| `severity` | `HeadacheSeverity` | `entry.severity` |
| `severityLabel` | `string` | from `SEVERITY_LABELS` constant |
| `pressureAtLog` | `number \| null` | `entry.weather?.pressure` |

---

## Edge Cases

- Weather unavailable (error or loading) → `WeatherWidget` shows its own error/skeleton state; mini-list and log button still render normally.
- No entries in DB → show onboarding prompt instead of mini-list; "View all history" link is still rendered.
- Exactly 1–4 entries → show only those entries; no filler or "empty slot" UI.
- New entry logged via quick-log → mini-list refreshes to include it; if it's now the most recent, it appears at the top.
- `entry.weather` is null (logged while weather was unavailable) → pressure field shows `—` or equivalent placeholder.
- Dashboard mounts before the first weather fetch completes → pressure widget shows skeleton; do not block render.

---

## Out of Scope

- Correlation risk banner (requires F06 — deferred).
- Push notification surface (F07).
- Sleep summary widget (F08).
- Charts, graphs, or sparklines.
- Infinite scroll or pagination on the mini-list (always shows exactly the 5 most recent).

---

## Test Guidelines

- **Layer:** component/integration test (render the full page with mocked store and repository)
- **Key scenarios:**
  - Renders weather skeleton when `isLoading: true`; pressure data appears when `isLoading: false`
  - Renders onboarding prompt when `entries` is `[]`
  - Renders exactly 3 items when 3 entries exist; renders exactly 5 when 5+ exist
  - Mini-list shows correct relative time, severity label, and pressure for each entry
  - `entry.weather` null → pressure renders as a placeholder, no crash
  - Clicking "Log Headache" opens the quick-log panel
  - Submitting the quick-log form closes the panel and adds the new entry to the top of the mini-list
  - Clicking a mini-list item navigates to the history page
  - Clicking "View all history" navigates to the history page
- **Do NOT test:**
  - `weatherStore` fetch behavior (tested in F02)
  - Repository internals (tested in F01)
  - Next.js router navigation internals
