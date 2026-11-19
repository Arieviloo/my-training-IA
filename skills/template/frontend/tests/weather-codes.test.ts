import { describe, expect, it } from 'vitest';
import { getWeatherDescription, getWeatherIconClassName } from '@/lib/weather-codes';

describe('getWeatherDescription', () => {
  it('describes clear sky for code 0', () => {
    expect(getWeatherDescription(0)).toBe('Céu limpo');
  });

  it('describes rain for code 61', () => {
    expect(getWeatherDescription(61)).toBe('Chuva fraca');
  });

  it('describes thunderstorm for code 95', () => {
    expect(getWeatherDescription(95)).toBe('Trovoada');
  });

  it('falls back to unknown for unmapped codes', () => {
    expect(getWeatherDescription(999)).toBe('Condição desconhecida');
  });
});

describe('getWeatherIconClassName', () => {
  it('uses sun color for clear sky during the day', () => {
    expect(getWeatherIconClassName(0, true)).toBe('text-yellow-400');
  });

  it('uses moon color for clear sky at night', () => {
    expect(getWeatherIconClassName(1, false)).toBe('text-indigo-300');
  });

  it('uses rain color for rain codes', () => {
    expect(getWeatherIconClassName(61, true)).toBe('text-blue-300');
  });

  it('uses showers color for shower codes', () => {
    expect(getWeatherIconClassName(80, true)).toBe('text-blue-400');
  });

  it('uses neutral color for overcast codes', () => {
    expect(getWeatherIconClassName(3, true)).toBe('text-gray-400');
  });
});
