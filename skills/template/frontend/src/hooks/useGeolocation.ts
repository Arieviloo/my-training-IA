import { useState } from 'react';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface GeolocationResult {
  coordinates: Coordinates | null;
  isLoading: boolean;
  error: string | null;
  requestLocation: () => void;
}

interface UseGeolocationOptions {
  onCoordinatesFound?: (coordinates: Coordinates) => void;
}

const GEOLOCATION_ERROR_MESSAGES: Record<number, string> = {
  1: 'Permissão de localização negada.',
  2: 'Localização indisponível no momento.',
  3: 'Tempo esgotado ao obter localização.',
};

const DEFAULT_LOCATION_ERROR = 'Não foi possível obter sua localização.';

function toResultMessage(error: GeolocationPositionError): string {
  return GEOLOCATION_ERROR_MESSAGES[error.code] ?? DEFAULT_LOCATION_ERROR;
}

export function useGeolocation(options: UseGeolocationOptions = {}): GeolocationResult {
  const { onCoordinatesFound } = options;
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = (): void => {
    if (!('geolocation' in navigator)) {
      setError(DEFAULT_LOCATION_ERROR);
      return;
    }
    setIsLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const found: Coordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setCoordinates(found);
        setIsLoading(false);
        onCoordinatesFound?.(found);
      },
      (positionError) => {
        setError(toResultMessage(positionError));
        setIsLoading(false);
      },
    );
  };

  return { coordinates, isLoading, error, requestLocation };
}
