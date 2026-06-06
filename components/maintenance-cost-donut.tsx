import { ArrowUp } from "lucide-react";
import { PanelCard } from "@/components/panel-card";
import { maintenanceCostBreakdown } from "@/lib/maintenance-display";
import type { MaintenanceService } from "@/lib/types";

interface MaintenanceCostDonutProps {
  services: MaintenanceService[];
}

export function MaintenanceCostDonut({ services }: MaintenanceCostDonutProps) {
  const breakdown = maintenanceCostBreakdown(services);
  const total = breakdown.reduce((sum, item) => sum + item.amount, 0);

  const size = 100;
  const stroke = 16;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <PanelCard title="Maintenance cost overview" bodyClassName="p-4">
      <div className="mb-4">
        <p className="text-2xl font-medium tabular-nums text-white">
          ${total.toLocaleString()}
        </p>
        <p className="mt-1 inline-flex items-center gap-0.5 text-xs text-[#00ba7c]">
          <ArrowUp className="size-3" strokeWidth={2} />
          12% vs prior period
        </p>
      </div>

      {total === 0 ? (
        <p className="text-sm text-[#71767b]">No cost data recorded</p>
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
              {breakdown.map((item) => {
                if (item.amount === 0) return null;
                const dash = (item.amount / total) * circumference;
                const circle = (
                  <circle
                    key={item.category}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={item.color}
                    strokeWidth={stroke}
                    strokeDasharray={`${dash} ${circumference - dash}`}
                    strokeDashoffset={-offset}
                  />
                );
                offset += dash;
                return circle;
              })}
            </svg>
          </div>

          <ul className="min-w-0 flex-1 space-y-1.5">
            {breakdown.map((item) => (
              <li
                key={item.category}
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
                  {item.pct}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </PanelCard>
  );
}
