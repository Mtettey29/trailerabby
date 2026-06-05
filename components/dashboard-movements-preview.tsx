"use client";

import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import {
  MovementStatusBadge,
  MovementTypeBadge,
} from "@/components/movement-badges";
import { PanelCard } from "@/components/panel-card";
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

const PREVIEW_SIZE = 5;

interface DashboardMovementsPreviewProps {
  trailers: Trailer[];
  onEdit: (trailer: Trailer) => void;
}

export function DashboardMovementsPreview({
  trailers,
  onEdit,
}: DashboardMovementsPreviewProps) {
  const preview = trailers.slice(0, PREVIEW_SIZE);
  const total = trailers.length;
  const rangeEnd = Math.min(PREVIEW_SIZE, total);

  return (
    <PanelCard
      id="movements-table"
      title="Latest trailer movements"
      action={
        <Link
          href="/movements"
          className="text-xs text-[#1d9bf0] hover:underline"
        >
          View all movements
        </Link>
      }
      bodyClassName="p-0"
    >
      <Table className="rounded-none">
        <TableHeader>
          <TableRow className="border-[#2f3336] hover:bg-transparent">
            <TableHead className="px-4 text-xs font-normal text-[#71767b]">
              Date &amp; time
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
          {preview.length === 0 ? (
            <TableRow className="border-[#2f3336] hover:bg-transparent">
              <TableCell
                colSpan={8}
                className="px-4 py-12 text-center text-sm text-[#71767b]"
              >
                No movements match your filters.
              </TableCell>
            </TableRow>
          ) : (
            preview.map((trailer) => {
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

      <div className="border-t border-[#2f3336] px-4 py-3 text-xs text-[#71767b]">
        Showing 1 to {rangeEnd} of {total} movements
      </div>
    </PanelCard>
  );
}
