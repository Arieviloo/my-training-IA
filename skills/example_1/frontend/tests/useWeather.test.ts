import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/services/weather.service', () => ({
  requestWeather: vi.fn(),
}));

import { requestWeather } from '@/services/weather.service';
import { useWeather } from '@/hooks/useWeather';
import type { WeatherReport } from '@/types/Weather';

const mockedRequestWeather = vi.mocked(requestWeather);

const REPORT: WeatherReport = {
  location: {
    name: 'São Paulo',
    country: 'Brasil',
    latitude: -23.55,
    longitude: -46.63,
  },
  current: {
    temperatureC: 27.1,
    apparentTemperatureC: 30.3,
    humidityPct: 60,
    windSpeedKmh: 12.7,
    weatherCode: 0,
    isDay: true,
  },
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe('useWeather', () => {
  it('stores report after a successful search by city', async () => {
    mockedRequestWeather.mockResolvedValue(REPORT);
    const { result } = renderHook(() => useWeather());
    act(() => {
      result.current.searchByCity('São Paulo');
    });
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();
    await act(async () => {
      await Promise.resolve();
    });
    expect(mockedRequestWeather).toHaveBeenCalledWith({ cityName: 'São Paulo' });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.report).toEqual(REPORT);
  });

  it('stores error message when the search fails', async () => {
    mockedRequestWeather.mockRejectedValue(new Error('City "XYZ" not found'));
    const { result } = renderHook(() => useWeather());
    act(() => {
      result.current.searchByCity('XYZ');
    });
    await act(async () => {
      await Promise.resolve();
    });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.report).toBeNull();
    expect(result.current.error).toBe('City "XYZ" not found');
  });

  it('stores report after a successful search by coordinates', async () => {
    mockedRequestWeather.mockResolvedValue(REPORT);
    const { result } = renderHook(() => useWeather());
    act(() => {
      result.current.searchByCoordinates({ latitude: -23.55, longitude: -46.63 });
    });
    await act(async () => {
      await Promise.resolve();
    });
    expect(mockedRequestWeather).toHaveBeenCalledWith({
      latitude: -23.55,
      longitude: -46.63,
    });
    expect(result.current.report).toEqual(REPORT);
  });
});
