"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";
import { DashboardMovementsPreview } from "@/components/dashboard-movements-preview";
import {
  LocationBarChart,
  StatusBarChart,
  StatusDonutChart,
  UpdatesLineChart,
} from "@/components/dashboard-charts";
import { MovementFiltersBar } from "@/components/movement-filters";
import { QuickActions } from "@/components/quick-actions";
import { SheetHeader } from "@/components/sheet-header";
import { SummaryCards } from "@/components/SummaryCards";
import { TrailerModal, type TrailerFormData } from "@/components/TrailerModal";
import type { Trailer, TrailerStatus } from "@/lib/types";
import { uniqueLocations, parseStatusParam } from "@/lib/trailer-filters";
import {
  applyMovementFilters,
  DEFAULT_MOVEMENT_FILTERS,
  type MovementPageFilters,
} from "@/lib/movements";
import {
  countByStatus,
  sortByUpdatedDesc,
  topLocations,
  updatesByDay,
} from "@/lib/trailer-stats";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const POLL_INTERVAL_MS = 30_000;

export function TrailerBoard() {
  const searchParams = useSearchParams();
  const [trailers, setTrailers] = useState<Trailer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Trailer | null>(null);
  const [saving, setSaving] = useState(false);
  const [addDefaultStatus, setAddDefaultStatus] = useState<
    TrailerStatus | undefined
  >();
  const [filters, setFilters] = useState<MovementPageFilters>(
    DEFAULT_MOVEMENT_FILTERS
  );

  useEffect(() => {
    const status = parseStatusParam(searchParams.get("status"));
    setFilters((prev) =>
      prev.status === status ? prev : { ...prev, status }
    );
  }, [searchParams]);

  const filteredTrailers = useMemo(
    () => sortByUpdatedDesc(applyMovementFilters(trailers, filters)),
    [trailers, filters]
  );

  const allLocations = useMemo(() => uniqueLocations(trailers), [trailers]);
  const statusCounts = useMemo(() => countByStatus(trailers), [trailers]);
  const locationCounts = useMemo(() => topLocations(trailers), [trailers]);
  const dailyUpdates = useMemo(() => updatesByDay(trailers), [trailers]);

  const fetchTrailers = useCallback(async () => {
    try {
      const res = await fetch("/api/trailers", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load trailers");
      const data = (await res.json()) as { trailers: Trailer[] };
      setTrailers(data.trailers);
      setError(null);
    } catch {
      setError("Could not load trailers. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchTrailers();
    const id = setInterval(() => void fetchTrailers(), POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchTrailers]);

  useEffect(() => {
    if (loading || !window.location.hash) return;
    const id = window.location.hash.slice(1);
    const el = document.getElementById(id);
    if (el) {
      requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [loading]);

  function openAdd(status?: TrailerStatus) {
    setEditing(null);
    setAddDefaultStatus(status);
    setModalOpen(true);
  }

  function openEdit(trailer: Trailer) {
    setEditing(trailer);
    setModalOpen(true);
  }

  function closeModal() {
    if (!saving) {
      setModalOpen(false);
      setEditing(null);
      setAddDefaultStatus(undefined);
    }
  }

  async function handleSave(data: TrailerFormData) {
    setSaving(true);
    try {
      if (editing) {
        const res = await fetch(`/api/trailers/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const err = (await res.json()) as { error?: string };
          throw new Error(err.error ?? "Update failed");
        }
        const { trailer } = (await res.json()) as { trailer: Trailer };
        setTrailers((prev) =>
          prev.map((t) => (t.id === trailer.id ? trailer : t))
        );
      } else {
        const res = await fetch("/api/trailers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const err = (await res.json()) as { error?: string };
          throw new Error(err.error ?? "Create failed");
        }
        const { trailer } = (await res.json()) as { trailer: Trailer };
        setTrailers((prev) => [...prev, trailer]);
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
      const res = await fetch(`/api/trailers/${editing.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      setTrailers((prev) => prev.filter((t) => t.id !== editing.id));
      setModalOpen(false);
      setEditing(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex w-full flex-1 flex-col gap-6 print:gap-4">
      <SheetHeader />

      {error && (
        <Alert
          variant="destructive"
          className="border-[#f4212e]/30 bg-[#f4212e]/10"
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
        <div className="flex items-center gap-2 py-12 text-sm text-[#71767b]">
          <Loader2 className="size-4 animate-spin text-white" />
          Loading dashboard…
        </div>
      ) : (
        <>
          <div id="summary">
            <SummaryCards trailers={trailers} />
          </div>

          <MovementFiltersBar
            trailers={trailers}
            filters={filters}
            locations={allLocations}
            onFiltersChange={setFilters}
            onSelectTrailer={openEdit}
          />

          <div className="grid gap-6 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <DashboardMovementsPreview
                trailers={filteredTrailers}
                onEdit={openEdit}
              />
            </div>
            <div id="analytics" className="flex flex-col gap-6">
              <StatusDonutChart counts={statusCounts} />
              <LocationBarChart locations={locationCounts} />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <UpdatesLineChart data={dailyUpdates} />
            <StatusBarChart counts={statusCounts} />
            <QuickActions
              onAddTrailer={() => openAdd()}
              onGenerateReport={() => window.print()}
            />
          </div>
        </>
      )}

      <TrailerModal
        open={modalOpen}
        trailer={editing}
        defaultStatus={addDefaultStatus}
        saving={saving}
        onClose={closeModal}
        onSave={handleSave}
        onDelete={editing ? handleDelete : undefined}
      />
    </div>
  );
}
