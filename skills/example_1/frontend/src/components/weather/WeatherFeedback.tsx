interface WeatherFeedbackProps {
  isLoading: boolean;
  error: string | null;
  hasReport: boolean;
}

export function WeatherFeedback({ isLoading, error, hasReport }: WeatherFeedbackProps) {
  if (isLoading) {
    return (
      <p role="status" className="font-mono text-sm text-signal motion-safe:animate-pulse">
        Buscando clima...
      </p>
    );
  }
  if (error !== null) {
    return (
      <p role="alert" className="border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-400">
        {error}
      </p>
    );
  }
  if (!hasReport) {
    return (
      <p className="text-sm text-mist">
        Busque uma cidade ou use sua localização para ver o clima atual.
      </p>
    );
  }
  return null;
}
