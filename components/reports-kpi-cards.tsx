import {
  ArrowDown,
  ArrowLeftRight,
  ArrowUp,
  BarChart3,
  CircleCheck,
  Clock,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { ReportKpi } from "@/lib/reports";

const KPI_ICONS: Record<string, LucideIcon> = {
  movements: ArrowLeftRight,
  utilization: BarChart3,
  on_time: CircleCheck,
  maintenance: Wrench,
  drivers: Users,
  transit: Clock,
};

const KPI_ACCENTS: Record<string, { bg: string; icon: string }> = {
  movements: { bg: "bg-[#1d9bf0]/15", icon: "text-[#1d9bf0]" },
  utilization: { bg: "bg-[#00ba7c]/15", icon: "text-[#00ba7c]" },
  on_time: { bg: "bg-[#ffad1f]/15", icon: "text-[#ffad1f]" },
  maintenance: { bg: "bg-[#f4212e]/15", icon: "text-[#f4212e]" },
  drivers: { bg: "bg-[#7856ff]/15", icon: "text-[#c4b5fd]" },
  transit: { bg: "bg-[#1d9bf0]/15", icon: "text-[#1d9bf0]" },
};

interface ReportsKpiCardsProps {
  kpis: ReportKpi[];
}

export function ReportsKpiCards({ kpis }: ReportsKpiCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-px border border-[#2f3336] bg-[#2f3336] sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {kpis.map((kpi) => {
        const Icon = KPI_ICONS[kpi.key] ?? BarChart3;
        const accent = KPI_ACCENTS[kpi.key] ?? KPI_ACCENTS.movements;
        const trendUp = kpi.trend !== null && kpi.trend > 0;
        const trendDown = kpi.trend !== null && kpi.trend < 0;
        const positive =
          kpi.trend !== null &&
          (kpi.invertTrend ? kpi.trend < 0 : kpi.trend > 0);
        const negative =
          kpi.trend !== null &&
          (kpi.invertTrend ? kpi.trend > 0 : kpi.trend < 0);

        return (
          <div key={kpi.key} className="bg-black p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-[#71767b]">{kpi.label}</p>
                <p className="mt-2 text-2xl font-medium tabular-nums text-white">
                  {kpi.value}
                </p>
                {kpi.trend !== null ? (
                  <p
                    className={`mt-1 inline-flex items-center gap-0.5 text-xs ${
                      positive
                        ? "text-[#00ba7c]"
                        : negative
                          ? "text-[#f4212e]"
                          : "text-[#71767b]"
                    }`}
                  >
                    {trendUp && <ArrowUp className="size-3" strokeWidth={2} />}
                    {trendDown && (
                      <ArrowDown className="size-3" strokeWidth={2} />
                    )}
                    {kpi.invertTrend && kpi.trend !== 0
                      ? `${Math.abs(kpi.trend)} ${kpi.trendLabel}`
                      : `${Math.abs(kpi.trend)}% ${kpi.trendLabel}`}
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-[#71767b]">
                    {kpi.trendLabel}
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
        );
      })}
    </div>
  );
}
