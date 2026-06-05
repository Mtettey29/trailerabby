"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Filter, Search, SlidersHorizontal, X } from "lucide-react";
import type { Trailer } from "@/lib/types";
import {
  DEFAULT_TRAILER_PAGE_FILTERS,
  deriveTrailerType,
  FLEET_STATUS_LABELS,
  getFleetDisplayStatus,
  TRAILER_TYPES,
  type FleetDisplayStatus,
  type TrailerPageFilters,
} from "@/lib/trailer-display";
import { filterTrailers } from "@/lib/search-trailers";
import {
  FleetStatusBadge,
  TrailerTypeBadge,
} from "@/components/trailer-fleet-badges";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const FLEET_STATUSES: FleetDisplayStatus[] = [
  "in_transit",
  "at_location",
  "under_maintenance",
  "out_of_service",
];

interface TrailerFiltersBarProps {
  trailers: Trailer[];
  filters: TrailerPageFilters;
  onFiltersChange: (filters: TrailerPageFilters) => void;
  onSelectTrailer: (trailer: Trailer) => void;
}

export function TrailerFiltersBar({
  trailers,
  filters,
  onFiltersChange,
  onSelectTrailer,
}: TrailerFiltersBarProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const matches = filterTrailers(trailers, filters.search).slice(0, 8);
  const showDropdown = open && filters.search.trim().length > 0;
  const hasActiveFilters =
    filters.status !== "all" ||
    filters.type !== "all" ||
    filters.search.trim().length > 0;

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  function update(partial: Partial<TrailerPageFilters>) {
    onFiltersChange({ ...filters, ...partial });
  }

  function clearSearch() {
    update({ search: "" });
    setOpen(false);
  }

  function selectTrailer(trailer: Trailer) {
    onSelectTrailer(trailer);
    clearSearch();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      clearSearch();
      return;
    }
    if (e.key === "Enter" && matches.length === 1) {
      e.preventDefault();
      selectTrailer(matches[0]);
    }
  }

  function clearAllFilters() {
    onFiltersChange(DEFAULT_TRAILER_PAGE_FILTERS);
    setOpen(false);
  }

  return (
    <div className="flex flex-col gap-3 border border-[#2f3336] bg-black p-4 lg:flex-row lg:items-center print:hidden">
      <div ref={rootRef} className="relative min-w-0 flex-1">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#71767b]"
          strokeWidth={1.75}
        />
        <Input
          value={filters.search}
          onChange={(e) => {
            update({ search: e.target.value });
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search trailer no, type, status…"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={listId}
          aria-autocomplete="list"
          className="h-10 rounded-none border-[#2f3336] bg-[#16181c] pr-9 pl-9 text-sm text-white placeholder:text-[#71767b]"
        />
        {filters.search && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute top-1/2 right-1 -translate-y-1/2 text-[#71767b] hover:text-white"
            onClick={clearSearch}
            aria-label="Clear search"
          >
            <X className="size-4" strokeWidth={1.75} />
          </Button>
        )}

        {showDropdown && (
          <ul
            id={listId}
            role="listbox"
            className="absolute top-full right-0 left-0 z-50 mt-1 max-h-64 overflow-y-auto rounded-none border border-[#2f3336] bg-black py-1 shadow-lg"
          >
            {matches.length === 0 ? (
              <li className="px-3 py-2 text-sm text-[#71767b]">
                No trailers found
              </li>
            ) : (
              matches.map((trailer) => (
                <li key={trailer.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={false}
                    className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left hover:bg-[#16181c]"
                    onClick={() => selectTrailer(trailer)}
                  >
                    <span className="font-mono text-sm font-medium text-white">
                      {trailer.trailerNumber}
                    </span>
                    <span className="flex items-center gap-2">
                      <TrailerTypeBadge type={deriveTrailerType(trailer)} />
                      <FleetStatusBadge
                        status={getFleetDisplayStatus(trailer)}
                      />
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={filters.status}
          onValueChange={(value) =>
            update({
              status: (value ?? "all") as TrailerPageFilters["status"],
            })
          }
        >
          <SelectTrigger className="h-10 w-[160px] rounded-none border-[#2f3336] bg-[#16181c] text-sm text-white">
            <SlidersHorizontal
              className="size-3.5 text-[#71767b]"
              strokeWidth={1.75}
            />
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent className="rounded-none border-[#2f3336] bg-black">
            <SelectItem value="all">All statuses</SelectItem>
            {FLEET_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {FLEET_STATUS_LABELS[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.type}
          onValueChange={(value) =>
            update({
              type: (value ?? "all") as TrailerPageFilters["type"],
            })
          }
        >
          <SelectTrigger className="h-10 w-[140px] rounded-none border-[#2f3336] bg-[#16181c] text-sm text-white">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent className="rounded-none border-[#2f3336] bg-black">
            <SelectItem value="all">All types</SelectItem>
            {TRAILER_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant="outline"
          className="h-10 rounded-none border-[#1d9bf0]/50 bg-[#1d9bf0]/10 text-[#1d9bf0] hover:bg-[#1d9bf0]/20 hover:text-[#1d9bf0]"
          onClick={clearAllFilters}
          disabled={!hasActiveFilters}
        >
          <Filter strokeWidth={1.75} />
          Filters
        </Button>
      </div>
    </div>
  );
}
