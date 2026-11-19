interface WeatherHaloProps {
  isDay: boolean | null;
}

export function WeatherHalo({ isDay }: WeatherHaloProps) {
  if (isDay === null) {
    return null;
  }
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute left-1/2 top-8 -z-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full blur-3xl ${
        isDay ? 'bg-dawn/15' : 'bg-signal/10'
      }`}
    />
  );
}
