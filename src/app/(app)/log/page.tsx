'use client'

import { useState } from 'react'
import HeadacheForm from '@/features/headache/components/HeadacheForm'
import SeveritySlider from '@/features/headache/components/SeveritySlider'
import WeatherBadge from '@/features/weather/components/WeatherBadge'

export default function LogPage() {
  const [severity, setSeverity] = useState(3)

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 pt-6">
      <div className="w-full max-w-md mx-auto space-y-6">
        <h1 className="text-lg font-semibold">Record Episode</h1>
        <SeveritySlider value={severity} onChange={setSeverity} />
        <WeatherBadge />
        <HeadacheForm severity={severity} onSeverityChange={setSeverity} />
      </div>
    </div>
  )
}
