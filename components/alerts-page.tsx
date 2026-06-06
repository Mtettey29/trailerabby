"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCheck,
  Loader2,
  SlidersHorizontal,
} from "lucide-react";
import { PageHeaderActions } from "@/components/page-header-actions";
import { AlertFiltersBar } from "@/components/alert-filters-bar";
import { AlertSummary } from "@/components/alert-summary";
import { AlertsPageTable } from "@/components/alerts-page-table";
import {
  applyAlertFilters,
  DEFAULT_ALERT_PAGE_FILTERS,
  type AlertPageFilters,
} from "@/lib/alert-display";
import type { SystemAlert } from "@/lib/types";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const POLL_INTERVAL_MS = 30_000;

export function AlertsPage() {
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [filters, setFilters] = useState<AlertPageFilters>(
    DEFAULT_ALERT_PAGE_FILTERS
  );

  const filteredAlerts = useMemo(
    () => applyAlertFilters(alerts, filters),
    [alerts, filters]
  );

  const openCount = useMemo(
    () => alerts.filter((alert) => alert.status === "open").length,
    [alerts]
  );

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch("/api/alerts", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load alerts");
      const data = (await res.json()) as { alerts: SystemAlert[] };
      setAlerts(data.alerts);
      setError(null);
    } catch {
      setError("Could not load alerts. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAlerts();
    const id = setInterval(() => void fetchAlerts(), POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchAlerts]);

  async function updateAlertStatus(
    alert: SystemAlert,
    status: SystemAlert["status"]
  ) {
    setSaving(true);
    try {
      const res = await fetch(`/api/alerts/${alert.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Update failed");
      const { alert: updated } = (await res.json()) as {
        alert: SystemAlert;
      };
      setAlerts((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  async function markAllResolved() {
    setSaving(true);
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resolve_all" }),
      });
      if (!res.ok) throw new Error("Failed to mark alerts as read");
      const data = (await res.json()) as { alerts: SystemAlert[] };
      setAlerts(data.alerts);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex w-full flex-1 flex-col gap-0">
      <div className="flex flex-col gap-4 border-b border-[#2f3336] pb-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Alerts
          </h1>
          <p className="mt-1 text-sm text-[#71767b]">
            View and manage system alerts and notifications.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <Button
            type="button"
            variant="outline"
            className="h-9 rounded-none border-[#2f3336] bg-[#16181c] text-white hover:bg-[#080808] hover:text-white"
            onClick={() => setFilters(DEFAULT_ALERT_PAGE_FILTERS)}
          >
            <SlidersHorizontal className="text-[#71767b]" strokeWidth={1.75} />
            Filters
          </Button>
          <Button
            type="button"
            className="h-9 rounded-none bg-white font-bold text-black hover:bg-[#e7e9ea]"
            onClick={() => void markAllResolved()}
            disabled={saving || openCount === 0}
          >
            <CheckCheck className="text-black" strokeWidth={2} />
            Mark all as read
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
          Loading alerts…
        </div>
      ) : (
        <>
          <div className="mt-6">
            <AlertSummary alerts={alerts} />
          </div>

          <div className="mt-6">
            <AlertFiltersBar
              alerts={alerts}
              filters={filters}
              onFiltersChange={setFilters}
            />
          </div>

          <div className="mt-0">
            <AlertsPageTable
              alerts={filteredAlerts}
              onResolve={(alert) => void updateAlertStatus(alert, "resolved")}
              onReopen={(alert) => void updateAlertStatus(alert, "open")}
            />
          </div>
        </>
      )}
    </div>
  );
}
