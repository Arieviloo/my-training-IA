import { useState, useEffect, FormEvent } from 'react'
import {
  Search,
  MapPin,
  Loader2,
  Thermometer,
  Droplets,
  Wind,
  Sun,
  Moon,
  CloudSun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudFog,
  type LucideIcon,
} from 'lucide-react'
import { getWeather, getWeatherHere, type WeatherData } from '../lib/weather'
import { Button } from './ui/button'

function iconFor(code: number, isDay: boolean): LucideIcon {
  if (code === 0 || code === 1) return isDay ? Sun : Moon
  if (code === 2) return isDay ? CloudSun : Moon
  if (code === 3) return Cloud
  if (code === 45 || code === 48) return CloudFog
  if (code >= 51 && code <= 67) return CloudRain
  if (code >= 71 && code <= 77) return CloudSnow
  if (code >= 80 && code <= 86) return CloudRain
  if (code >= 95) return CloudLightning
  return Cloud
}

function WeatherPanel({ data }: { data: WeatherData }) {
  const Icon = iconFor(data.current.weather_code, data.current.is_day)

  return (
    <div className="w-full max-w-md rounded-2xl border bg-card/60 shadow-xl backdrop-blur-sm overflow-hidden">
      <div className="flex flex-col items-center gap-1 px-6 py-5 bg-secondary/50 border-b">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          {data.city}
          {data.region ? `, ${data.region}` : ''}
          {data.country ? ` · ${data.country}` : ''}
        </div>
        <span className="text-xs text-muted-foreground/70">
          {new Date(data.current.time).toLocaleString('pt-BR', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>

      <div className="flex items-center justify-center gap-6 px-6 py-8">
        <Icon className="w-20 h-20 text-primary" strokeWidth={1.2} />
        <div className="flex flex-col">
          <span className="text-6xl font-bold tracking-tighter">
            {Math.round(data.current.temperature)}°C
          </span>
          <span className="text-muted-foreground">
            Sensação de {Math.round(data.current.apparent_temperature)}°C
          </span>
        </div>
      </div>

      <div className="px-6 pb-2 text-center text-lg font-medium">
        {data.current.description}
      </div>

      <div className="grid grid-cols-3 divide-x border-t">
        <div className="flex flex-col items-center gap-1 py-4">
          <Thermometer className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-semibold">
            {Math.round(data.daily.max)}° / {Math.round(data.daily.min)}°
          </span>
          <span className="text-xs text-muted-foreground">Máx / Mín</span>
        </div>
        <div className="flex flex-col items-center gap-1 py-4">
          <Droplets className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-semibold">{data.current.humidity}%</span>
          <span className="text-xs text-muted-foreground">Umidade</span>
        </div>
        <div className="flex flex-col items-center gap-1 py-4">
          <Wind className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-semibold">
            {Math.round(data.current.wind_speed)} km/h
          </span>
          <span className="text-xs text-muted-foreground">Vento</span>
        </div>
      </div>
    </div>
  )
}

function WeatherCard() {
  const [city, setCity] = useState('')
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [locating, setLocating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = async (term: string) => {
    if (!term.trim()) return
    setLoading(true)
    setError(null)
    try {
      setWeather(await getWeather(term))
    } catch (err) {
      setWeather(null)
      setError(err instanceof Error ? err.message : 'Erro inesperado')
    } finally {
      setLoading(false)
    }
  }

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocalização não é suportada neste navegador.')
      return
    }
    setLocating(true)
    setError(null)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          setWeather(await getWeatherHere(pos.coords.latitude, pos.coords.longitude))
        } catch (err) {
          setWeather(null)
          setError(err instanceof Error ? err.message : 'Erro inesperado')
        } finally {
          setLocating(false)
        }
      },
      () => {
        setLocating(false)
        setError('Não foi possível obter sua localização.')
      },
      { timeout: 10000 }
    )
  }

  useEffect(() => {
    search('São Paulo')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    search(city)
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <form onSubmit={onSubmit} className="flex w-full max-w-md gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Digite uma cidade..."
            className="w-full h-10 rounded-lg border bg-card/60 backdrop-blur-sm pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Buscar'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={useMyLocation}
          disabled={locating}
          title="Usar minha localização"
        >
          {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
        </Button>
      </form>

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive max-w-md text-center">
          {error}
        </div>
      )}

      {weather && <WeatherPanel data={weather} />}
    </div>
  )
}

export default WeatherCard
