import { useState, type FormEvent } from 'react';
import { MapPin, Search } from 'lucide-react';

interface SearchBarProps {
  isLocationLoading: boolean;
  onSearchCity: (cityName: string) => void;
  onUseLocation: () => void;
}

export function SearchBar({ isLocationLoading, onSearchCity, onUseLocation }: SearchBarProps) {
  const [cityName, setCityName] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    onSearchCity(cityName);
  };

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className="flex w-full max-w-md items-center gap-2"
    >
      <label htmlFor="city-input" className="sr-only">
        Digite o nome da cidade
      </label>
      <input
        id="city-input"
        type="text"
        value={cityName}
        onChange={(event) => setCityName(event.target.value)}
        placeholder="Digite uma cidade..."
        className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <button
        type="submit"
        aria-label="Buscar clima da cidade"
        className="rounded-md bg-primary px-3 py-2 text-primary-foreground hover:bg-primary/90"
      >
        <Search className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={onUseLocation}
        disabled={isLocationLoading}
        aria-label="Usar minha localização"
        className="rounded-md bg-secondary px-3 py-2 text-secondary-foreground hover:bg-secondary/90 disabled:opacity-50"
      >
        <MapPin className="h-5 w-5" />
      </button>
    </form>
  );
}
