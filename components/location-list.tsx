"use client";

import { MoreVertical } from "lucide-react";
import {
  countTrailersAtLocation,
  formatLocationAddress,
  getLocationAvatarClass,
  getLocationInitial,
  getLocationTypeLabel,
} from "@/lib/location-display";
import type { Location, Trailer } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface LocationListProps {
  locations: Location[];
  trailers: Trailer[];
  selectedId: string | null;
  onSelect: (location: Location) => void;
  onEdit: (location: Location) => void;
  onDelete: (location: Location) => void;
}

export function LocationList({
  locations,
  trailers,
  selectedId,
  onSelect,
  onEdit,
  onDelete,
}: LocationListProps) {
  if (locations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-16 text-center text-sm text-[#71767b]">
        <p>No locations match your filters.</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-[#2f3336]">
      {locations.map((location) => {
        const trailerCount = countTrailersAtLocation(location, trailers);
        const address = formatLocationAddress(location);
        const addressLines = address.split("\n").filter(Boolean);
        const isSelected = selectedId === location.id;

        return (
          <li key={location.id}>
            <div
              className={cn(
                "flex gap-3 px-4 py-4 transition-colors",
                isSelected ? "bg-[#16181c]" : "hover:bg-[#0d0d0d]"
              )}
            >
              <button
                type="button"
                onClick={() => onSelect(location)}
                className="flex min-w-0 flex-1 items-start gap-3 text-left"
              >
                <div className="relative shrink-0">
                  <div
                    className={cn(
                      "flex size-10 items-center justify-center rounded-none text-sm font-semibold",
                      getLocationAvatarClass(location.type)
                    )}
                  >
                    {getLocationInitial(location)}
                  </div>
                  {location.status === "active" && (
                    <span
                      className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full border-2 border-black bg-emerald-500"
                      aria-hidden
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-white">
                    {location.name}
                  </p>
                  <p className="text-xs text-[#71767b]">
                    {getLocationTypeLabel(location.type)}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-[#71767b]">
                    {addressLines.map((line, index) => (
                      <span key={`${location.id}-addr-${index}`}>
                        {index > 0 && <br />}
                        {line}
                      </span>
                    ))}
                  </p>
                  <p className="mt-2 text-xs text-[#e7e9ea]">
                    {trailerCount} Trailer{trailerCount === 1 ? "" : "s"}
                  </p>
                </div>
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger
                  className="inline-flex size-8 shrink-0 items-center justify-center rounded-none text-[#71767b] hover:bg-[#2f3336] hover:text-white"
                  aria-label={`Actions for ${location.name}`}
                >
                  <MoreVertical className="size-4" strokeWidth={1.75} />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="rounded-none border-[#2f3336] bg-black text-white"
                >
                  <DropdownMenuItem
                    className="rounded-none focus:bg-[#16181c] focus:text-white"
                    onClick={() => onEdit(location)}
                  >
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="rounded-none text-[#f4212e] focus:bg-[#f4212e]/10 focus:text-[#f4212e]"
                    onClick={() => onDelete(location)}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
