import { cn } from '@/lib/utils';

const WEATHER_DESCRIPTIONS: Record<number, string> = {
  0: 'Céu limpo',
  1: 'Predominantemente limpo',
  2: 'Parcialmente nublado',
  3: 'Nublado',
  45: 'Nevoeiro',
  48: 'Nevoeiro com geada',
  51: 'Garoa fraca',
  53: 'Garoa moderada',
  55: 'Garoa intensa',
  56: 'Garoa congelante fraca',
  57: 'Garoa congelante intensa',
  61: 'Chuva fraca',
  63: 'Chuva moderada',
  65: 'Chuva forte',
  66: 'Chuva congelante fraca',
  67: 'Chuva congelante forte',
  71: 'Neve fraca',
  73: 'Neve moderada',
  75: 'Neve forte',
  77: 'Grãos de neve',
  80: 'Pancadas de chuva fracas',
  81: 'Pancadas de chuva moderadas',
  82: 'Pancadas de chuva fortes',
  85: 'Pancadas de neve fracas',
  86: 'Pancadas de neve fortes',
  95: 'Trovoada',
  96: 'Trovoada com granizo',
  99: 'Trovoada forte com granizo',
};

const UNKNOWN_DESCRIPTION = 'Condição desconhecida';

export function getWeatherDescription(weatherCode: number): string {
  return WEATHER_DESCRIPTIONS[weatherCode] ?? UNKNOWN_DESCRIPTION;
}

export function getWeatherIconClassName(weatherCode: number, isDay: boolean): string {
  if (weatherCode === 0 || weatherCode === 1) {
    return isDay ? 'text-yellow-400' : 'text-indigo-300';
  }
  if (weatherCode >= 71 && weatherCode <= 77) {
    return 'text-sky-200';
  }
  if (weatherCode >= 51 && weatherCode <= 67) {
    return 'text-blue-300';
  }
  if (weatherCode >= 80) {
    return 'text-blue-400';
  }
  return cn('text-gray-400');
}
