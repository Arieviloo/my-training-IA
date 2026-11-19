const API_URL = 'http://localhost:3000'

export interface WeatherData {
  city: string
  region: string | null
  country: string | null
  latitude: number
  longitude: number
  current: {
    time: string
    temperature: number
    apparent_temperature: number
    humidity: number
    wind_speed: number
    is_day: boolean
    weather_code: number
    description: string
  }
  daily: {
    max: number
    min: number
  }
}

export async function getWeather(city: string): Promise<WeatherData> {
  const response = await fetch(
    `${API_URL}/api/weather?city=${encodeURIComponent(city)}`
  )
  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.error ?? 'Erro ao buscar o clima')
  }
  return response.json()
}

export async function getWeatherHere(lat: number, lon: number): Promise<WeatherData> {
  const response = await fetch(`${API_URL}/api/weather/here?lat=${lat}&lon=${lon}`)
  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.error ?? 'Erro ao buscar o clima')
  }
  return response.json()
}
