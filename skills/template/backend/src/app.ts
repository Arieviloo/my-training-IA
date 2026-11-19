import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { weatherRouter } from './routes/weather.routes';

export function createApp(): Express {
  const app: Express = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(weatherRouter);

  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString()
    });
  });

  app.use((err: Error, _req: Request, res: Response, _next: any) => {
    console.error(err.stack);
    res.status(500).json({
      error: 'Something went wrong!',
      message: err.message
    });
  });

  return app;
}
