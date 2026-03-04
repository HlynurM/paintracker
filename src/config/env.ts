// ─── Environment Variables ────────────────────────────────────────────────────
// Single place to access all env vars. Throws at startup if a required one
// is missing rather than failing mysteriously at runtime.
// NEVER import process.env directly elsewhere in the app — always use this file.

function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}\nAdd it to .env.local`
    )
  }
  return value
}

// Optional env vars — return undefined if not set
function optionalEnv(key: string): string | undefined {
  return process.env[key]
}

// ── Supabase (optional until sync is enabled) ─────────────────────────────────
// These are NEXT_PUBLIC_ so they're safe to expose to the browser.
export const env = {
  supabase: {
    url: optionalEnv('NEXT_PUBLIC_SUPABASE_URL'),
    anonKey: optionalEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  },
  // Add more env vars here as needed
} as const

// Type guard — call this before using Supabase features
export function isSupabaseConfigured(): boolean {
  return Boolean(env.supabase.url && env.supabase.anonKey)
}
