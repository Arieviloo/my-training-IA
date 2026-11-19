import { useState } from 'react';
import { requestWeather } from '@/services/weather.service';
import type { WeatherReport } from '@/types/Weather';
import type { Coordinates } from '@/hooks/useGeolocation';

export interface WeatherSearchState {
  report: WeatherReport | null;
  isLoading: boolean;
  error: string | null;
  searchByCity: (cityName: string) => void;
  searchByCoordinates: (coordinates: Coordinates) => void;
}

function runSearch(
  query: Parameters<typeof requestWeather>[0],
  apply: (report: WeatherReport) => void,
  fail: (message: string) => void,
): void {
  requestWeather(query)
    .then(apply)
    .catch((error: unknown) => {
      fail(error instanceof Error ? error.message : 'Erro inesperado.');
    });
}

export function useWeather(): WeatherSearchState {
  const [report, setReport] = useState<WeatherReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const beginSearch = (): void => {
    setIsLoading(true);
    setError(null);
  };

  const searchByCity = (cityName: string): void => {
    beginSearch();
    runSearch(
      { cityName },
      (result) => {
        setReport(result);
        setIsLoading(false);
      },
      (message) => {
        setError(message);
        setIsLoading(false);
      },
    );
  };

  const searchByCoordinates = (coordinates: Coordinates): void => {
    beginSearch();
    runSearch(
      { latitude: coordinates.latitude, longitude: coordinates.longitude },
      (result) => {
        setReport(result);
        setIsLoading(false);
      },
      (message) => {
        setError(message);
        setIsLoading(false);
      },
    );
  };

  return { report, isLoading, error, searchByCity, searchByCoordinates };
}
