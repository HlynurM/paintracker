# Testing Strategy — PainTracker

## Stack

- **Vitest** — test runner, config in `vitest.config.ts`
- **React Testing Library** — component and hook tests
- **@testing-library/user-event** — simulate real user interactions
- **happy-dom** or **jsdom** — DOM environment for component tests

---

## Test Pyramid

```
        ╱ E2E ╲               (future — Playwright, few tests)
       ╱──────────╲
      ╱ Integration ╲         (repositories with real Dexie)
     ╱────────────────╲
    ╱    Component      ╲     (RTL — components + hooks)
   ╱────────────────────╲
  ╱    Unit (most tests)  ╲   (services, lib, pure functions)
 ╱──────────────────────────╲
```

Write the most tests at the bottom (pure logic), fewer at the top (UI).

---

## Rules by Layer

### 1. Pure functions — services, lib/, utils
- Test with plain Vitest `describe/it/expect`
- No mocking needed — input → output
- Aim for full branch coverage

```ts
// pressureAnalysis.test.ts
import { computeTrend } from './pressureAnalysis'

it('detects falling pressure from a negative delta', () => {
  expect(computeTrend(-4)).toBe('falling')
})
```

### 2. Repositories — `db/repositories/`
- Use a real in-memory Dexie instance (not mocked)
- Import the Dexie class and create a fresh db per test
- Test: save → read, range queries, pruning

```ts
// headacheRepository.test.ts
import Dexie from 'dexie'
import { createHeadacheRepository } from './headacheRepository'

let db: Dexie
beforeEach(() => {
  db = new Dexie('test-db')
  db.version(1).stores({ headacheEntries: '++id, timestamp' })
})
afterEach(() => db.delete())
```

### 3. Hooks — `features/*/hooks/`
- Use `renderHook` from RTL
- Mock services and repositories with `vi.mock()`
- Assert state transitions, not implementation details

```ts
// useHeadacheLog.test.ts
import { renderHook, act } from '@testing-library/react'
import { useHeadacheLog } from './useHeadacheLog'
vi.mock('../services/headacheService')

it('sets status to saved after submit', async () => {
  const { result } = renderHook(() => useHeadacheLog())
  await act(() => result.current.submit({ severity: 7 }))
  expect(result.current.status).toBe('saved')
})
```

### 4. Components — `features/*/components/`
- Use RTL `render` + `screen` + `userEvent`
- Do not test Tailwind classes — test behavior and accessible roles
- Mock hooks, not internal implementation

```ts
// HeadacheForm.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import HeadacheForm from './HeadacheForm'
vi.mock('../hooks/useHeadacheLog', () => ({ useHeadacheLog: () => mockHook }))

it('submits with selected severity', async () => {
  render(<HeadacheForm />)
  await userEvent.click(screen.getByRole('button', { name: /log/i }))
  expect(mockHook.submit).toHaveBeenCalled()
})
```

---

## File Naming Convention

| File | Test file |
|---|---|
| `pressureAnalysis.ts` | `pressureAnalysis.test.ts` |
| `HeadacheForm.tsx` | `HeadacheForm.test.tsx` |
| `useHeadacheLog.ts` | `useHeadacheLog.test.ts` |
| `headacheRepository.ts` | `headacheRepository.test.ts` |

Co-locate test files next to the file they test. No separate `__tests__` directories.

---

## What NOT to Test

- `shadcn/ui` components (they have their own tests)
- Next.js routing behavior
- Tailwind class names
- Zustand store shape directly — test via hooks
- Implementation details: internal state, private functions

---

## vitest.config.ts (minimal)

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/tests/setup.ts'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
```

---

## Test Setup File  (`src/tests/setup.ts`)

```ts
import '@testing-library/jest-dom'
// Add global mocks here if needed (e.g., matchMedia, IntersectionObserver)
```

---

## Running Tests

```bash
pnpm test           # watch mode
pnpm test --run     # CI / single pass
pnpm test --coverage
```
