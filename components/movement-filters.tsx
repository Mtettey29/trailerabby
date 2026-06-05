"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  ArrowLeftRight,
  Filter,
  MapPin,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import type { Trailer } from "@/lib/types";
import { STATUS_LABELS, TRAILER_STATUSES } from "@/lib/types";
import {
  deriveMovementType,
  MOVEMENT_TYPE_LABELS,
  MOVEMENT_TYPES,
  type MovementPageFilters,
} from "@/lib/movements";
import { filterTrailers } from "@/lib/search-trailers";
import { MovementTypeBadge } from "@/components/movement-badges";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MovementFiltersProps {
  trailers: Trailer[];
  filters: MovementPageFilters;
  locations: string[];
  onFiltersChange: (filters: MovementPageFilters) => void;
  onSelectTrailer: (trailer: Trailer) => void;
}

export function MovementFiltersBar({
  trailers,
  filters,
  locations,
  onFiltersChange,
  onSelectTrailer,
}: MovementFiltersProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const matches = filterTrailers(trailers, filters.search).slice(0, 8);
  const showDropdown = open && filters.search.trim().length > 0;
  const hasActiveFilters =
    filters.status !== "all" ||
    filters.location !== "all" ||
    filters.movementType !== "all" ||
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

  function update(partial: Partial<MovementPageFilters>) {
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
    onFiltersChange({
      search: "",
      status: "all",
      location: "all",
      movementType: "all",
    });
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
          placeholder="Search trailer no, driver, location…"
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
                    <MovementTypeBadge type={deriveMovementType(trailer)} />
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={filters.location}
          onValueChange={(value) => update({ location: value ?? "all" })}
        >
          <SelectTrigger className="h-10 w-[160px] rounded-none border-[#2f3336] bg-[#16181c] text-sm text-white">
            <MapPin className="size-3.5 text-[#71767b]" strokeWidth={1.75} />
            <SelectValue placeholder="All locations" />
          </SelectTrigger>
          <SelectContent className="rounded-none border-[#2f3336] bg-black">
            <SelectItem value="all">All locations</SelectItem>
            {locations.map((location) => (
              <SelectItem key={location} value={location}>
                {location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.status}
          onValueChange={(value) =>
            update({
              status: (value ?? "all") as MovementPageFilters["status"],
            })
          }
        >
          <SelectTrigger className="h-10 w-[150px] rounded-none border-[#2f3336] bg-[#16181c] text-sm text-white">
            <SlidersHorizontal
              className="size-3.5 text-[#71767b]"
              strokeWidth={1.75}
            />
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent className="rounded-none border-[#2f3336] bg-black">
            <SelectItem value="all">All statuses</SelectItem>
            {TRAILER_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {STATUS_LABELS[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.movementType}
          onValueChange={(value) =>
            update({
              movementType: (value ??
                "all") as MovementPageFilters["movementType"],
            })
          }
        >
          <SelectTrigger className="h-10 w-[180px] rounded-none border-[#2f3336] bg-[#16181c] text-sm text-white">
            <ArrowLeftRight
              className="size-3.5 text-[#71767b]"
              strokeWidth={1.75}
            />
            <SelectValue placeholder="All movement types" />
          </SelectTrigger>
          <SelectContent className="rounded-none border-[#2f3336] bg-black">
            <SelectItem value="all">All movement types</SelectItem>
            {MOVEMENT_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {MOVEMENT_TYPE_LABELS[type]}
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
