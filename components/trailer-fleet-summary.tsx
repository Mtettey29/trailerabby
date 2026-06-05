import {
  Ban,
  MapPin,
  Truck,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { Trailer } from "@/lib/types";
import { fleetStats } from "@/lib/trailer-display";

const CARDS: {
  key: keyof ReturnType<typeof fleetStats>;
  pctKey?: keyof ReturnType<typeof fleetStats>;
  label: string;
  icon: LucideIcon;
  accent: { bg: string; icon: string };
}[] = [
  {
    key: "total",
    label: "Total Trailers",
    icon: Truck,
    accent: { bg: "bg-[#1d9bf0]/15", icon: "text-[#1d9bf0]" },
  },
  {
    key: "inTransit",
    pctKey: "inTransitPct",
    label: "In Transit",
    icon: Truck,
    accent: { bg: "bg-[#7856ff]/15", icon: "text-[#c4b5fd]" },
  },
  {
    key: "atLocation",
    pctKey: "atLocationPct",
    label: "At Location",
    icon: MapPin,
    accent: { bg: "bg-[#00ba7c]/15", icon: "text-[#00ba7c]" },
  },
  {
    key: "underMaintenance",
    pctKey: "underMaintenancePct",
    label: "Under Maintenance",
    icon: Wrench,
    accent: { bg: "bg-[#f4212e]/15", icon: "text-[#f4212e]" },
  },
  {
    key: "outOfService",
    pctKey: "outOfServicePct",
    label: "Out of Service",
    icon: Ban,
    accent: { bg: "bg-[#71767b]/15", icon: "text-[#71767b]" },
  },
];

interface TrailerFleetSummaryProps {
  trailers: Trailer[];
}

export function TrailerFleetSummary({ trailers }: TrailerFleetSummaryProps) {
  const stats = fleetStats(trailers);

  return (
    <div className="grid grid-cols-1 gap-px border border-[#2f3336] bg-[#2f3336] sm:grid-cols-2 xl:grid-cols-5">
      {CARDS.map(({ key, pctKey, label, icon: Icon, accent }) => (
        <div key={key} className="bg-black p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-[#71767b]">{label}</p>
              <p className="mt-2 text-2xl font-medium tabular-nums text-white">
                {stats[key]}
              </p>
              {pctKey && stats.total > 0 && (
                <p className="mt-1 text-xs text-[#71767b]">
                  {stats[pctKey]}% of total
                </p>
              )}
            </div>
            <div
              className={`flex size-10 shrink-0 items-center justify-center rounded-none ${accent.bg}`}
            >
              <Icon className={`size-5 ${accent.icon}`} strokeWidth={1.75} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
