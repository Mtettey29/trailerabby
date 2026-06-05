"use client";

import { Activity, MapPin, Search, SlidersHorizontal } from "lucide-react";
import {
  DEFAULT_LOCATION_PAGE_FILTERS,
  type LocationPageFilters,
} from "@/lib/location-display";
import {
  LOCATION_STATUSES,
  LOCATION_STATUS_LABELS,
  LOCATION_TYPES,
  LOCATION_TYPE_LABELS,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LocationFiltersBarProps {
  filters: LocationPageFilters;
  onFiltersChange: (filters: LocationPageFilters) => void;
}

export function LocationFiltersBar({
  filters,
  onFiltersChange,
}: LocationFiltersBarProps) {
  const hasActiveFilters =
    filters.type !== "all" ||
    filters.status !== "all" ||
    filters.search.trim().length > 0;

  function update(partial: Partial<LocationPageFilters>) {
    onFiltersChange({ ...filters, ...partial });
  }

  function clearAllFilters() {
    onFiltersChange(DEFAULT_LOCATION_PAGE_FILTERS);
  }

  return (
    <div className="flex flex-col gap-3 border border-[#2f3336] bg-black p-4 lg:flex-row lg:items-center print:hidden">
      <div className="relative min-w-0 flex-1">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#71767b]"
          strokeWidth={1.75}
        />
        <Input
          value={filters.search}
          onChange={(e) => update({ search: e.target.value })}
          placeholder="Search location name..."
          className="h-9 rounded-none border-[#2f3336] bg-[#16181c] pl-9 text-white placeholder:text-[#71767b]"
        />
      </div>

      <Select
        value={filters.type}
        onValueChange={(value) => {
          if (value) update({ type: value as LocationPageFilters["type"] });
        }}
      >
        <SelectTrigger className="h-9 w-full rounded-none border-[#2f3336] bg-[#16181c] text-white lg:w-44">
          <MapPin className="size-4 text-[#71767b]" strokeWidth={1.75} />
          <SelectValue placeholder="All Location Types" />
        </SelectTrigger>
        <SelectContent className="rounded-none border-[#2f3336] bg-black text-white">
          <SelectItem value="all">All Location Types</SelectItem>
          {LOCATION_TYPES.map((type) => (
            <SelectItem key={type} value={type}>
              {LOCATION_TYPE_LABELS[type]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.status}
        onValueChange={(value) => {
          if (value) update({ status: value as LocationPageFilters["status"] });
        }}
      >
        <SelectTrigger className="h-9 w-full rounded-none border-[#2f3336] bg-[#16181c] text-white lg:w-40">
          <Activity className="size-4 text-[#71767b]" strokeWidth={1.75} />
          <SelectValue placeholder="Active Status" />
        </SelectTrigger>
        <SelectContent className="rounded-none border-[#2f3336] bg-black text-white">
          <SelectItem value="all">Active Status</SelectItem>
          {LOCATION_STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              {LOCATION_STATUS_LABELS[status]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        type="button"
        variant="outline"
        className="h-9 rounded-none border-[#2f3336] bg-[#16181c] text-white hover:bg-[#080808] hover:text-white"
        onClick={clearAllFilters}
        disabled={!hasActiveFilters}
      >
        <SlidersHorizontal className="text-[#71767b]" strokeWidth={1.75} />
        Filters
      </Button>
    </div>
  );
}
