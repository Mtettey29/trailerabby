"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, Loader2, Plus } from "lucide-react";
import { DriverFiltersBar } from "@/components/driver-filters-bar";
import { DriverFleetSummary } from "@/components/driver-fleet-summary";
import { DriverModal, type DriverFormData } from "@/components/driver-modal";
import { DriversPageTable } from "@/components/drivers-page-table";
import { PageHeader } from "@/components/page-header";
import {
  applyDriverFilters,
  DEFAULT_DRIVER_PAGE_FILTERS,
  type DriverPageFilters,
} from "@/lib/driver-display";
import type { Driver, Trailer } from "@/lib/types";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const POLL_INTERVAL_MS = 30_000;

export function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [trailers, setTrailers] = useState<Trailer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Driver | null>(null);
  const [saving, setSaving] = useState(false);
  const [filters, setFilters] = useState<DriverPageFilters>(
    DEFAULT_DRIVER_PAGE_FILTERS
  );

  const filteredDrivers = useMemo(
    () => applyDriverFilters(drivers, filters),
    [drivers, filters]
  );

  const fetchData = useCallback(async () => {
    try {
      const [driversRes, trailersRes] = await Promise.all([
        fetch("/api/drivers", { cache: "no-store" }),
        fetch("/api/trailers", { cache: "no-store" }),
      ]);
      if (!driversRes.ok) throw new Error("Failed to load drivers");
      if (!trailersRes.ok) throw new Error("Failed to load trailers");

      const driversData = (await driversRes.json()) as { drivers: Driver[] };
      const trailersData = (await trailersRes.json()) as { trailers: Trailer[] };

      setDrivers(driversData.drivers);
      setTrailers(trailersData.trailers);
      setError(null);
    } catch {
      setError("Could not load drivers. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
    const id = setInterval(() => void fetchData(), POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchData]);

  function openAdd() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(driver: Driver) {
    setEditing(driver);
    setModalOpen(true);
  }

  function closeModal() {
    if (!saving) {
      setModalOpen(false);
      setEditing(null);
    }
  }

  async function handleSave(data: DriverFormData) {
    setSaving(true);
    try {
      if (editing) {
        const res = await fetch(`/api/drivers/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const err = (await res.json()) as { error?: string };
          throw new Error(err.error ?? "Update failed");
        }
        const { driver } = (await res.json()) as { driver: Driver };
        setDrivers((prev) =>
          prev.map((d) => (d.id === driver.id ? driver : d))
        );
      } else {
        const res = await fetch("/api/drivers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const err = (await res.json()) as { error?: string };
          throw new Error(err.error ?? "Create failed");
        }
        const { driver } = (await res.json()) as { driver: Driver };
        setDrivers((prev) => [...prev, driver]);
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
      const res = await fetch(`/api/drivers/${editing.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      setDrivers((prev) => prev.filter((d) => d.id !== editing.id));
      setModalOpen(false);
      setEditing(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex w-full flex-1 flex-col gap-0">
      <PageHeader
        title="Drivers"
        subtitle="View and manage all drivers."
      />

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
          Loading drivers…
        </div>
      ) : (
        <>
          <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-start print:hidden">
            <div className="min-w-0 flex-1">
              <DriverFiltersBar filters={filters} onFiltersChange={setFilters} />
            </div>
            <Button
              className="h-[58px] shrink-0 rounded-none bg-white px-4 font-bold text-black hover:bg-[#e7e9ea] lg:h-auto lg:self-stretch"
              onClick={openAdd}
            >
              <Plus className="text-black" strokeWidth={2} />
              Add Driver
            </Button>
          </div>

          <div className="mt-6">
            <DriverFleetSummary drivers={drivers} />
          </div>

          <div className="mt-6">
            <DriversPageTable
              drivers={filteredDrivers}
              trailers={trailers}
              onEdit={openEdit}
            />
          </div>
        </>
      )}

      <DriverModal
        open={modalOpen}
        driver={editing}
        saving={saving}
        onClose={closeModal}
        onSave={handleSave}
        onDelete={editing ? handleDelete : undefined}
      />
    </div>
  );
}
