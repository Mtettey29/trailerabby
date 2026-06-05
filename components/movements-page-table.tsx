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
  MovementStatusBadge,
  MovementTypeBadge,
} from "@/components/movement-badges";
import type { Trailer } from "@/lib/types";
import {
  deriveMovementType,
  formatDriverShort,
  movementFromLocation,
} from "@/lib/movements";
import { formatFullTimestamp } from "@/lib/format";
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

type SortDir = "asc" | "desc";

interface MovementsPageTableProps {
  trailers: Trailer[];
  onEdit: (trailer: Trailer) => void;
}

export function MovementsPageTable({
  trailers,
  onEdit,
}: MovementsPageTableProps) {
  const [page, setPage] = useState(1);
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const sorted = useMemo(() => {
    return [...trailers].sort((a, b) => {
      const diff =
        new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      return sortDir === "desc" ? -diff : diff;
    });
  }, [trailers, sortDir]);

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

  function toggleSort() {
    setSortDir((dir) => (dir === "desc" ? "asc" : "desc"));
  }

  return (
    <div className="border border-t-0 border-[#2f3336] bg-black">
      <Table className="rounded-none">
        <TableHeader>
          <TableRow className="border-[#2f3336] hover:bg-transparent">
            <TableHead className="px-4 text-xs font-normal text-[#71767b]">
              <button
                type="button"
                className="inline-flex items-center gap-1 hover:text-white"
                onClick={toggleSort}
              >
                Date &amp; time
                {sortDir === "desc" ? (
                  <ArrowDown className="size-3" strokeWidth={1.75} />
                ) : (
                  <ArrowUp className="size-3" strokeWidth={1.75} />
                )}
              </button>
            </TableHead>
            <TableHead className="px-4 text-xs font-normal text-[#71767b]">
              Trailer no.
            </TableHead>
            <TableHead className="px-4 text-xs font-normal text-[#71767b]">
              Movement type
            </TableHead>
            <TableHead className="px-4 text-xs font-normal text-[#71767b]">
              From
            </TableHead>
            <TableHead className="px-4 text-xs font-normal text-[#71767b]">
              To
            </TableHead>
            <TableHead className="px-4 text-xs font-normal text-[#71767b]">
              Driver
            </TableHead>
            <TableHead className="px-4 text-xs font-normal text-[#71767b]">
              Status
            </TableHead>
            <TableHead className="w-12 px-4" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageTrailers.length === 0 ? (
            <TableRow className="border-[#2f3336] hover:bg-transparent">
              <TableCell
                colSpan={8}
                className="px-4 py-16 text-center text-sm text-[#71767b]"
              >
                No movements match your filters.
              </TableCell>
            </TableRow>
          ) : (
            pageTrailers.map((trailer) => {
              const movementType = deriveMovementType(trailer);
              const { from, to } = movementFromLocation(trailer);

              return (
                <TableRow
                  key={trailer.id}
                  className="cursor-pointer border-[#2f3336] hover:bg-[#080808]"
                  onClick={() => onEdit(trailer)}
                >
                  <TableCell className="whitespace-nowrap px-4 text-sm text-[#e7e9ea]">
                    {formatFullTimestamp(trailer.updatedAt)}
                  </TableCell>
                  <TableCell className="px-4 font-mono text-sm font-medium text-white">
                    {trailer.trailerNumber}
                  </TableCell>
                  <TableCell className="px-4">
                    <MovementTypeBadge type={movementType} />
                  </TableCell>
                  <TableCell className="px-4 text-sm text-[#71767b]">
                    {from}
                  </TableCell>
                  <TableCell className="px-4 text-sm text-[#71767b]">
                    {to}
                  </TableCell>
                  <TableCell className="px-4 text-sm text-[#e7e9ea]">
                    {formatDriverShort(trailer.driver)}
                  </TableCell>
                  <TableCell className="px-4">
                    <MovementStatusBadge status={trailer.status} />
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
              );
            })
          )}
        </TableBody>
      </Table>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#2f3336] px-4 py-3 text-xs text-[#71767b]">
        <span>
          Showing {rangeStart} to {rangeEnd} of {sorted.length} movements
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
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(
            (pageNum) => (
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
            )
          )}
          {totalPages > 5 && (
            <>
              <span className="px-1">…</span>
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
