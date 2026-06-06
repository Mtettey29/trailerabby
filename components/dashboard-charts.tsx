"use client";

import {
  FLEET_CHART_COLORS,
  FLEET_CHART_LABELS,
  type FleetChartBucket,
} from "@/lib/trailer-display";
import { PanelCard } from "@/components/panel-card";

const FLEET_BUCKETS: FleetChartBucket[] = [
  "in_transit",
  "at_location",
  "under_maintenance",
  "other",
];

interface FleetStatusChartProps {
  counts: Record<FleetChartBucket, number>;
}

export function StatusDonutChart({ counts }: FleetStatusChartProps) {
  const entries = FLEET_BUCKETS.map((bucket) => ({
    bucket,
    label: FLEET_CHART_LABELS[bucket],
    count: counts[bucket],
    color: FLEET_CHART_COLORS[bucket],
  }));

  const total = entries.reduce((sum, item) => sum + item.count, 0);
  const size = 120;
  const stroke = 18;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;

  return (
    <PanelCard title="Movements by status" bodyClassName="p-4">
      {total === 0 ? (
        <p className="py-8 text-center text-sm text-[#71767b]">No trailer data</p>
      ) : (
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <svg width={size} height={size} className="-rotate-90">
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="#16181c"
                strokeWidth={stroke}
              />
              {entries.map((item) => {
                if (item.count === 0) return null;
                const dash = (item.count / total) * circumference;
                const circle = (
                  <circle
                    key={item.bucket}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={item.color}
                    strokeWidth={stroke}
                    strokeDasharray={`${dash} ${circumference - dash}`}
                    strokeDashoffset={-offset}
                    strokeLinecap="butt"
                  />
                );
                offset += dash;
                return circle;
              })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[10px] uppercase tracking-wide text-[#71767b]">
                Total
              </span>
              <span className="text-xl font-medium tabular-nums text-white">
                {total}
              </span>
            </div>
          </div>

          <ul className="min-w-0 flex-1 space-y-2">
            {entries.map((item) => {
              const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
              return (
                <li
                  key={item.bucket}
                  className="flex items-center justify-between gap-2 text-xs"
                >
                  <span className="flex min-w-0 items-center gap-2 text-[#71767b]">
                    <span
                      className="size-2 shrink-0 rounded-none"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="truncate">{item.label}</span>
                  </span>
                  <span className="shrink-0 tabular-nums text-white">
                    {item.count}{" "}
                    <span className="text-[#71767b]">({pct}%)</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </PanelCard>
  );
}

interface LocationBarsProps {
  locations: { location: string; count: number }[];
}

export function LocationBarChart({ locations }: LocationBarsProps) {
  const max = locations[0]?.count ?? 1;

  return (
    <PanelCard title="Movements by location (top 5)" bodyClassName="p-4">
      {locations.length === 0 ? (
        <p className="py-8 text-center text-sm text-[#71767b]">
          No locations recorded
        </p>
      ) : (
        <ul className="space-y-3">
          {locations.map((item) => (
            <li key={item.location}>
              <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                <span className="truncate text-[#71767b]">{item.location}</span>
                <span className="shrink-0 tabular-nums text-white">
                  {item.count}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-none bg-[#16181c]">
                <div
                  className="h-full rounded-none bg-[#1d9bf0]"
                  style={{ width: `${(item.count / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </PanelCard>
  );
}

interface UpdatesLineProps {
  data: { label: string; count: number }[];
}

export function UpdatesLineChart({ data }: UpdatesLineProps) {
  const max = Math.max(...data.map((d) => d.count), 1);
  const width = 320;
  const height = 120;
  const padding = 8;
  const step =
    data.length > 1 ? (width - padding * 2) / (data.length - 1) : 0;

  const points = data.map((item, index) => {
    const x = padding + index * step;
    const y = height - padding - (item.count / max) * (height - padding * 2);
    return { x, y, ...item };
  });

  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  return (
    <PanelCard
      title="Movements over time"
      action={
        <span className="text-xs text-[#71767b]">Last 7 days</span>
      }
      bodyClassName="p-4"
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-32 w-full text-[#1d9bf0]"
        preserveAspectRatio="none"
      >
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#2f3336"
          strokeWidth="1"
        />
        {linePath && (
          <>
            <path
              d={`${linePath} L ${points[points.length - 1]?.x ?? padding} ${height - padding} L ${padding} ${height - padding} Z`}
              fill="#1d9bf0"
              fillOpacity="0.12"
            />
            <path
              d={linePath}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </>
        )}
        {points.map((point) => (
          <circle
            key={point.label}
            cx={point.x}
            cy={point.y}
            r="3"
            fill="currentColor"
          />
        ))}
      </svg>
      <div className="mt-2 flex justify-between text-[10px] text-[#71767b]">
        {data.map((item) => (
          <span key={item.label}>{item.label}</span>
        ))}
      </div>
    </PanelCard>
  );
}

export function StatusBarChart({ counts }: FleetStatusChartProps) {
  const entries = FLEET_BUCKETS.map((bucket) => ({
    bucket,
    label: FLEET_CHART_LABELS[bucket],
    count: counts[bucket],
    color: FLEET_CHART_COLORS[bucket],
  }));
  const max = Math.max(...entries.map((e) => e.count), 1);

  return (
    <PanelCard title="Trailer status overview" bodyClassName="p-4">
      <div className="flex h-36 items-end justify-between gap-2">
        {entries.map((item) => (
          <div
            key={item.bucket}
            className="flex min-w-0 flex-1 flex-col items-center gap-2"
          >
            <span className="text-xs tabular-nums text-white">{item.count}</span>
            <div className="flex w-full flex-1 items-end">
              <div
                className="w-full rounded-none"
                style={{
                  height: `${(item.count / max) * 100}%`,
                  minHeight: item.count > 0 ? "8px" : "0",
                  backgroundColor: item.color,
                }}
              />
            </div>
            <span className="text-center text-[10px] leading-tight text-[#71767b]">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </PanelCard>
  );
}
