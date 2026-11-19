export interface WeatherLocation {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface CurrentWeather {
  temperatureC: number;
  apparentTemperatureC: number;
  humidityPct: number;
  windSpeedKmh: number;
  weatherCode: number;
  isDay: boolean;
}

export interface WeatherReport {
  location: WeatherLocation;
  current: CurrentWeather;
}
