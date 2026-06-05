import { ArrowDown, ArrowUp } from "lucide-react";
import type { Trailer } from "@/lib/types";
import { updatedTodayTrend } from "@/lib/trailer-stats";
import { KPI_ACCENT_CLASS, SUMMARY_META } from "@/lib/status-ui";

interface SummaryCardsProps {
  trailers: Trailer[];
}

export function SummaryCards({ trailers }: SummaryCardsProps) {
  const trend = updatedTodayTrend(trailers);

  const counts = {
    total: trailers.length,
    movements_today: trend.today,
    outbound: trailers.filter((t) => t.status === "outbound").length,
    onsite: trailers.filter((t) => t.status === "onsite").length,
    in_shop: trailers.filter((t) => t.status === "in_shop").length,
  };

  return (
    <div className="grid grid-cols-1 gap-px border border-[#2f3336] bg-[#2f3336] sm:grid-cols-2 xl:grid-cols-5">
      {SUMMARY_META.map(({ key, label, subtitle, icon: Icon }) => {
        const accent = KPI_ACCENT_CLASS[key];

        return (
          <div key={key} className="bg-black p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-[#71767b]">{label}</p>
                <p className="mt-2 text-2xl font-medium tabular-nums text-white">
                  {counts[key]}
                </p>
                {key === "movements_today" && trend.percentChange !== null && (
                  <p
                    className={`mt-1 inline-flex items-center gap-0.5 text-xs ${
                      trend.percentChange >= 0
                        ? "text-[#00ba7c]"
                        : "text-[#f4212e]"
                    }`}
                  >
                    {trend.percentChange >= 0 ? (
                      <ArrowUp className="size-3" strokeWidth={2} />
                    ) : (
                      <ArrowDown className="size-3" strokeWidth={2} />
                    )}
                    {Math.abs(trend.percentChange)}% vs yesterday
                  </p>
                )}
                {subtitle && (
                  <p className="mt-1 text-xs text-[#71767b]">{subtitle}</p>
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
