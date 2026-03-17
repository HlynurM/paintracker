You are helping the user create a new feature spec for the PainTracker project.

The user provided: $ARGUMENTS

Follow every step below in order. Do not skip steps. Show your work at each step so the user can follow along.

---

## Step 1 — Parse the input

Extract from `$ARGUMENTS`:
- **Feature name**: a short, human-readable title (e.g. "Sleep Log basic form")
- **Description**: what the feature does and why (can be a sentence or a few bullet points the user typed)
- **Depends on**: any F-ids mentioned (e.g. "depends on F01, F03") — optional
- **Out of scope hints**: anything the user explicitly said is NOT included

If the arguments are ambiguous or missing critical info (feature name at minimum), ask the user to clarify before continuing.

---

## Step 2 — Determine the next feature ID

Use the Glob tool to list all files matching `_spec/F*.md`. Extract the numeric part from each filename (e.g. `F04-history.md` → `4`). Find the highest number and add 1. That is the new feature's ID. Zero-pad to two digits (e.g. `12` → `F12`).

If no spec files exist yet, start at `F01`.

---

## Step 3 — Check git status

Run `git status --short` in the project root (`/Users/joiceozaki/DEV/paintracker/paintracker`).

**If there are uncommitted changes or untracked files:**
- Show the user the list of changed files.
- Say: "You have uncommitted changes. Please commit or stash them before creating a spec branch. Run `git stash` to stash, or commit your changes, then re-run /spec."
- **Stop here. Do not proceed until the working directory is clean.**

**If the working directory is clean:** continue to Step 4.

---

## Step 4 — Identify the current branch

Run `git branch --show-current` to get the current branch name. Report it to the user ("Currently on branch: `main`").

---

## Step 5 — Generate a safe branch name

Construct a branch name using this format:
```
spec/f{id}-{slug}
```
Where `{slug}` is the feature name lowercased, spaces replaced with hyphens, all non-alphanumeric characters removed (except hyphens). Keep it under 50 characters total.

Example: Feature name "Sleep Log basic form" with id F12 → `spec/f12-sleep-log-basic-form`

Then check if that branch already exists:
```
git branch --list spec/f{id}-*
```

If the branch name is already taken, append `-2`, `-3`, etc. until a free name is found. Report the chosen branch name to the user.

---

## Step 6 — Create and switch to the new branch

Run:
```
git checkout -b {branch-name}
```

Confirm to the user: "Switched to new branch `{branch-name}`."

---

## Step 7 — Draft the spec content

Using everything gathered — the user's description, the feature ID, dependencies, and any out-of-scope hints — draft a complete spec file following the template below exactly.

Fill every section thoughtfully based on what the user described. Do not leave placeholder text like `...` or `{example}` — write real content. If you genuinely cannot infer something (e.g. exact data types), write a clearly marked `TODO:` note so the user knows what to fill in.

Use the existing specs in `_spec/` as style references for tone and detail level.

**Template to use:**

```markdown
# {FID} — {Feature Name}

> **Status:** planned
> **Branch:** {branch-name}
> **Created:** {today's date, YYYY-MM-DD}
> **Depends on:** {F-ids or "—"}

---

## Purpose

{One paragraph: what user problem this solves. Focus on the outcome for the user, not the implementation.}

---

## Acceptance Criteria

A user-visible checklist. Each item is something a human can verify by using the app — no implementation details.

- [ ] {criterion}
- [ ] {criterion}

---

## Functional Requirements

Numbered list. Each item is a concrete, verifiable system behavior.

1. {requirement}
2. {requirement}

---

## Data Contracts

_(Only include if this feature defines or depends on specific types, DB tables, API fields, or hook shapes. Remove this section if not applicable.)_

### {Type or Table Name}

| Field | Type | Notes |
|---|---|---|
| `field` | `Type` | description |

---

## Files

Files this feature will create or modify. List every file; be specific about paths.

**Create:**
- `src/features/{name}/...` — {what it does}

**Modify:**
- `src/...` — {what changes}

---

## Edge Cases

Behaviors the implementation must handle explicitly — inputs or states that are not the happy path.

- {edge case}

---

## Out of Scope

What this feature explicitly does NOT do in this iteration.

- {out of scope item}

---

## Test Guidelines

- **Layer:** {unit | component | integration}
- **Key scenarios to cover:**
  - {scenario}
- **Do NOT test:**
  - {what to skip}
```

---

## Step 8 — Write the spec file

Write the drafted spec to:
```
_spec/{FID}-{slug}.md
```

Where `{slug}` is the same slug used in the branch name.

Confirm the file path to the user.

---

## Step 9 — Report summary

Print a clean summary:

```
Spec created:   _spec/{FID}-{slug}.md
Branch:         {branch-name}
Feature ID:     {FID}
Status:         planned

Next step: Review the spec, fill in any TODO items, then tell me "build {FID}" to start implementation.
```
