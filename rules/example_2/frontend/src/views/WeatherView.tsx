import { SearchBar } from '@/components/weather/SearchBar';
import { CurrentWeatherCard } from '@/components/weather/CurrentWeatherCard';
import { WeatherFeedback } from '@/components/weather/WeatherFeedback';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useWeather } from '@/hooks/useWeather';

export function WeatherView() {
  const { report, isLoading, error, searchByCity, searchByCoordinates } = useWeather();
  const {
    isLoading: isLocationLoading,
    error: locationError,
    requestLocation,
  } = useGeolocation({
    onCoordinatesFound: searchByCoordinates,
  });

  return (
    <section
      aria-label="Painel de clima"
      className="flex w-full max-w-md flex-col items-center gap-4"
    >
      <SearchBar
        isLocationLoading={isLocationLoading}
        onSearchCity={searchByCity}
        onUseLocation={requestLocation}
      />
      <WeatherFeedback
        isLoading={isLoading}
        error={error ?? locationError}
        hasReport={report !== null}
      />
      {report !== null && <CurrentWeatherCard report={report} />}
    </section>
  );
}
