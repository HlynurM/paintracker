'use client'

// ─── ThemeApplier ─────────────────────────────────────────────────────────────
// Pure side-effect component: reads themeMode from settings and applies/removes
// the `.dark` class on <html>. Returns null (renders nothing).

import { useEffect } from 'react'
import { useSettingsStore } from '@/features/settings'

export default function ThemeApplier() {
  const themeMode = useSettingsStore((s) => s.themeMode)

  useEffect(() => {
    const root = document.documentElement

    if (themeMode === 'dark') {
      root.classList.add('dark')
      return
    }

    if (themeMode === 'light') {
      root.classList.remove('dark')
      return
    }

    // 'system' — follow prefers-color-scheme
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }

    apply(mq)
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [themeMode])

  return null
}
