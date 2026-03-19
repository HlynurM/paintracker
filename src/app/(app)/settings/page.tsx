'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useSettingsStore } from '@/features/settings'
import { db } from '@/db/db'
import { seedTestDatabase, clearAllData } from '@/lib/seedData'

// ─── Dev-only seed panel ───────────────────────────────────────────────────────

interface DbCounts {
  headaches: number
  weather: number
  sleep: number
  remedies: number
}

async function fetchCounts(): Promise<DbCounts> {
  const [headaches, weather, sleep, remedies] = await Promise.all([
    db.headacheEntries.count(),
    db.weatherReadings.count(),
    db.sleepRecords.count(),
    db.remedies.count(),
  ])
  return { headaches, weather, sleep, remedies }
}

function DevSeedPanel() {
  const [counts, setCounts] = useState<DbCounts | null>(null)
  const [seeding, setSeeding] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)
  const [lastResult, setLastResult] = useState<string | null>(null)

  useEffect(() => {
    fetchCounts().then(setCounts)
  }, [])

  async function handleSeed() {
    setSeeding(true)
    setLastResult(null)
    try {
      const result = await seedTestDatabase()
      setLastResult(
        `Seeded: ${result.headaches} headaches, ${result.weather} weather, ${result.sleep} sleep, ${result.remedies} remedies — reloading…`
      )
      // Full page reload to bust Next.js router cache so Dashboard/History
      // hooks re-mount and pick up the newly written IndexedDB data.
      setTimeout(() => { window.location.href = '/dashboard' }, 800)
    } finally {
      setSeeding(false)
    }
  }

  async function handleClear() {
    setClearing(true)
    setLastResult(null)
    try {
      await clearAllData()
      setLastResult('All data cleared — reloading…')
      setTimeout(() => { window.location.href = '/dashboard' }, 800)
    } finally {
      setClearing(false)
      setConfirmClear(false)
    }
  }

  return (
    <div className="rounded-xl border border-dashed border-violet-500/40 bg-violet-500/5 p-4 space-y-3">
      <h2 className="text-sm font-semibold text-violet-400">Developer</h2>

      {counts && (
        <p className="text-xs text-muted-foreground">
          DB: {counts.headaches} headaches · {counts.weather} weather · {counts.sleep} sleep · {counts.remedies} remedies
        </p>
      )}

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={handleSeed}
          disabled={seeding || clearing}
          className="rounded-md px-3 py-1.5 text-xs font-medium bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50 transition-colors"
        >
          {seeding ? 'Seeding…' : 'Seed 60-day test data'}
        </button>

        {!confirmClear ? (
          <button
            onClick={() => setConfirmClear(true)}
            disabled={seeding || clearing}
            className="rounded-md px-3 py-1.5 text-xs font-medium border border-border text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
          >
            Clear all data
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs text-destructive">Are you sure?</span>
            <button
              onClick={handleClear}
              disabled={clearing}
              className="rounded-md px-3 py-1.5 text-xs font-medium bg-destructive text-destructive-foreground hover:opacity-90 disabled:opacity-50 transition-colors"
            >
              {clearing ? 'Clearing…' : 'Yes, clear'}
            </button>
            <button
              onClick={() => setConfirmClear(false)}
              className="rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {lastResult && (
        <p className="text-xs text-green-400">{lastResult}</p>
      )}
    </div>
  )
}

export default function SettingsPage() {
  const {
    temperatureUnit,
    windSpeedUnit,
    notificationsEnabled,
    alertThreshold,
    minConfidenceToAlert,
    themeMode,
    setTemperatureUnit,
    setWindSpeedUnit,
    setNotificationsEnabled,
    setAlertThreshold,
    setThemeMode,
  } = useSettingsStore()

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-lg font-semibold">Settings</h1>

      {/* Appearance */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
        <span className="text-sm font-medium">Appearance</span>
        <div className="flex gap-1">
          <button
            type="button"
            aria-label="Light mode"
            onClick={() => setThemeMode('light')}
            className={`rounded-md p-1.5 transition-colors ${
              themeMode === 'light'
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Sun className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Dark mode"
            onClick={() => setThemeMode('dark')}
            className={`rounded-md p-1.5 transition-colors ${
              themeMode === 'dark'
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Moon className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="System mode"
            onClick={() => setThemeMode('system')}
            className={`rounded-md p-1.5 transition-colors ${
              themeMode === 'system'
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Monitor className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Temperature unit */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
        <span className="text-sm font-medium">Temperature</span>
        <div className="flex gap-1">
          {(['C', 'F'] as const).map((unit) => (
            <button
              key={unit}
              onClick={() => setTemperatureUnit(unit)}
              className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                temperatureUnit === unit
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              °{unit}
            </button>
          ))}
        </div>
      </div>

      {/* Wind speed unit */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
        <span className="text-sm font-medium">Wind Speed</span>
        <div className="flex gap-1">
          <button
            onClick={() => setWindSpeedUnit('kmh')}
            className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
              windSpeedUnit === 'kmh'
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            km/h
          </button>
          <button
            onClick={() => setWindSpeedUnit('mph')}
            className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
              windSpeedUnit === 'mph'
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            mph
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-4">
        <h2 className="text-sm font-semibold">Notifications</h2>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Risk alerts</span>
          <button
            type="button"
            role="switch"
            aria-checked={notificationsEnabled}
            onClick={async () => {
              if (!notificationsEnabled) {
                const permission = await Notification.requestPermission()
                if (permission === 'granted') {
                  setNotificationsEnabled(true)
                }
              } else {
                setNotificationsEnabled(false)
              }
            }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              notificationsEnabled ? 'bg-violet-600' : 'bg-muted'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Alert threshold</span>
          <div className="flex gap-1">
            {(['medium', 'high'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setAlertThreshold(t)}
                className={`rounded-md px-3 py-1 text-sm font-medium capitalize transition-colors ${
                  alertThreshold === t
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t === 'medium' ? 'Medium+' : 'High only'}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Alerts fire when prediction confidence ≥ {minConfidenceToAlert}%
        </p>
      </div>

      {process.env.NODE_ENV !== 'production' && <DevSeedPanel />}
    </div>
  )
}
