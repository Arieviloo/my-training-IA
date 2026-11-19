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
      className="flex w-full items-center gap-2 rounded border border-hairline bg-panel p-1.5 backdrop-blur-sm focus-within:border-signal/50"
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
        className="w-full flex-1 bg-transparent px-3 py-2 font-mono text-sm text-foreground placeholder:text-mist/60 focus:outline-none"
      />
      <button
        type="submit"
        aria-label="Buscar clima da cidade"
        className="rounded bg-signal px-3 py-2 text-void transition-colors hover:bg-signal/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal disabled:opacity-50"
      >
        <Search className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onUseLocation}
        disabled={isLocationLoading}
        aria-label="Usar minha localização"
        className="rounded px-3 py-2 text-mist transition-colors hover:text-signal focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal disabled:opacity-50"
      >
        <MapPin className={`h-4 w-4 ${isLocationLoading ? 'motion-safe:animate-pulse' : ''}`} />
      </button>
    </form>
  );
}
