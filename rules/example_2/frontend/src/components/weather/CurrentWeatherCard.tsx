import type { WeatherReport } from '@/types/Weather';
import { getWeatherDescription, getWeatherIconClassName } from '@/lib/weather-codes';

interface CurrentWeatherCardProps {
  report: WeatherReport;
}

export function CurrentWeatherCard({ report }: CurrentWeatherCardProps) {
  const { location, current } = report;
  return (
    <section
      aria-label={`Clima atual em ${location.name}`}
      className="w-full max-w-md rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm"
    >
      <header className="flex items-baseline justify-between">
        <h2 className="text-xl font-semibold">{location.name}</h2>
        <span className="text-sm text-muted-foreground">{location.country}</span>
      </header>
      <div className="mt-4 flex items-center justify-between">
        <p className="text-5xl font-bold">
          {Math.round(current.temperatureC)}°C
        </p>
        <div className="text-right">
          <p className="text-4xl font-semibold">
            <span className={getWeatherIconClassName(current.weatherCode, current.isDay)}>
              {current.isDay ? '☀️' : '🌙'}
            </span>
          </p>
          <p className="text-sm text-muted-foreground">
            {getWeatherDescription(current.weatherCode)}
          </p>
        </div>
      </div>
      <dl className="mt-6 grid grid-cols-3 gap-2 text-sm">
        <div className="rounded-lg bg-secondary/50 p-3 text-center">
          <dt className="text-muted-foreground">Sensação</dt>
          <dd className="font-semibold">{Math.round(current.apparentTemperatureC)}°C</dd>
        </div>
        <div className="rounded-lg bg-secondary/50 p-3 text-center">
          <dt className="text-muted-foreground">Umidade</dt>
          <dd className="font-semibold">{Math.round(current.humidityPct)}%</dd>
        </div>
        <div className="rounded-lg bg-secondary/50 p-3 text-center">
          <dt className="text-muted-foreground">Vento</dt>
          <dd className="font-semibold">{Math.round(current.windSpeedKmh)} km/h</dd>
        </div>
      </dl>
    </section>
  );
}
