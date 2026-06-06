import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Info,
  type LucideIcon,
} from "lucide-react";
import type { SystemAlert } from "@/lib/types";
import { alertStats } from "@/lib/alert-display";

const CARDS: {
  key: keyof ReturnType<typeof alertStats>;
  pctKey?: keyof ReturnType<typeof alertStats>;
  label: string;
  sublabel?: string;
  icon: LucideIcon;
  accent: { bg: string; icon: string };
}[] = [
  {
    key: "total",
    label: "Total Alerts",
    sublabel: "All alerts",
    icon: Bell,
    accent: { bg: "bg-[#1d9bf0]/15", icon: "text-[#1d9bf0]" },
  },
  {
    key: "critical",
    pctKey: "criticalPct",
    label: "Critical",
    icon: AlertTriangle,
    accent: { bg: "bg-[#f4212e]/15", icon: "text-[#f4212e]" },
  },
  {
    key: "warning",
    pctKey: "warningPct",
    label: "Warning",
    icon: AlertTriangle,
    accent: { bg: "bg-[#ffad1f]/15", icon: "text-[#ffad1f]" },
  },
  {
    key: "info",
    pctKey: "infoPct",
    label: "Info",
    icon: Info,
    accent: { bg: "bg-[#1d9bf0]/15", icon: "text-[#1d9bf0]" },
  },
  {
    key: "resolved",
    label: "Resolved",
    sublabel: "This period",
    icon: CheckCircle2,
    accent: { bg: "bg-[#00ba7c]/15", icon: "text-[#00ba7c]" },
  },
];

interface AlertSummaryProps {
  alerts: SystemAlert[];
}

export function AlertSummary({ alerts }: AlertSummaryProps) {
  const stats = alertStats(alerts);

  return (
    <div className="grid grid-cols-1 gap-px border border-[#2f3336] bg-[#2f3336] sm:grid-cols-2 xl:grid-cols-5">
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
