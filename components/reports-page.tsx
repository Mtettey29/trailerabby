"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ChevronDown,
  Loader2,
  Upload,
} from "lucide-react";
import { PageHeaderActions } from "@/components/page-header-actions";
import {
  MovementTrendsChart,
  MovementTypeDonutChart,
} from "@/components/reports-charts";
import { ReportsKpiCards } from "@/components/reports-kpi-cards";
import { ReportsTopTables } from "@/components/reports-top-tables";
import { PanelCard } from "@/components/panel-card";
import {
  buildReportKpis,
  REPORT_TABS,
  topDriversByMovements,
  topTrailerUtilization,
  type ReportTabId,
} from "@/lib/reports";
import { formatDriverShort } from "@/lib/movements";
import type { Driver, Trailer } from "@/lib/types";
import { updatesByDay } from "@/lib/trailer-stats";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const POLL_INTERVAL_MS = 30_000;

function parseTabParam(value: string | null): ReportTabId {
  const match = REPORT_TABS.find((tab) => tab.id === value);
  return match?.id ?? "overview";
}

export function ReportsPage() {
  const searchParams = useSearchParams();
  const [trailers, setTrailers] = useState<Trailer[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ReportTabId>("overview");

  useEffect(() => {
    setActiveTab(parseTabParam(searchParams.get("tab")));
  }, [searchParams]);

  const fetchData = useCallback(async () => {
    try {
      const [trailersRes, driversRes] = await Promise.all([
        fetch("/api/trailers", { cache: "no-store" }),
        fetch("/api/drivers", { cache: "no-store" }),
      ]);
      if (!trailersRes.ok) throw new Error("Failed to load trailers");
      if (!driversRes.ok) throw new Error("Failed to load drivers");

      const trailersData = (await trailersRes.json()) as { trailers: Trailer[] };
      const driversData = (await driversRes.json()) as { drivers: Driver[] };

      setTrailers(trailersData.trailers);
      setDrivers(driversData.drivers);
      setError(null);
    } catch {
      setError("Could not load reports. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
    const id = setInterval(() => void fetchData(), POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchData]);

  const kpis = useMemo(
    () => buildReportKpis(trailers, drivers),
    [trailers, drivers]
  );
  const dailyUpdates = useMemo(() => updatesByDay(trailers), [trailers]);
  const maintenanceTrailers = useMemo(
    () => trailers.filter((t) => t.status === "in_shop"),
    [trailers]
  );

  return (
    <div className="flex w-full flex-1 flex-col gap-0">
      <div className="flex flex-col gap-4 border-b border-[#2f3336] pb-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Reports
          </h1>
          <p className="mt-1 text-sm text-[#71767b]">
            View and generate operational reports and analytics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <Button
            type="button"
            variant="outline"
            className="h-9 rounded-none border-[#2f3336] bg-[#16181c] text-sm text-white hover:bg-[#080808] hover:text-white"
            disabled
          >
            <Upload className="text-white" strokeWidth={1.75} />
            Export
            <ChevronDown className="text-[#71767b]" strokeWidth={1.75} />
          </Button>
          <PageHeaderActions />
        </div>
      </div>

      {error && (
        <Alert
          variant="destructive"
          className="mt-6 border-[#f4212e]/30 bg-[#f4212e]/10"
        >
          <AlertCircle className="text-white" />
          <AlertTitle className="text-white">Error</AlertTitle>
          <AlertDescription className="text-[#e7e9ea]">{error}</AlertDescription>
          <AlertAction>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
              onClick={() => setError(null)}
            >
              Dismiss
            </Button>
          </AlertAction>
        </Alert>
      )}

      {loading ? (
        <div className="flex items-center gap-2 py-16 text-sm text-[#71767b]">
          <Loader2 className="size-4 animate-spin text-white" />
          Loading reports…
        </div>
      ) : (
        <>
          <div className="mt-6">
            <ReportsKpiCards kpis={kpis} />
          </div>

          <div className="mt-6 border-b border-[#2f3336]">
            <nav className="-mb-px flex gap-1 overflow-x-auto">
              {REPORT_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "shrink-0 border-b-2 px-4 py-3 text-sm transition-colors",
                    activeTab === tab.id
                      ? "border-[#1d9bf0] text-white"
                      : "border-transparent text-[#71767b] hover:text-[#e7e9ea]"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-6">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                  <MovementTrendsChart data={dailyUpdates} />
                  <MovementTypeDonutChart trailers={trailers} />
                </div>
                <ReportsTopTables trailers={trailers} />
              </div>
            )}

            {activeTab === "movement_summary" && (
              <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                <MovementTrendsChart data={dailyUpdates} />
                <MovementTypeDonutChart trailers={trailers} />
              </div>
            )}

            {activeTab === "trailer_utilization" && (
              <PanelCard title="Trailer utilization" bodyClassName="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#2f3336] text-left text-xs text-[#71767b]">
                      <th className="px-4 py-2 font-normal">Trailer ID</th>
                      <th className="px-4 py-2 font-normal">Utilization</th>
                      <th className="px-4 py-2 text-right font-normal">Trips</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topTrailerUtilization(trailers, trailers.length).map(
                      (row) => (
                        <tr
                          key={row.trailerNumber}
                          className="border-b border-[#2f3336]"
                        >
                          <td className="px-4 py-3 font-mono text-white">
                            {row.trailerNumber}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-sm bg-[#16181c]">
                                <div
                                  className="h-full rounded-sm bg-[#1d9bf0]"
                                  style={{ width: `${row.utilization}%` }}
                                />
                              </div>
                              <span className="shrink-0 tabular-nums text-xs text-[#e7e9ea]">
                                {row.utilization}%
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right tabular-nums text-[#71767b]">
                            {row.trips}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </PanelCard>
            )}

            {activeTab === "driver_performance" && (
              <PanelCard title="Driver performance" bodyClassName="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#2f3336] text-left text-xs text-[#71767b]">
                      <th className="px-4 py-2 font-normal">Driver</th>
                      <th className="px-4 py-2 text-right font-normal">
                        Movements
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {topDriversByMovements(trailers, drivers.length).map(
                      (row) => (
                        <tr key={row.name} className="border-b border-[#2f3336]">
                          <td className="px-4 py-3 text-white">{row.name}</td>
                          <td className="px-4 py-3 text-right tabular-nums text-[#e7e9ea]">
                            {row.count}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </PanelCard>
            )}

            {activeTab === "maintenance" && (
              <PanelCard title="Trailers in maintenance" bodyClassName="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#2f3336] text-left text-xs text-[#71767b]">
                      <th className="px-4 py-2 font-normal">Trailer</th>
                      <th className="px-4 py-2 font-normal">Driver</th>
                      <th className="px-4 py-2 font-normal">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {maintenanceTrailers.length === 0 ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-4 py-8 text-center text-[#71767b]"
                        >
                          No trailers in maintenance
                        </td>
                      </tr>
                    ) : (
                      maintenanceTrailers.map((trailer) => (
                        <tr
                          key={trailer.id}
                          className="border-b border-[#2f3336]"
                        >
                          <td className="px-4 py-3 font-mono text-white">
                            {trailer.trailerNumber}
                          </td>
                          <td className="px-4 py-3 text-[#e7e9ea]">
                            {formatDriverShort(trailer.driver)}
                          </td>
                          <td className="px-4 py-3 text-[#71767b]">
                            {trailer.notes || "—"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </PanelCard>
            )}

            {activeTab === "custom" && (
              <PanelCard bodyClassName="p-8">
                <p className="text-center text-sm text-[#71767b]">
                  Custom reports will be available in a future update.
                </p>
              </PanelCard>
            )}
          </div>
        </>
      )}
    </div>
  );
}
