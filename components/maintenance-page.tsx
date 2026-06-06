"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertCircle, Loader2, Plus } from "lucide-react";
import { PageHeaderActions } from "@/components/page-header-actions";
import { MaintenanceCalendar } from "@/components/maintenance-calendar";
import { MaintenanceCostDonut } from "@/components/maintenance-cost-donut";
import { MaintenanceFiltersBar } from "@/components/maintenance-filters-bar";
import {
  MaintenanceModal,
  type MaintenanceFormData,
} from "@/components/maintenance-modal";
import { MaintenanceQuickActions } from "@/components/maintenance-quick-actions";
import { MaintenanceServiceTable } from "@/components/maintenance-service-table";
import { MaintenanceSummary } from "@/components/maintenance-summary";
import {
  applyMaintenanceFilters,
  DEFAULT_MAINTENANCE_PAGE_FILTERS,
  servicesForTab,
  type MaintenancePageFilters,
} from "@/lib/maintenance-display";
import type { MaintenanceService, Trailer } from "@/lib/types";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const POLL_INTERVAL_MS = 30_000;

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "service_schedule", label: "Service Schedule" },
  { id: "work_orders", label: "Work Orders" },
  { id: "history", label: "Maintenance History" },
] as const;

type MaintenanceTabId = (typeof TABS)[number]["id"];

function parseTabParam(value: string | null): MaintenanceTabId {
  const match = TABS.find((tab) => tab.id === value);
  return match?.id ?? "overview";
}

function toPayload(data: MaintenanceFormData) {
  const cost = Number.parseFloat(data.cost);
  return {
    trailerNumber: data.trailerNumber,
    serviceType: data.serviceType,
    dueDate: new Date(`${data.dueDate}T12:00:00`).toISOString(),
    status: data.status,
    priority: data.priority,
    technician: data.technician,
    cost: Number.isNaN(cost) ? 0 : cost,
    notes: data.notes,
  };
}

export function MaintenancePage() {
  const searchParams = useSearchParams();
  const [services, setServices] = useState<MaintenanceService[]>([]);
  const [trailers, setTrailers] = useState<Trailer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MaintenanceService | null>(null);
  const [activeTab, setActiveTab] = useState<MaintenanceTabId>("overview");
  const [filters, setFilters] = useState<MaintenancePageFilters>(
    DEFAULT_MAINTENANCE_PAGE_FILTERS
  );

  useEffect(() => {
    setActiveTab(parseTabParam(searchParams.get("tab")));
  }, [searchParams]);

  const fetchData = useCallback(async () => {
    try {
      const [servicesRes, trailersRes] = await Promise.all([
        fetch("/api/maintenance", { cache: "no-store" }),
        fetch("/api/trailers", { cache: "no-store" }),
      ]);
      if (!servicesRes.ok) throw new Error("Failed to load maintenance");
      if (!trailersRes.ok) throw new Error("Failed to load trailers");

      const servicesData = (await servicesRes.json()) as {
        services: MaintenanceService[];
      };
      const trailersData = (await trailersRes.json()) as { trailers: Trailer[] };

      setServices(servicesData.services);
      setTrailers(trailersData.trailers);
      setError(null);
    } catch {
      setError(
        "Could not load maintenance data. Check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
    const id = setInterval(() => void fetchData(), POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchData]);

  const tabServices = useMemo(
    () => servicesForTab(services, activeTab),
    [services, activeTab]
  );

  const filteredServices = useMemo(
    () => applyMaintenanceFilters(tabServices, filters),
    [tabServices, filters]
  );

  function openSchedule() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(service: MaintenanceService) {
    setEditing(service);
    setModalOpen(true);
  }

  function closeModal() {
    if (!saving) {
      setModalOpen(false);
      setEditing(null);
    }
  }

  async function handleSave(data: MaintenanceFormData) {
    setSaving(true);
    try {
      const payload = toPayload(data);

      if (editing) {
        const res = await fetch(`/api/maintenance/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const err = (await res.json()) as { error?: string };
          throw new Error(err.error ?? "Update failed");
        }
        const { service } = (await res.json()) as {
          service: MaintenanceService;
        };
        setServices((prev) =>
          prev.map((item) => (item.id === service.id ? service : item))
        );
      } else {
        const res = await fetch("/api/maintenance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const err = (await res.json()) as { error?: string };
          throw new Error(err.error ?? "Create failed");
        }
        const { service } = (await res.json()) as {
          service: MaintenanceService;
        };
        setServices((prev) => [...prev, service]);
      }

      setModalOpen(false);
      setEditing(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!editing) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/maintenance/${editing.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      setServices((prev) => prev.filter((item) => item.id !== editing.id));
      setModalOpen(false);
      setEditing(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleComplete(service: MaintenanceService) {
    setSaving(true);
    try {
      const res = await fetch(`/api/maintenance/${service.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" }),
      });
      if (!res.ok) throw new Error("Update failed");
      const { service: updated } = (await res.json()) as {
        service: MaintenanceService;
      };
      setServices((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  const showSidebar = activeTab === "overview";

  return (
    <div className="flex w-full flex-1 flex-col gap-0">
      <div className="flex flex-col gap-4 border-b border-[#2f3336] pb-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Maintenance
          </h1>
          <p className="mt-1 text-sm text-[#71767b]">
            Manage trailer maintenance, services and inspections.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <Button
            type="button"
            className="h-9 rounded-none bg-white font-bold text-black hover:bg-[#e7e9ea]"
            onClick={openSchedule}
          >
            <Plus className="text-black" strokeWidth={2} />
            Schedule Service
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
          Loading maintenance…
        </div>
      ) : (
        <>
          <div className="mt-6">
            <MaintenanceSummary services={services} trailers={trailers} />
          </div>

          <div className="mt-6 border-b border-[#2f3336]">
            <nav className="-mb-px flex gap-1 overflow-x-auto">
              {TABS.map((tab) => (
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

          <div
            className={cn(
              "mt-6 grid gap-6",
              showSidebar && "xl:grid-cols-[1fr_320px]"
            )}
          >
            <div className="min-w-0 space-y-6">
              <div>
                <MaintenanceFiltersBar
                  filters={filters}
                  onFiltersChange={setFilters}
                />
                <MaintenanceServiceTable
                  services={filteredServices}
                  onEdit={openEdit}
                  onComplete={(service) => void handleComplete(service)}
                />
              </div>

              {showSidebar && (
                <MaintenanceCostDonut services={services} />
              )}
            </div>

            {showSidebar && (
              <div className="space-y-6">
                <MaintenanceCalendar services={services} />
                <MaintenanceQuickActions onScheduleService={openSchedule} />
              </div>
            )}
          </div>
        </>
      )}

      <MaintenanceModal
        open={modalOpen}
        service={editing}
        trailers={trailers}
        saving={saving}
        onClose={closeModal}
        onSave={handleSave}
        onDelete={editing ? handleDelete : undefined}
      />
    </div>
  );
}
