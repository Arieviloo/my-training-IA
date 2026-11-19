import type { CurrentWeather, WeatherLocation } from '../types/Weather';

const GEOCODING_BASE_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_BASE_URL = 'https://api.open-meteo.com/v1/forecast';
const GEOCODING_RESULT_LIMIT = '1';
const FORECAST_HOURLY_DAYS = '1';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface GeocodingParams {
  cityName: string;
}

interface GeocodingResponse {
  results?: GeocodingResult[];
}

interface GeocodingResult {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}

interface ForecastResponse {
  current?: ForecastCurrent;
}

interface ForecastCurrent {
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  is_day: number;
  weather_code: number;
  wind_speed_10m: number;
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Open-Meteo request failed with status ${response.status}`);
  }
  return (await response.json()) as T;
}

export async function searchLocation(
  params: GeocodingParams,
): Promise<WeatherLocation | undefined> {
  const url = new URL(GEOCODING_BASE_URL);
  url.searchParams.set('name', params.cityName);
  url.searchParams.set('count', GEOCODING_RESULT_LIMIT);
  url.searchParams.set('language', 'pt');
  url.searchParams.set('format', 'json');
  const data = await fetchJson<GeocodingResponse>(url.toString());
  const result = data.results?.[0];
  if (result === undefined) {
    return undefined;
  }
  return {
    name: result.name,
    country: result.country,
    latitude: result.latitude,
    longitude: result.longitude,
  };
}

export async function fetchCurrentWeather(
  coordinates: Coordinates,
): Promise<CurrentWeather | undefined> {
  const url = new URL(FORECAST_BASE_URL);
  url.searchParams.set('latitude', String(coordinates.latitude));
  url.searchParams.set('longitude', String(coordinates.longitude));
  url.searchParams.set('current', 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m');
  url.searchParams.set('forecast_days', FORECAST_HOURLY_DAYS);
  url.searchParams.set('timezone', 'auto');
  const data = await fetchJson<ForecastResponse>(url.toString());
  const current = data.current;
  if (current === undefined) {
    return undefined;
  }
  return {
    temperatureC: current.temperature_2m,
    apparentTemperatureC: current.apparent_temperature,
    humidityPct: current.relative_humidity_2m,
    windSpeedKmh: current.wind_speed_10m,
    weatherCode: current.weather_code,
    isDay: current.is_day === 1,
  };
}
