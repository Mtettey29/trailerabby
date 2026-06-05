"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";
import { MovementFiltersBar } from "@/components/movement-filters";
import { MovementsPageTable } from "@/components/movements-page-table";
import { PageHeader } from "@/components/page-header";
import { TrailerModal, type TrailerFormData } from "@/components/TrailerModal";
import type { Trailer } from "@/lib/types";
import { uniqueLocations } from "@/lib/trailer-filters";
import { parseStatusParam } from "@/lib/trailer-filters";
import {
  applyMovementFilters,
  DEFAULT_MOVEMENT_FILTERS,
  type MovementPageFilters,
} from "@/lib/movements";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const POLL_INTERVAL_MS = 30_000;

export function MovementsPage() {
  const searchParams = useSearchParams();
  const [trailers, setTrailers] = useState<Trailer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Trailer | null>(null);
  const [saving, setSaving] = useState(false);
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
    () => applyMovementFilters(trailers, filters),
    [trailers, filters]
  );

  const allLocations = useMemo(() => uniqueLocations(trailers), [trailers]);

  const fetchTrailers = useCallback(async () => {
    try {
      const res = await fetch("/api/trailers", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load trailers");
      const data = (await res.json()) as { trailers: Trailer[] };
      setTrailers(data.trailers);
      setError(null);
    } catch {
      setError("Could not load movements. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchTrailers();
    const id = setInterval(() => void fetchTrailers(), POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchTrailers]);

  function openEdit(trailer: Trailer) {
    setEditing(trailer);
    setModalOpen(true);
  }

  function closeModal() {
    if (!saving) {
      setModalOpen(false);
      setEditing(null);
    }
  }

  async function handleSave(data: TrailerFormData) {
    if (!editing) return;
    setSaving(true);
    try {
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
      setModalOpen(false);
      setEditing(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex w-full flex-1 flex-col gap-0">
      <PageHeader
        title="Movements"
        subtitle="View and search all trailer movements."
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
          Loading movements…
        </div>
      ) : (
        <>
          <div className="mt-6">
            <MovementFiltersBar
              trailers={trailers}
              filters={filters}
              locations={allLocations}
              onFiltersChange={setFilters}
              onSelectTrailer={openEdit}
            />
          </div>
          <MovementsPageTable
            trailers={filteredTrailers}
            onEdit={openEdit}
          />
        </>
      )}

      <TrailerModal
        open={modalOpen}
        trailer={editing}
        saving={saving}
        onClose={closeModal}
        onSave={handleSave}
        onDelete={undefined}
      />
    </div>
  );
}
