"use client";

import { Search } from "lucide-react";
import type { MaintenancePageFilters } from "@/lib/maintenance-display";
import {
  MAINTENANCE_PRIORITIES,
  MAINTENANCE_PRIORITY_LABELS,
  MAINTENANCE_SERVICE_STATUSES,
  MAINTENANCE_SERVICE_STATUS_LABELS,
  MAINTENANCE_SERVICE_TYPES,
  MAINTENANCE_SERVICE_TYPE_LABELS,
} from "@/lib/types";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MaintenanceFiltersBarProps {
  filters: MaintenancePageFilters;
  onFiltersChange: (filters: MaintenancePageFilters) => void;
}

export function MaintenanceFiltersBar({
  filters,
  onFiltersChange,
}: MaintenanceFiltersBarProps) {
  function update(partial: Partial<MaintenancePageFilters>) {
    onFiltersChange({ ...filters, ...partial });
  }

  return (
    <div className="flex flex-col gap-3 border border-b-0 border-[#2f3336] bg-black p-4 sm:flex-row sm:items-center print:hidden">
      <Select
        value={filters.type}
        onValueChange={(value) => {
          if (value) update({ type: value as MaintenancePageFilters["type"] });
        }}
      >
        <SelectTrigger className="h-9 w-full rounded-none border-[#2f3336] bg-[#16181c] text-white sm:w-40">
          <SelectValue placeholder="All Types" />
        </SelectTrigger>
        <SelectContent className="rounded-none border-[#2f3336] bg-black text-white">
          <SelectItem value="all">All Types</SelectItem>
          {MAINTENANCE_SERVICE_TYPES.map((type) => (
            <SelectItem key={type} value={type}>
              {MAINTENANCE_SERVICE_TYPE_LABELS[type]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.status}
        onValueChange={(value) => {
          if (value) update({ status: value as MaintenancePageFilters["status"] });
        }}
      >
        <SelectTrigger className="h-9 w-full rounded-none border-[#2f3336] bg-[#16181c] text-white sm:w-36">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent className="rounded-none border-[#2f3336] bg-black text-white">
          <SelectItem value="all">All Statuses</SelectItem>
          {MAINTENANCE_SERVICE_STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              {MAINTENANCE_SERVICE_STATUS_LABELS[status]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.priority}
        onValueChange={(value) => {
          if (value)
            update({ priority: value as MaintenancePageFilters["priority"] });
        }}
      >
        <SelectTrigger className="h-9 w-full rounded-none border-[#2f3336] bg-[#16181c] text-white sm:w-36">
          <SelectValue placeholder="All Priorities" />
        </SelectTrigger>
        <SelectContent className="rounded-none border-[#2f3336] bg-black text-white">
          <SelectItem value="all">All Priorities</SelectItem>
          {MAINTENANCE_PRIORITIES.map((priority) => (
            <SelectItem key={priority} value={priority}>
              {MAINTENANCE_PRIORITY_LABELS[priority]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="relative min-w-0 flex-1">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#71767b]"
          strokeWidth={1.75}
        />
        <Input
          value={filters.search}
          onChange={(e) => update({ search: e.target.value })}
          placeholder="Search services..."
          className="h-9 rounded-none border-[#2f3336] bg-[#16181c] pl-9 text-white placeholder:text-[#71767b]"
        />
      </div>
    </div>
  );
}
