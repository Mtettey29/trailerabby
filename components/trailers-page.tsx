"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Loader2, Plus } from "lucide-react";
import { useCanMutate } from "@/components/auth-provider";
import { PageHeader } from "@/components/page-header";
import { TrailerFiltersBar } from "@/components/trailer-filters-bar";
import { TrailerFleetSummary } from "@/components/trailer-fleet-summary";
import { TrailersPageTable } from "@/components/trailers-page-table";
import { TrailerModal, type TrailerFormData } from "@/components/TrailerModal";
import type { Trailer, TrailerStatus } from "@/lib/types";
import {
  applyTrailerPageFilters,
  DEFAULT_TRAILER_PAGE_FILTERS,
  parseFleetStatusParam,
  type TrailerPageFilters,
} from "@/lib/trailer-display";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const POLL_INTERVAL_MS = 30_000;

export function TrailersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const canEdit = useCanMutate();
  const [trailers, setTrailers] = useState<Trailer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Trailer | null>(null);
  const [saving, setSaving] = useState(false);
  const [addDefaultStatus, setAddDefaultStatus] = useState<
    TrailerStatus | undefined
  >();
  const [filters, setFilters] = useState<TrailerPageFilters>(
    DEFAULT_TRAILER_PAGE_FILTERS
  );

  useEffect(() => {
    const status = parseFleetStatusParam(searchParams.get("status"));
    setFilters((prev) =>
      prev.status === status ? prev : { ...prev, status }
    );
  }, [searchParams]);

  const filteredTrailers = useMemo(
    () => applyTrailerPageFilters(trailers, filters),
    [trailers, filters]
  );

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

  function openAdd() {
    setEditing(null);
    setAddDefaultStatus(undefined);
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
    <div className="flex w-full flex-1 flex-col gap-0">
      <PageHeader
        title="Trailers"
        subtitle="View and manage all trailers."
      />

      {canEdit && (
        <div className="mt-4 flex justify-end print:hidden">
          <Button
            className="rounded-none bg-white font-bold text-black hover:bg-[#e7e9ea]"
            onClick={openAdd}
          >
            <Plus className="text-black" strokeWidth={2} />
            Add trailer
          </Button>
        </div>
      )}

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
          Loading trailers…
        </div>
      ) : (
        <>
          <div className="mt-6">
            <TrailerFleetSummary trailers={trailers} />
          </div>

          <div className="mt-6">
            <TrailerFiltersBar
              trailers={trailers}
              filters={filters}
              onFiltersChange={setFilters}
              onSelectTrailer={(trailer) =>
                router.push(`/trailers/${trailer.id}`)
              }
            />
          </div>

          <TrailersPageTable
            trailers={filteredTrailers}
            onView={(trailer) => router.push(`/trailers/${trailer.id}`)}
            onEdit={openEdit}
            readOnly={!canEdit}
          />
        </>
      )}

      {canEdit && (
        <TrailerModal
          open={modalOpen}
          trailer={editing}
          defaultStatus={addDefaultStatus}
          saving={saving}
          onClose={closeModal}
          onSave={handleSave}
          onDelete={editing ? handleDelete : undefined}
        />
      )}
    </div>
  );
}
