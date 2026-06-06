"use client";

import { Filter, Search, SlidersHorizontal } from "lucide-react";
import {
  DEFAULT_ALERT_PAGE_FILTERS,
  type AlertPageFilters,
  uniqueRelatedTo,
} from "@/lib/alert-display";
import type { SystemAlert } from "@/lib/types";
import {
  ALERT_SEVERITIES,
  ALERT_SEVERITY_LABELS,
  ALERT_STATUSES,
  ALERT_STATUS_LABELS,
  ALERT_TYPES,
  ALERT_TYPE_LABELS,
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

interface AlertFiltersBarProps {
  alerts: SystemAlert[];
  filters: AlertPageFilters;
  onFiltersChange: (filters: AlertPageFilters) => void;
}

export function AlertFiltersBar({
  alerts,
  filters,
  onFiltersChange,
}: AlertFiltersBarProps) {
  const relatedOptions = uniqueRelatedTo(alerts);
  const hasActiveFilters =
    filters.severity !== "all" ||
    filters.status !== "all" ||
    filters.type !== "all" ||
    filters.relatedTo !== "all" ||
    filters.search.trim().length > 0;

  function update(partial: Partial<AlertPageFilters>) {
    onFiltersChange({ ...filters, ...partial });
  }

  function clearAllFilters() {
    onFiltersChange(DEFAULT_ALERT_PAGE_FILTERS);
  }

  return (
    <div className="flex flex-col gap-3 border border-[#2f3336] bg-black p-4 lg:flex-row lg:items-center print:hidden">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <Select
          value={filters.severity}
          onValueChange={(value) => {
            if (value) update({ severity: value as AlertPageFilters["severity"] });
          }}
        >
          <SelectTrigger className="h-9 w-full rounded-none border-[#2f3336] bg-[#16181c] text-white sm:w-40">
            <Filter className="size-4 text-[#71767b]" strokeWidth={1.75} />
            <SelectValue placeholder="All Severities" />
          </SelectTrigger>
          <SelectContent className="rounded-none border-[#2f3336] bg-black text-white">
            <SelectItem value="all">All Severities</SelectItem>
            {ALERT_SEVERITIES.map((severity) => (
              <SelectItem key={severity} value={severity}>
                {ALERT_SEVERITY_LABELS[severity]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.status}
          onValueChange={(value) => {
            if (value) update({ status: value as AlertPageFilters["status"] });
          }}
        >
          <SelectTrigger className="h-9 w-full rounded-none border-[#2f3336] bg-[#16181c] text-white sm:w-36">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent className="rounded-none border-[#2f3336] bg-black text-white">
            <SelectItem value="all">All Statuses</SelectItem>
            {ALERT_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {ALERT_STATUS_LABELS[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.type}
          onValueChange={(value) => {
            if (value) update({ type: value as AlertPageFilters["type"] });
          }}
        >
          <SelectTrigger className="h-9 w-full rounded-none border-[#2f3336] bg-[#16181c] text-white sm:w-36">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent className="rounded-none border-[#2f3336] bg-black text-white">
            <SelectItem value="all">All Types</SelectItem>
            {ALERT_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {ALERT_TYPE_LABELS[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.relatedTo}
          onValueChange={(value) => {
            if (value) update({ relatedTo: value });
          }}
        >
          <SelectTrigger className="h-9 w-full rounded-none border-[#2f3336] bg-[#16181c] text-white sm:w-44">
            <SelectValue placeholder="All Trailers/Drivers" />
          </SelectTrigger>
          <SelectContent className="rounded-none border-[#2f3336] bg-black text-white">
            <SelectItem value="all">All Trailers/Drivers</SelectItem>
            {relatedOptions.map((related) => (
              <SelectItem key={related} value={related}>
                {related}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1 sm:w-56 sm:flex-none">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#71767b]"
            strokeWidth={1.75}
          />
          <Input
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
            placeholder="Search alerts..."
            className="h-9 rounded-none border-[#2f3336] bg-[#16181c] pl-9 text-white placeholder:text-[#71767b]"
          />
        </div>

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
    </div>
  );
}
