import { describe, it, expect } from 'vitest'
import { toFahrenheit, toMph, formatTemperature, formatWindSpeed } from './units'

describe('toFahrenheit', () => {
  it('converts 0°C to 32°F', () => {
    expect(toFahrenheit(0)).toBe(32)
  })

  it('converts 100°C to 212°F', () => {
    expect(toFahrenheit(100)).toBe(212)
  })
})

describe('toMph', () => {
  it('converts 10 km/h correctly (1 decimal place)', () => {
    expect(toMph(10)).toBe(6.2)
  })
})

describe('formatTemperature', () => {
  it('formats in Celsius', () => {
    expect(formatTemperature(14, 'C')).toBe('14°C')
  })

  it('formats in Fahrenheit', () => {
    expect(formatTemperature(14, 'F')).toBe('57°F')
  })
})

describe('formatWindSpeed', () => {
  it('formats in km/h', () => {
    expect(formatWindSpeed(12, 'kmh')).toBe('12 km/h')
  })

  it('formats in mph', () => {
    expect(formatWindSpeed(12, 'mph')).toBe('7.5 mph')
  })
})
