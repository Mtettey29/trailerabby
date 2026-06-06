import { Moon, UserX, Users, type LucideIcon } from "lucide-react";
import type { Driver } from "@/lib/types";
import { driverStats } from "@/lib/driver-display";

const CARDS: {
  key: keyof ReturnType<typeof driverStats>;
  pctKey?: keyof ReturnType<typeof driverStats>;
  label: string;
  sublabel?: string;
  icon: LucideIcon;
  accent: { bg: string; icon: string };
}[] = [
  {
    key: "total",
    label: "Total Drivers",
    sublabel: "All drivers",
    icon: Users,
    accent: { bg: "bg-[#1d9bf0]/15", icon: "text-[#1d9bf0]" },
  },
  {
    key: "onDuty",
    pctKey: "onDutyPct",
    label: "On Duty",
    icon: Users,
    accent: { bg: "bg-[#00ba7c]/15", icon: "text-[#00ba7c]" },
  },
  {
    key: "offDuty",
    pctKey: "offDutyPct",
    label: "Off Duty",
    icon: Moon,
    accent: { bg: "bg-[#7856ff]/15", icon: "text-[#c4b5fd]" },
  },
  {
    key: "unavailable",
    pctKey: "unavailablePct",
    label: "Unavailable",
    icon: UserX,
    accent: { bg: "bg-[#f4212e]/15", icon: "text-[#f4212e]" },
  },
];

interface DriverFleetSummaryProps {
  drivers: Driver[];
}

export function DriverFleetSummary({ drivers }: DriverFleetSummaryProps) {
  const stats = driverStats(drivers);

  return (
    <div className="grid grid-cols-1 gap-px border border-[#2f3336] bg-[#2f3336] sm:grid-cols-2 xl:grid-cols-4">
      {CARDS.map(({ key, pctKey, label, sublabel, icon: Icon, accent }) => (
        <div key={key} className="bg-black p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-[#71767b]">{label}</p>
              <p className="mt-2 text-2xl font-medium tabular-nums text-white">
                {stats[key]}
              </p>
              {pctKey && stats.total > 0 ? (
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
      ))}
    </div>
  );
}
