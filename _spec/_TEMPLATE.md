# F{id} — {Feature Name}

> **Status:** planned | in-progress | done
> **Branch:** {spec/f{id}-{slug} or — if no dedicated branch}
> **Created:** YYYY-MM-DD
> **Depends on:** F{x}, F{y} | —

---

## Purpose

What problem this solves for the user. One short paragraph focused on the user-facing outcome, not the implementation.

---

## Acceptance Criteria

A user-visible checklist. Each item is something a human can verify by using the app — no implementation details here.

- [ ] {criterion}
- [ ] {criterion}

---

## Functional Requirements

Numbered list. Each item describes a concrete, verifiable system behavior.

1. ...
2. ...

---

## Data Contracts

_(Only include if this feature defines or depends on specific types, DB tables, API fields, or hook shapes. Remove this section entirely if not applicable.)_

### {Type or Table Name}

| Field | Type | Notes |
|---|---|---|
| `field` | `Type` | description |

---

## Files

Files this feature will create or modify. Be specific about paths.

**Create:**
- `src/features/{name}/...` — what it does

**Modify:**
- `src/...` — what changes and why

---

## Edge Cases

Behaviors the implementation must handle explicitly — inputs or states that aren't the happy path.

- ...

---

## Out of Scope

What this feature explicitly does NOT do in this iteration. Keeps scope from creeping in during build.

- ...

---

## Test Guidelines

- **Layer:** unit | component | integration
- **Key scenarios to cover:**
  - ...
- **Do NOT test:**
  - ...
