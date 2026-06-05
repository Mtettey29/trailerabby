"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, Loader2, Plus } from "lucide-react";
import { LocationFiltersBar } from "@/components/location-filters-bar";
import { LocationList } from "@/components/location-list";
import {
  LocationModal,
  type LocationFormData,
} from "@/components/location-modal";
import { LocationsMap } from "@/components/locations-map";
import { PageHeader } from "@/components/page-header";
import { PanelCard } from "@/components/panel-card";
import {
  applyLocationFilters,
  DEFAULT_LOCATION_PAGE_FILTERS,
  type LocationPageFilters,
} from "@/lib/location-display";
import type { Location, LocationInput, Trailer } from "@/lib/types";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const POLL_INTERVAL_MS = 30_000;

function toLocationInput(data: LocationFormData): LocationInput {
  const latitude = Number.parseFloat(data.latitude);
  const longitude = Number.parseFloat(data.longitude);
  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    throw new Error("Valid coordinates are required");
  }

  return {
    name: data.name,
    type: data.type,
    status: data.status,
    addressLine1: data.addressLine1,
    addressLine2: data.addressLine2,
    city: data.city,
    state: data.state,
    zip: data.zip,
    latitude,
    longitude,
  };
}

export function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [trailers, setTrailers] = useState<Trailer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Location | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filters, setFilters] = useState<LocationPageFilters>(
    DEFAULT_LOCATION_PAGE_FILTERS
  );

  const filteredLocations = useMemo(
    () => applyLocationFilters(locations, filters),
    [locations, filters]
  );

  const fetchData = useCallback(async () => {
    try {
      const [locationsRes, trailersRes] = await Promise.all([
        fetch("/api/locations", { cache: "no-store" }),
        fetch("/api/trailers", { cache: "no-store" }),
      ]);
      if (!locationsRes.ok) throw new Error("Failed to load locations");
      if (!trailersRes.ok) throw new Error("Failed to load trailers");

      const locationsData = (await locationsRes.json()) as {
        locations: Location[];
      };
      const trailersData = (await trailersRes.json()) as {
        trailers: Trailer[];
      };

      setLocations(locationsData.locations);
      setTrailers(trailersData.trailers);
      setError(null);
    } catch {
      setError("Could not load locations. Check your connection and try again.");
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

  function openEdit(location: Location) {
    setEditing(location);
    setModalOpen(true);
  }

  function closeModal() {
    if (!saving) {
      setModalOpen(false);
      setEditing(null);
    }
  }

  async function handleSave(data: LocationFormData) {
    setSaving(true);
    try {
      const payload = toLocationInput(data);

      if (editing) {
        const res = await fetch(`/api/locations/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const err = (await res.json()) as { error?: string };
          throw new Error(err.error ?? "Update failed");
        }
        const { location } = (await res.json()) as { location: Location };
        setLocations((prev) =>
          prev.map((l) => (l.id === location.id ? location : l))
        );
        setSelectedId(location.id);
      } else {
        const res = await fetch("/api/locations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const err = (await res.json()) as { error?: string };
          throw new Error(err.error ?? "Create failed");
        }
        const { location } = (await res.json()) as { location: Location };
        setLocations((prev) => [...prev, location]);
        setSelectedId(location.id);
      }

      setModalOpen(false);
      setEditing(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(location?: Location) {
    const target = location ?? editing;
    if (!target) return;

    if (
      location &&
      !window.confirm(`Delete ${location.name}? This cannot be undone.`)
    ) {
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/locations/${target.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      setLocations((prev) => prev.filter((l) => l.id !== target.id));
      if (selectedId === target.id) setSelectedId(null);
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
        title="Locations"
        subtitle="View and manage yards, clients, and other locations."
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
          Loading locations…
        </div>
      ) : (
        <>
          <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-start print:hidden">
            <div className="min-w-0 flex-1">
              <LocationFiltersBar filters={filters} onFiltersChange={setFilters} />
            </div>
            <Button
              className="h-[58px] shrink-0 rounded-none bg-white px-4 font-bold text-black hover:bg-[#e7e9ea] lg:h-auto lg:self-stretch"
              onClick={openAdd}
            >
              <Plus className="text-black" strokeWidth={2} />
              Add Location
            </Button>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
            <PanelCard
              title={`All Locations (${filteredLocations.length})`}
              className="flex min-h-0 flex-col"
              bodyClassName="max-h-[560px] overflow-y-auto p-0"
            >
              {locations.length === 0 ? (
                <div className="flex flex-col items-center gap-3 px-4 py-16 text-center text-sm text-[#71767b]">
                  <p>No locations yet.</p>
                  <p>Run `npm run seed:locations` or add your first location.</p>
                </div>
              ) : (
                <LocationList
                  locations={filteredLocations}
                  trailers={trailers}
                  selectedId={selectedId}
                  onSelect={(location) => setSelectedId(location.id)}
                  onEdit={openEdit}
                  onDelete={(location) => void handleDelete(location)}
                />
              )}
            </PanelCard>

            <PanelCard className="overflow-hidden" bodyClassName="p-0">
              <LocationsMap
                locations={filteredLocations}
                trailers={trailers}
                selectedId={selectedId}
                onSelect={(location) => setSelectedId(location.id)}
              />
            </PanelCard>
          </div>
        </>
      )}

      <LocationModal
        open={modalOpen}
        location={editing}
        saving={saving}
        onClose={closeModal}
        onSave={handleSave}
        onDelete={editing ? () => handleDelete() : undefined}
      />
    </div>
  );
}
