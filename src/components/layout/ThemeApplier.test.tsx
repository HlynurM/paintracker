import { render } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import ThemeApplier from './ThemeApplier'

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('@/features/settings', () => ({
  useSettingsStore: vi.fn(),
}))

import { useSettingsStore } from '@/features/settings'
const mockUseSettingsStore = vi.mocked(useSettingsStore)

function mockTheme(themeMode: 'light' | 'dark' | 'system') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mockUseSettingsStore.mockImplementation((selector: any) => selector({ themeMode }))
}

function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  })
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ThemeApplier', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('dark')
    vi.clearAllMocks()
  })

  it("'dark' mode → .dark class present on <html>", () => {
    mockTheme('dark')
    render(<ThemeApplier />)
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it("'light' mode → .dark class absent on <html>", () => {
    document.documentElement.classList.add('dark')
    mockTheme('light')
    render(<ThemeApplier />)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it("'system' with matchMedia.matches: true → .dark class present", () => {
    mockMatchMedia(true)
    mockTheme('system')
    render(<ThemeApplier />)
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })
})
