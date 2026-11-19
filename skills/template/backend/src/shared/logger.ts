type Level = 'debug' | 'info' | 'warn' | 'error';

interface Logger {
  debug(message: string, details?: unknown): void;
  info(message: string, details?: unknown): void;
  warn(message: string, details?: unknown): void;
  error(message: string, details?: unknown): void;
}

function createConsoleLogger(): Logger {
  const write = (level: Level, message: string, details?: unknown): void => {
    const output = `[${level.toUpperCase()}] ${message}`;
    if (level === 'error') {
      console.error(output, details ?? '');
      return;
    }
    console.log(output, details ?? '');
  };
  return {
    debug: (message, details) => write('debug', message, details),
    info: (message, details) => write('info', message, details),
    warn: (message, details) => write('warn', message, details),
    error: (message, details) => write('error', message, details),
  };
}

export const logger = createConsoleLogger();
