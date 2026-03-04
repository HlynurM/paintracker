import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    // Use happy-dom — a fast, lightweight browser environment simulation.
    // Needed so React and DOM APIs work in tests.
    environment: 'happy-dom',

    // Make Vitest globals (describe, it, expect) available without importing them.
    // This matches Jest's behaviour and matches what most examples online show.
    globals: true,

    // Run this file before each test file — sets up jest-dom matchers
    // like `expect(el).toBeInTheDocument()`.
    setupFiles: ['./src/tests/setup.ts'],
  },
  resolve: {
    alias: {
      // Match the same @/ alias as tsconfig.json so imports work identically.
      '@': path.resolve(__dirname, './src'),
    },
  },
})
