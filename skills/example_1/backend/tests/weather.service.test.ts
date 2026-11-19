import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/data/open-meteo.api', () => ({
  searchLocation: vi.fn(),
  fetchCurrentWeather: vi.fn(),
}));

import {
  fetchCurrentWeather,
  searchLocation,
} from '../src/data/open-meteo.api';
import {
  CityNotFoundError,
  getWeatherByCity,
  getWeatherByCoordinates,
  WeatherUnavailableError,
} from '../src/services/weather.service';

const LOCATION = {
  name: 'São Paulo',
  country: 'Brasil',
  latitude: -23.55,
  longitude: -46.63,
};

const CURRENT = {
  temperatureC: 27.1,
  apparentTemperatureC: 30.3,
  humidityPct: 60,
  windSpeedKmh: 12.7,
  weatherCode: 0,
  isDay: true,
};

const mockedSearchLocation = vi.mocked(searchLocation);
const mockedFetchCurrentWeather = vi.mocked(fetchCurrentWeather);

beforeEach(() => {
  vi.resetAllMocks();
});

describe('getWeatherByCity', () => {
  it('returns report when the city is found and forecast exists', async () => {
    mockedSearchLocation.mockResolvedValue(LOCATION);
    mockedFetchCurrentWeather.mockResolvedValue(CURRENT);
    const report = await getWeatherByCity('São Paulo');
    expect(mockedSearchLocation).toHaveBeenCalledWith({ cityName: 'São Paulo' });
    expect(mockedFetchCurrentWeather).toHaveBeenCalledWith(LOCATION);
    expect(report.location).toEqual(LOCATION);
    expect(report.current).toEqual(CURRENT);
  });

  it('throws CityNotFoundError when no city matches', async () => {
    mockedSearchLocation.mockResolvedValue(undefined);
    await expect(getWeatherByCity('XYZABCD')).rejects.toBeInstanceOf(
      CityNotFoundError,
    );
  });

  it('throws WeatherUnavailableError when forecast data is missing', async () => {
    mockedSearchLocation.mockResolvedValue(LOCATION);
    mockedFetchCurrentWeather.mockResolvedValue(undefined);
    await expect(getWeatherByCity('São Paulo')).rejects.toBeInstanceOf(
      WeatherUnavailableError,
    );
  });
});

describe('getWeatherByCoordinates', () => {
  it('returns report with formatted location name', async () => {
    mockedFetchCurrentWeather.mockResolvedValue(CURRENT);
    const report = await getWeatherByCoordinates({
      latitude: -23.55,
      longitude: -46.63,
    });
    expect(report.location.name).toBe('-23.5500, -46.6300');
    expect(report.location.country).toBe('');
    expect(report.current).toEqual(CURRENT);
  });
});
