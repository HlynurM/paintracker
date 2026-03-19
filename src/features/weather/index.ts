// ─── Weather Feature — Public API ─────────────────────────────────────────────
// Only import from this file when other features or pages need weather data.
// Never import weather internals (store slices, raw services) from outside this feature.

export { useWeather } from './hooks/useWeather'
export { useWeatherStore } from './store/weatherStore'
export { default as WeatherCard } from './components/WeatherCard'
export { default as WeatherWidget } from './components/WeatherWidget'
export { default as WeatherBadge } from './components/WeatherBadge'
export type { WeatherData, WeatherSnapshot, PressureTrend, PressureRisk } from '@/types/weather'
