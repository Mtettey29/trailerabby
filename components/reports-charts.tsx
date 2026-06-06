"use client";

import { PanelCard } from "@/components/panel-card";
import {
  MOVEMENT_TYPE_COLORS,
  countByMovementType,
} from "@/lib/reports";
import { MOVEMENT_TYPES, MOVEMENT_TYPE_LABELS } from "@/lib/movements";
import type { Trailer } from "@/lib/types";

interface MovementTypeDonutProps {
  trailers: Trailer[];
}

export function MovementTypeDonutChart({ trailers }: MovementTypeDonutProps) {
  const counts = countByMovementType(trailers);
  const entries = MOVEMENT_TYPES.map((type) => ({
    type,
    label: MOVEMENT_TYPE_LABELS[type],
    count: counts[type],
    color: MOVEMENT_TYPE_COLORS[type],
  }));

  const total = entries.reduce((sum, item) => sum + item.count, 0);
  const size = 120;
  const stroke = 18;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;

  return (
    <PanelCard title="Movements by type" bodyClassName="p-4">
      {total === 0 ? (
        <p className="py-8 text-center text-sm text-[#71767b]">No movement data</p>
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
                    key={item.type}
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
              const pct =
                total > 0 ? Math.round((item.count / total) * 100) : 0;
              return (
                <li
                  key={item.type}
                  className="flex items-center justify-between gap-2 text-xs"
                >
                  <span className="flex min-w-0 items-center gap-2 text-[#71767b]">
                    <span
                      className="size-2 shrink-0 rounded-sm"
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

interface MovementTrendsChartProps {
  data: { label: string; count: number }[];
}

export function MovementTrendsChart({ data }: MovementTrendsChartProps) {
  const max = Math.max(...data.map((d) => d.count), 1);
  const width = 480;
  const height = 160;
  const padding = 12;
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
      title="Movement trends"
      action={<span className="text-xs text-[#71767b]">Daily</span>}
      bodyClassName="p-4"
      className="min-h-full"
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-40 w-full text-[#1d9bf0]"
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
