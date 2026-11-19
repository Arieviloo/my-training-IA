import { render, screen, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { CurrentWeatherCard } from '@/components/weather/CurrentWeatherCard';
import type { WeatherReport } from '@/types/Weather';

const SAMPLE_REPORT: WeatherReport = {
  location: {
    name: 'Lisboa',
    country: 'Portugal',
    latitude: 38.7167,
    longitude: -9.1333,
  },
  current: {
    temperatureC: 21.4,
    apparentTemperatureC: 20.1,
    humidityPct: 63.7,
    windSpeedKmh: 12.9,
    weatherCode: 0,
    isDay: true,
  },
};

describe('CurrentWeatherCard', () => {
  afterEach(cleanup);

  it('renders the rounded temperature with its label', () => {
    render(<CurrentWeatherCard report={SAMPLE_REPORT} />);
    const temperature = screen.getByLabelText('21 graus Celsius');
    expect(temperature.textContent).toContain('21');
  });

  it('renders location, condition and coordinates', () => {
    render(<CurrentWeatherCard report={SAMPLE_REPORT} />);
    expect(screen.getAllByText('Lisboa').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Céu limpo').length).toBeGreaterThan(0);
    expect(screen.getByText(/lat 38\.7167/).textContent).toContain('lon -9.1333');
  });

  it('renders all metrics in the strip', () => {
    render(<CurrentWeatherCard report={SAMPLE_REPORT} />);
    expect(screen.getByText('20°C')).toBeTruthy();
    expect(screen.getByText('64%')).toBeTruthy();
    expect(screen.getByText('13 km/h')).toBeTruthy();
  });
});
