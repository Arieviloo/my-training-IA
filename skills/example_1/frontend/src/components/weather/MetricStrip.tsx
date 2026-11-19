interface MetricStripProps {
  apparentTemperatureC: number;
  humidityPct: number;
  windSpeedKmh: number;
}

interface Metric {
  label: string;
  value: string;
}

function buildMetrics(props: MetricStripProps): Metric[] {
  return [
    { label: 'Sensação', value: `${Math.round(props.apparentTemperatureC)}°C` },
    { label: 'Umidade', value: `${Math.round(props.humidityPct)}%` },
    { label: 'Vento', value: `${Math.round(props.windSpeedKmh)} km/h` },
  ];
}

export function MetricStrip(props: MetricStripProps) {
  const metrics = buildMetrics(props);
  return (
    <dl className="flex w-full items-stretch justify-center divide-x divide-hairline border-t border-hairline pt-4">
      {metrics.map((metric) => (
        <div key={metric.label} className="flex-1 px-2 text-center">
          <dt className="font-mono text-[10px] uppercase tracking-widest text-mist">
            {metric.label}
          </dt>
          <dd className="mt-1 font-mono text-base text-foreground">{metric.value}</dd>
        </div>
      ))}
    </dl>
  );
}
