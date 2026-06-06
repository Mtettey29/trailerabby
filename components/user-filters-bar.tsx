"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import {
  DEFAULT_USER_PAGE_FILTERS,
  type UserPageFilters,
  uniqueUserLocations,
} from "@/lib/user-display";
import type { AppUser } from "@/lib/types";
import {
  USER_ROLES,
  USER_ROLE_LABELS,
  USER_STATUSES,
  USER_STATUS_LABELS,
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

interface UserFiltersBarProps {
  users: AppUser[];
  filters: UserPageFilters;
  onFiltersChange: (filters: UserPageFilters) => void;
}

export function UserFiltersBar({
  users,
  filters,
  onFiltersChange,
}: UserFiltersBarProps) {
  const locations = uniqueUserLocations(users);
  const hasActiveFilters =
    filters.role !== "all" ||
    filters.status !== "all" ||
    filters.location !== "all" ||
    filters.search.trim().length > 0;

  function update(partial: Partial<UserPageFilters>) {
    onFiltersChange({ ...filters, ...partial });
  }

  return (
    <div className="flex flex-col gap-3 border border-b-0 border-[#2f3336] bg-black p-4 lg:flex-row lg:items-center print:hidden">
      <div className="relative min-w-0 flex-1">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#71767b]"
          strokeWidth={1.75}
        />
        <Input
          value={filters.search}
          onChange={(e) => update({ search: e.target.value })}
          placeholder="Search users by name, email or phone..."
          className="h-9 rounded-none border-[#2f3336] bg-[#16181c] pl-9 text-white placeholder:text-[#71767b]"
        />
      </div>

      <Select
        value={filters.role}
        onValueChange={(value) => {
          if (value) update({ role: value as UserPageFilters["role"] });
        }}
      >
        <SelectTrigger className="h-9 w-full rounded-none border-[#2f3336] bg-[#16181c] text-white lg:w-36">
          <SelectValue placeholder="All Roles" />
        </SelectTrigger>
        <SelectContent className="rounded-none border-[#2f3336] bg-black text-white">
          <SelectItem value="all">All Roles</SelectItem>
          {USER_ROLES.map((role) => (
            <SelectItem key={role} value={role}>
              {USER_ROLE_LABELS[role]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.status}
        onValueChange={(value) => {
          if (value) update({ status: value as UserPageFilters["status"] });
        }}
      >
        <SelectTrigger className="h-9 w-full rounded-none border-[#2f3336] bg-[#16181c] text-white lg:w-36">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent className="rounded-none border-[#2f3336] bg-black text-white">
          <SelectItem value="all">All Statuses</SelectItem>
          {USER_STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              {USER_STATUS_LABELS[status]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.location}
        onValueChange={(value) => {
          if (value) update({ location: value });
        }}
      >
        <SelectTrigger className="h-9 w-full rounded-none border-[#2f3336] bg-[#16181c] text-white lg:w-40">
          <SelectValue placeholder="All Locations" />
        </SelectTrigger>
        <SelectContent className="rounded-none border-[#2f3336] bg-black text-white">
          <SelectItem value="all">All Locations</SelectItem>
          {locations.map((location) => (
            <SelectItem key={location} value={location}>
              {location}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        type="button"
        variant="outline"
        className="h-9 rounded-none border-[#2f3336] bg-[#16181c] text-white hover:bg-[#080808] hover:text-white"
        onClick={() => onFiltersChange(DEFAULT_USER_PAGE_FILTERS)}
        disabled={!hasActiveFilters}
      >
        <SlidersHorizontal className="text-[#71767b]" strokeWidth={1.75} />
        Filters
      </Button>
    </div>
  );
}
