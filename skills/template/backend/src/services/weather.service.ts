import {
  fetchCurrentWeather,
  searchLocation,
  type Coordinates,
} from '../data/open-meteo.api';
import type { WeatherReport } from '../types/Weather';

export class CityNotFoundError extends Error {
  constructor(cityName: string) {
    super(`City "${cityName}" not found`);
    this.name = 'CityNotFoundError';
  }
}

export class WeatherUnavailableError extends Error {
  constructor() {
    super('Current weather data is unavailable');
    this.name = 'WeatherUnavailableError';
  }
}

function formatCoordinateName(coordinates: Coordinates): string {
  return `${coordinates.latitude.toFixed(4)}, ${coordinates.longitude.toFixed(4)}`;
}

async function buildWeatherReport(
  location: { name: string; country: string },
  coordinates: Coordinates,
): Promise<WeatherReport> {
  const current = await fetchCurrentWeather(coordinates);
  if (current === undefined) {
    throw new WeatherUnavailableError();
  }
  return {
    location: {
      name: location.name,
      country: location.country,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
    },
    current,
  };
}

export async function getWeatherByCity(cityName: string): Promise<WeatherReport> {
  const location = await searchLocation({ cityName });
  if (location === undefined) {
    throw new CityNotFoundError(cityName);
  }
  return buildWeatherReport(location, location);
}

export async function getWeatherByCoordinates(
  coordinates: Coordinates,
): Promise<WeatherReport> {
  return buildWeatherReport(
    { name: formatCoordinateName(coordinates), country: '' },
    coordinates,
  );
}
