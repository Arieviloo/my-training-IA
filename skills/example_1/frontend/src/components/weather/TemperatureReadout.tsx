interface TemperatureReadoutProps {
  temperatureC: number;
  description: string;
  icon: string;
  iconClassName: string;
}

export function TemperatureReadout({
  temperatureC,
  description,
  icon,
  iconClassName,
}: TemperatureReadoutProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <p
        aria-label={`${Math.round(temperatureC)} graus Celsius`}
        className="font-mono text-7xl font-light text-foreground drop-shadow-[0_0_24px_rgba(94,230,255,0.35)]"
      >
        {Math.round(temperatureC)}
        <span className="text-signal">°</span>
      </p>
      <p className="flex items-center gap-2 text-sm text-mist">
        <span className={iconClassName} aria-hidden="true">
          {icon}
        </span>
        {description}
      </p>
    </div>
  );
}
