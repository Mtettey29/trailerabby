"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";
import {
  FleetStatusBadge,
  TrailerTypeBadge,
} from "@/components/trailer-fleet-badges";
import type { Trailer } from "@/lib/types";
import {
  deriveTrailerType,
  formatLastMovement,
  formatNextDueService,
  getFleetDisplayStatus,
} from "@/lib/trailer-display";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PAGE_SIZE = 10;

type SortKey = "trailerNumber" | "type" | "status" | "location" | "updatedAt";
type SortDir = "asc" | "desc";

interface TrailersPageTableProps {
  trailers: Trailer[];
  onEdit: (trailer: Trailer) => void;
}

export function TrailersPageTable({
  trailers,
  onEdit,
}: TrailersPageTableProps) {
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>("trailerNumber");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const sorted = useMemo(() => {
    return [...trailers].sort((a, b) => {
      let diff = 0;
      switch (sortKey) {
        case "trailerNumber":
          diff = a.trailerNumber.localeCompare(b.trailerNumber);
          break;
        case "type":
          diff = deriveTrailerType(a).localeCompare(deriveTrailerType(b));
          break;
        case "status":
          diff = getFleetDisplayStatus(a).localeCompare(
            getFleetDisplayStatus(b)
          );
          break;
        case "location":
          diff = (a.location || "").localeCompare(b.location || "");
          break;
        case "updatedAt":
          diff =
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
      }
      return sortDir === "asc" ? diff : -diff;
    });
  }, [trailers, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const firstTrailerId = sorted[0]?.id;

  useEffect(() => {
    setPage(1);
  }, [sorted.length, firstTrailerId]);

  const pageTrailers = useMemo(() => {
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * PAGE_SIZE;
    return sorted.slice(start, start + PAGE_SIZE);
  }, [sorted, page, totalPages]);

  const rangeStart = sorted.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, sorted.length);

  function goToPage(next: number) {
    setPage(Math.min(Math.max(1, next), totalPages));
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function SortHeader({
    label,
    column,
  }: {
    label: string;
    column: SortKey;
  }) {
    return (
      <button
        type="button"
        className="inline-flex items-center gap-1 hover:text-white"
        onClick={() => toggleSort(column)}
      >
        {label}
        {sortKey === column &&
          (sortDir === "asc" ? (
            <ArrowUp className="size-3" strokeWidth={1.75} />
          ) : (
            <ArrowDown className="size-3" strokeWidth={1.75} />
          ))}
      </button>
    );
  }

  const pageWindow = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (page <= 3) return [1, 2, 3];
    if (page >= totalPages - 2) {
      return [totalPages - 2, totalPages - 1, totalPages];
    }
    return [page - 1, page, page + 1];
  }, [page, totalPages]);

  return (
    <div className="border border-t-0 border-[#2f3336] bg-black">
      <Table className="rounded-none">
        <TableHeader>
          <TableRow className="border-[#2f3336] bg-[#080808] hover:bg-[#080808]">
            <TableHead className="px-4 text-xs font-normal text-[#71767b]">
              <SortHeader label="Trailer no." column="trailerNumber" />
            </TableHead>
            <TableHead className="px-4 text-xs font-normal text-[#71767b]">
              <SortHeader label="Type" column="type" />
            </TableHead>
            <TableHead className="px-4 text-xs font-normal text-[#71767b]">
              <SortHeader label="Current status" column="status" />
            </TableHead>
            <TableHead className="px-4 text-xs font-normal text-[#71767b]">
              <SortHeader label="Current location" column="location" />
            </TableHead>
            <TableHead className="px-4 text-xs font-normal text-[#71767b]">
              <SortHeader label="Last movement" column="updatedAt" />
            </TableHead>
            <TableHead className="px-4 text-xs font-normal text-[#71767b]">
              Next due service
            </TableHead>
            <TableHead className="w-12 px-4" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageTrailers.length === 0 ? (
            <TableRow className="border-[#2f3336] hover:bg-transparent">
              <TableCell
                colSpan={7}
                className="px-4 py-16 text-center text-sm text-[#71767b]"
              >
                No trailers match your filters.
              </TableCell>
            </TableRow>
          ) : (
            pageTrailers.map((trailer) => (
              <TableRow
                key={trailer.id}
                className="cursor-pointer border-[#2f3336] hover:bg-[#080808]"
                onClick={() => onEdit(trailer)}
              >
                <TableCell className="px-4 font-mono text-sm font-medium text-white">
                  {trailer.trailerNumber}
                </TableCell>
                <TableCell className="px-4">
                  <TrailerTypeBadge type={deriveTrailerType(trailer)} />
                </TableCell>
                <TableCell className="px-4">
                  <FleetStatusBadge status={getFleetDisplayStatus(trailer)} />
                </TableCell>
                <TableCell className="px-4 text-sm text-[#71767b]">
                  {trailer.location || "—"}
                </TableCell>
                <TableCell className="px-4 text-sm text-[#e7e9ea]">
                  {formatLastMovement(trailer)}
                </TableCell>
                <TableCell className="px-4 text-sm text-[#71767b]">
                  {formatNextDueService(trailer)}
                </TableCell>
                <TableCell className="px-4">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-[#71767b] hover:bg-[#16181c] hover:text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(trailer);
                    }}
                    aria-label={`Actions for ${trailer.trailerNumber}`}
                  >
                    <MoreHorizontal strokeWidth={1.75} />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#2f3336] px-4 py-3 text-xs text-[#71767b]">
        <span>
          Showing {rangeStart} to {rangeEnd} of {sorted.length} trailers
        </span>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="rounded-none border-[#2f3336] text-white hover:bg-[#16181c]"
            disabled={page <= 1}
            onClick={() => goToPage(page - 1)}
            aria-label="Previous page"
          >
            <ChevronLeft strokeWidth={1.75} />
          </Button>
          {pageWindow[0] > 1 && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="min-w-8 rounded-none border-[#2f3336] text-white hover:bg-[#16181c]"
                onClick={() => goToPage(1)}
              >
                1
              </Button>
              {pageWindow[0] > 2 && <span className="px-1">…</span>}
            </>
          )}
          {pageWindow.map((pageNum) => (
            <Button
              key={pageNum}
              type="button"
              variant="outline"
              size="sm"
              className={`min-w-8 rounded-none border-[#2f3336] px-2 tabular-nums ${
                pageNum === page
                  ? "border-[#1d9bf0] bg-[#1d9bf0]/10 text-[#1d9bf0]"
                  : "text-white hover:bg-[#16181c]"
              }`}
              onClick={() => goToPage(pageNum)}
            >
              {pageNum}
            </Button>
          ))}
          {pageWindow[pageWindow.length - 1] < totalPages && (
            <>
              {pageWindow[pageWindow.length - 1] < totalPages - 1 && (
                <span className="px-1">…</span>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="min-w-8 rounded-none border-[#2f3336] text-white hover:bg-[#16181c]"
                onClick={() => goToPage(totalPages)}
              >
                {totalPages}
              </Button>
            </>
          )}
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="rounded-none border-[#2f3336] text-white hover:bg-[#16181c]"
            disabled={page >= totalPages}
            onClick={() => goToPage(page + 1)}
            aria-label="Next page"
          >
            <ChevronRight strokeWidth={1.75} />
          </Button>
        </div>
      </div>
    </div>
  );
}
