import { Router, type Request, type Response } from 'express';
import {
  CityNotFoundError,
  getWeatherByCity,
  getWeatherByCoordinates,
  WeatherUnavailableError,
} from '../services/weather.service';
import { logger } from '../shared/logger';

const MIN_CITY_NAME_LENGTH = 2;
const MAX_LATITUDE = 90;
const MAX_LONGITUDE = 180;
const INVALID_REQUEST_MESSAGE = 'Informe uma cidade ou coordenadas válidas.';

const weatherRouter = Router();

function getTrimmedCityName(query: Request['query']): string {
  const cityName = query.city;
  return typeof cityName === 'string' ? cityName.trim() : '';
}

function isValidCoordinates(
  latitude: number,
  longitude: number,
): boolean {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    Math.abs(latitude) <= MAX_LATITUDE &&
    Math.abs(longitude) <= MAX_LONGITUDE
  );
}

function toErrorStatus(error: unknown): number {
  if (error instanceof CityNotFoundError) return 404;
  if (error instanceof WeatherUnavailableError) return 502;
  return 500;
}

weatherRouter.get('/weather', async (req: Request, res: Response) => {
  const cityName = getTrimmedCityName(req.query);
  const latitude = Number(req.query.lat);
  const longitude = Number(req.query.lon);

  try {
    if (cityName.length >= MIN_CITY_NAME_LENGTH) {
      return res.json(await getWeatherByCity(cityName));
    }
    if (isValidCoordinates(latitude, longitude)) {
      return res.json(await getWeatherByCoordinates({ latitude, longitude }));
    }
    return res.status(400).json({ error: INVALID_REQUEST_MESSAGE });
  } catch (error: unknown) {
    logger.error('Failed to fetch weather', error);
    return res.status(toErrorStatus(error)).json({
      error: error instanceof Error ? error.message : 'Erro inesperado',
    });
  }
});

export { weatherRouter };
