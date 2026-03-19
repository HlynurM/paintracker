// ─── Air Quality API ──────────────────────────────────────────────────────────
// Fetches AQI + dust from Open-Meteo's air quality endpoint (free, no API key).
// This is separate from weatherApi.ts so failures are isolated.

export interface AirQualityData {
  airQualityIndex: number  // european_aqi
  dust: number             // µg/m³
}

interface OpenMeteoAQResponse {
  current: {
    european_aqi: number
    dust: number
  }
}

export async function fetchAirQuality(lat: number, lon: number): Promise<AirQualityData> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: 'european_aqi,dust',
    timezone: 'auto',
  })

  const response = await fetch(
    `https://air-quality-api.open-meteo.com/v1/air-quality?${params}`
  )

  if (!response.ok) {
    throw new Error(`Air quality API error: ${response.status} ${response.statusText}`)
  }

  const json = (await response.json()) as OpenMeteoAQResponse
  return {
    airQualityIndex: json.current.european_aqi,
    dust: json.current.dust,
  }
}
