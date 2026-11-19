import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

vi.mock('../src/data/open-meteo.api', () => ({
  searchLocation: vi.fn(),
  fetchCurrentWeather: vi.fn(),
}));

import { fetchCurrentWeather, searchLocation } from '../src/data/open-meteo.api';
import { createApp } from '../src/app';

const mockedSearchLocation = vi.mocked(searchLocation);
const mockedFetchCurrentWeather = vi.mocked(fetchCurrentWeather);

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

const app = createApp();

beforeEach(() => {
  vi.resetAllMocks();
});

describe('GET /weather', () => {
  it('returns 200 with weather report for a valid city', async () => {
    mockedSearchLocation.mockResolvedValue(LOCATION);
    mockedFetchCurrentWeather.mockResolvedValue(CURRENT);
    const response = await request(app).get('/weather?city=São Paulo');
    expect(response.status).toBe(200);
    expect(response.body.location.name).toBe('São Paulo');
    expect(response.body.current.temperatureC).toBe(27.1);
  });

  it('returns 404 when the city is not found', async () => {
    mockedSearchLocation.mockResolvedValue(undefined);
    const response = await request(app).get('/weather?city=XYZABCD');
    expect(response.status).toBe(404);
    expect(response.body.error).toContain('XYZABCD');
  });

  it('returns 200 with weather report for valid coordinates', async () => {
    mockedFetchCurrentWeather.mockResolvedValue(CURRENT);
    const response = await request(app).get('/weather?lat=-23.55&lon=-46.63');
    expect(response.status).toBe(200);
    expect(response.body.current.windSpeedKmh).toBe(12.7);
  });

  it('returns 400 when city is too short', async () => {
    const response = await request(app).get('/weather?city=x');
    expect(response.status).toBe(400);
  });

  it('returns 400 when no valid query is provided', async () => {
    const response = await request(app).get('/weather?lat=999&lon=abc');
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Informe uma cidade ou coordenadas válidas.');
  });
});
