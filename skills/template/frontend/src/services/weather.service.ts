import type { WeatherReport } from '@/types/Weather';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export interface WeatherQuery {
  cityName?: string;
  latitude?: number;
  longitude?: number;
}

function buildQueryString(query: WeatherQuery): string {
  const params = new URLSearchParams();
  if (query.cityName !== undefined) {
    params.set('city', query.cityName);
  }
  if (query.latitude !== undefined && query.longitude !== undefined) {
    params.set('lat', String(query.latitude));
    params.set('lon', String(query.longitude));
  }
  return params.toString();
}

async function requestWeather(query: WeatherQuery): Promise<WeatherReport> {
  const url = `${API_BASE_URL}/weather?${buildQueryString(query)}`;
  const response = await fetch(url);
  if (!response.ok) {
    const body = (await response.json()) as { error?: string };
    throw new Error(body.error ?? 'Não foi possível obter o clima.');
  }
  return (await response.json()) as WeatherReport;
}

export { requestWeather };
