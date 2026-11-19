interface WeatherFeedbackProps {
  isLoading: boolean;
  error: string | null;
  hasReport: boolean;
}

export function WeatherFeedback({ isLoading, error, hasReport }: WeatherFeedbackProps) {
  if (isLoading) {
    return <p role="status" className="text-muted-foreground">Buscando clima...</p>;
  }
  if (error !== null) {
    return <p role="alert" className="text-sm text-red-500">{error}</p>;
  }
  if (!hasReport) {
    return (
      <p className="text-muted-foreground">Busque uma cidade para ver o clima atual.</p>
    );
  }
  return null;
}
