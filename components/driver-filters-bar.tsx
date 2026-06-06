"use client";

import { Filter, Search, SlidersHorizontal } from "lucide-react";
import {
  DEFAULT_DRIVER_PAGE_FILTERS,
  type DriverPageFilters,
} from "@/lib/driver-display";
import { DRIVER_STATUSES, DRIVER_STATUS_LABELS } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DriverFiltersBarProps {
  filters: DriverPageFilters;
  onFiltersChange: (filters: DriverPageFilters) => void;
}

export function DriverFiltersBar({
  filters,
  onFiltersChange,
}: DriverFiltersBarProps) {
  const hasActiveFilters =
    filters.status !== "all" || filters.search.trim().length > 0;

  function update(partial: Partial<DriverPageFilters>) {
    onFiltersChange({ ...filters, ...partial });
  }

  function clearAllFilters() {
    onFiltersChange(DEFAULT_DRIVER_PAGE_FILTERS);
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
          placeholder="Search driver name, ID, phone..."
          className="h-9 rounded-none border-[#2f3336] bg-[#16181c] pl-9 text-white placeholder:text-[#71767b]"
        />
      </div>

      <Select
        value={filters.status}
        onValueChange={(value) => {
          if (value) update({ status: value as DriverPageFilters["status"] });
        }}
      >
        <SelectTrigger className="h-9 w-full rounded-none border-[#2f3336] bg-[#16181c] text-white lg:w-40">
          <Filter className="size-4 text-[#71767b]" strokeWidth={1.75} />
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent className="rounded-none border-[#2f3336] bg-black text-white">
          <SelectItem value="all">All Status</SelectItem>
          {DRIVER_STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              {DRIVER_STATUS_LABELS[status]}
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
