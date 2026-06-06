import {
  AlertTriangle,
  CalendarClock,
  CircleDollarSign,
  Truck,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { MaintenanceService, Trailer } from "@/lib/types";
import { maintenanceStats } from "@/lib/maintenance-display";

const CARDS: {
  key: keyof ReturnType<typeof maintenanceStats>;
  pctKey?: keyof ReturnType<typeof maintenanceStats>;
  label: string;
  sublabel?: string;
  format?: (value: number) => string;
  icon: LucideIcon;
  accent: { bg: string; icon: string };
}[] = [
  {
    key: "totalTrailers",
    label: "Total Trailers",
    sublabel: "All trailers",
    icon: Truck,
    accent: { bg: "bg-[#1d9bf0]/15", icon: "text-[#1d9bf0]" },
  },
  {
    key: "dueThisWeek",
    pctKey: "dueThisWeekPct",
    label: "Due This Week",
    icon: CalendarClock,
    accent: { bg: "bg-[#ffad1f]/15", icon: "text-[#ffad1f]" },
  },
  {
    key: "overdue",
    pctKey: "overduePct",
    label: "Overdue",
    icon: AlertTriangle,
    accent: { bg: "bg-[#f4212e]/15", icon: "text-[#f4212e]" },
  },
  {
    key: "inService",
    pctKey: "inServicePct",
    label: "In Service",
    icon: Wrench,
    accent: { bg: "bg-[#7856ff]/15", icon: "text-[#c4b5fd]" },
  },
  {
    key: "maintenanceCost",
    label: "Maintenance Cost",
    sublabel: "This period",
    format: (value) => `$${value.toLocaleString()}`,
    icon: CircleDollarSign,
    accent: { bg: "bg-[#00ba7c]/15", icon: "text-[#00ba7c]" },
  },
];

interface MaintenanceSummaryProps {
  services: MaintenanceService[];
  trailers: Trailer[];
}

export function MaintenanceSummary({
  services,
  trailers,
}: MaintenanceSummaryProps) {
  const stats = maintenanceStats(services, trailers);

  return (
    <div className="grid grid-cols-1 gap-px border border-[#2f3336] bg-[#2f3336] sm:grid-cols-2 xl:grid-cols-5">
      {CARDS.map(({ key, pctKey, label, sublabel, format, icon: Icon, accent }) => {
        const raw = stats[key];
        const value = typeof raw === "number" ? raw : 0;

        return (
          <div key={key} className="bg-black p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-[#71767b]">{label}</p>
                <p className="mt-2 text-2xl font-medium tabular-nums text-white">
                  {format ? format(value) : value}
                </p>
                {pctKey && stats.totalTrailers > 0 ? (
                  <p className="mt-1 text-xs text-[#71767b]">
                    {stats[pctKey]}% of total
                  </p>
                ) : sublabel ? (
                  <p className="mt-1 text-xs text-[#71767b]">{sublabel}</p>
                ) : null}
              </div>
              <div
                className={`flex size-10 shrink-0 items-center justify-center rounded-none ${accent.bg}`}
              >
                <Icon className={`size-5 ${accent.icon}`} strokeWidth={1.75} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
