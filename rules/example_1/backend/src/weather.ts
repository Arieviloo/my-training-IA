import { Router, Request, Response } from 'express';

const router = Router();

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

const WEATHER_CODES: Record<number, string> = {
  0: 'Céu limpo',
  1: 'Predominantemente limpo',
  2: 'Parcialmente nublado',
  3: 'Nublado',
  45: 'Nevoeiro',
  48: 'Nevoeiro com gelo',
  51: 'Chuvisco leve',
  53: 'Chuvisco moderado',
  55: 'Chuvisco intenso',
  56: 'Chuvisco congelante leve',
  57: 'Chuvisco congelante intenso',
  61: 'Chuva leve',
  63: 'Chuva moderada',
  65: 'Chuva forte',
  66: 'Chuva congelante leve',
  67: 'Chuva congelante forte',
  71: 'Neve leve',
  73: 'Neve moderada',
  75: 'Neve forte',
  77: 'Grãos de neve',
  80: 'Pancadas de chuva leves',
  81: 'Pancadas de chuva moderadas',
  82: 'Pancadas de chuva fortes',
  85: 'Pancadas de neve leves',
  86: 'Pancadas de neve fortes',
  95: 'Trovoada',
  96: 'Trovoada com granizo leve',
  99: 'Trovoada com granizo forte',
};

export function describeWeatherCode(code: number): string {
  return WEATHER_CODES[code] ?? 'Desconhecido';
}

interface GeoResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
}

interface WeatherResponse {
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    is_day: number;
    weather_code: number;
    wind_speed_10m: number;
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
}

async function geocode(city: string): Promise<GeoResult[]> {
  const url = `${GEOCODING_URL}?name=${encodeURIComponent(city)}&count=5&language=pt&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Falha ao consultar o serviço de geocoding');
  const data = (await res.json()) as { results?: GeoResult[] };
  return data.results ?? [];
}

async function fetchWeather(lat: number, lon: number): Promise<WeatherResponse> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m',
    daily: 'temperature_2m_max,temperature_2m_min',
    timezone: 'auto',
  });
  const res = await fetch(`${FORECAST_URL}?${params.toString()}`);
  if (!res.ok) throw new Error('Falha ao consultar o serviço de clima');
  return (await res.json()) as WeatherResponse;
}

function formatWeather(geo: GeoResult, weather: WeatherResponse) {
  return {
    city: geo.name,
    region: geo.admin1 ?? null,
    country: geo.country ?? null,
    latitude: geo.latitude,
    longitude: geo.longitude,
    current: {
      time: weather.current.time,
      temperature: weather.current.temperature_2m,
      apparent_temperature: weather.current.apparent_temperature,
      humidity: weather.current.relative_humidity_2m,
      wind_speed: weather.current.wind_speed_10m,
      is_day: weather.current.is_day === 1,
      weather_code: weather.current.weather_code,
      description: describeWeatherCode(weather.current.weather_code),
    },
    daily: {
      max: weather.daily.temperature_2m_max[0],
      min: weather.daily.temperature_2m_min[0],
    },
  };
}

// GET /api/weather?city=São Paulo
router.get('/weather', async (req: Request, res: Response) => {
  try {
    const city = String(req.query.city ?? '').trim();
    if (!city) {
      res.status(400).json({ error: 'Informe o parâmetro "city".' });
      return;
    }

    const results = await geocode(city);
    if (results.length === 0) {
      res.status(404).json({ error: `Cidade "${city}" não encontrada.` });
      return;
    }

    const geo = results[0];
    const weather = await fetchWeather(geo.latitude, geo.longitude);
    res.json(formatWeather(geo, weather));
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: 'Erro ao obter dados de clima.', message: (err as Error).message });
  }
});

// GET /api/weather/here?lat=-23.55&lon=-46.63 — resolve por coordenadas (geolocation do navegador)
router.get('/weather/here', async (req: Request, res: Response) => {
  try {
    const lat = Number(req.query.lat);
    const lon = Number(req.query.lon);
    if (Number.isNaN(lat) || Number.isNaN(lon)) {
      res.status(400).json({ error: 'Informe os parâmetros "lat" e "lon".' });
      return;
    }

    // Open-Meteo não oferece reverse geocoding; usar BigDataCloud (gratuita, sem key)
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=pt`;
    const geoRes = await fetch(url);
    if (!geoRes.ok) throw new Error('Falha no reverse geocoding');
    const geoData = (await geoRes.json()) as {
      city?: string;
      locality?: string;
      principalSubdivision?: string;
      countryName?: string;
    };

    const cityName = geoData.city || geoData.locality || 'Local atual';
    const geo: GeoResult = {
      id: 0,
      name: cityName,
      latitude: lat,
      longitude: lon,
      country: geoData.countryName,
      admin1: geoData.principalSubdivision,
    };
    const weather = await fetchWeather(lat, lon);

    res.json(formatWeather(geo, weather));
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: 'Erro ao obter dados de clima.', message: (err as Error).message });
  }
});

export default router;
