import type { WeatherReport } from '@/types/Weather';
import { getWeatherDescription, getWeatherIconClassName } from '@/lib/weather-codes';
import { TemperatureReadout } from '@/components/weather/TemperatureReadout';
import { MetricStrip } from '@/components/weather/MetricStrip';

interface CurrentWeatherCardProps {
  report: WeatherReport;
}

function formatCoordinate(value: number): string {
  return value.toFixed(4);
}

export function CurrentWeatherCard({ report }: CurrentWeatherCardProps) {
  const { location, current } = report;
  return (
    <section
      aria-label={`Clima atual em ${location.name}`}
      className="flex w-full flex-col items-center gap-5 rounded border border-hairline bg-panel/80 p-8 shadow-glow backdrop-blur-sm"
    >
      <header className="flex w-full items-baseline justify-between">
        <h2 className="text-lg font-medium">{location.name}</h2>
        <p className="font-mono text-[10px] uppercase tracking-widest text-mist">
          {location.country}
        </p>
      </header>
      <TemperatureReadout
        temperatureC={current.temperatureC}
        description={getWeatherDescription(current.weatherCode)}
        icon={current.isDay ? '☀️' : '🌙'}
        iconClassName={getWeatherIconClassName(current.weatherCode, current.isDay)}
      />
      <p className="font-mono text-[10px] tracking-widest text-mist/70">
        lat {formatCoordinate(location.latitude)} · lon {formatCoordinate(location.longitude)}
      </p>
      <MetricStrip
        apparentTemperatureC={current.apparentTemperatureC}
        humidityPct={current.humidityPct}
        windSpeedKmh={current.windSpeedKmh}
      />
    </section>
  );
}
