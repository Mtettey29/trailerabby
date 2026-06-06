import Link from "next/link";
import { ArrowUpRight, MapPin, Truck } from "lucide-react";
import { TrailerDetailCard } from "@/components/trailer-detail-card";
import {
  buildMovementHistory,
  currentMovementEndpoints,
  movementStatusClass,
  movementStatusLabel,
} from "@/lib/trailer-detail";
import { deriveMovementType, formatDriverShort } from "@/lib/movements";
import { MOVEMENT_TYPE_LABELS } from "@/lib/movements";
import { formatFullTimestamp } from "@/lib/format";
import type { Trailer } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TrailerDetailMovementProps {
  trailer: Trailer;
  showHistory?: boolean;
}

export function TrailerDetailCurrentMovement({
  trailer,
}: {
  trailer: Trailer;
}) {
  const endpoints = currentMovementEndpoints(trailer);
  const movementType = MOVEMENT_TYPE_LABELS[deriveMovementType(trailer)];
  const inTransit = trailer.status === "outbound";

  return (
    <TrailerDetailCard
      title="Current Movement"
      action={
        <Link
          href="/movements"
          className="inline-flex h-8 items-center gap-2 rounded-none border border-[#2f3336] px-3 text-sm text-white hover:bg-[#16181c]"
        >
          View Movement
          <ArrowUpRight strokeWidth={1.75} />
        </Link>
      }
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`inline-flex rounded-none px-2 py-0.5 text-xs font-medium ${movementStatusClass(trailer)}`}
          >
            {movementStatusLabel(trailer)}
          </span>
        </div>

        <div className="relative px-2 py-4">
          <div className="absolute top-1/2 right-8 left-8 h-px -translate-y-1/2 bg-[#2f3336]" />
          <div className="relative flex items-center justify-between gap-4">
            <div className="max-w-[40%]">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-[#00ba7c]" />
                <div>
                  <p className="text-sm font-medium text-white">
                    {endpoints.origin}
                  </p>
                  <p className="text-xs text-[#71767b]">
                    {endpoints.originSub}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-1 px-4 text-center">
              <span className="flex size-10 items-center justify-center rounded-none border border-[#1d9bf0]/30 bg-[#1d9bf0]/10">
                <Truck className="size-5 text-[#1d9bf0]" strokeWidth={1.75} />
              </span>
              {inTransit && (
                <p className="text-xs text-[#71767b]">
                  {endpoints.distanceMi} mi · Est. {endpoints.etaHours}h{" "}
                  {endpoints.etaMinutes}m
                </p>
              )}
            </div>

            <div className="max-w-[40%] text-right">
              <div className="flex items-start justify-end gap-2">
                <div>
                  <p className="text-sm font-medium text-white">
                    {endpoints.destination}
                  </p>
                  <p className="text-xs text-[#71767b]">
                    {endpoints.destinationSub}
                  </p>
                </div>
                <MapPin className="mt-0.5 size-4 shrink-0 text-[#f4212e]" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 border-t border-[#2f3336] pt-4 sm:grid-cols-4">
          <div>
            <p className="text-xs text-[#71767b]">Movement Type</p>
            <p className="mt-1 text-sm text-white">{movementType}</p>
          </div>
          <div>
            <p className="text-xs text-[#71767b]">Trailer ID</p>
            <p className="mt-1 font-mono text-sm text-white">
              {trailer.trailerNumber}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#71767b]">Driver</p>
            <p className="mt-1 text-sm text-white">
              {trailer.driver.trim()
                ? formatDriverShort(trailer.driver)
                : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#71767b]">Status</p>
            <p className="mt-1 text-sm text-white">
              {movementStatusLabel(trailer)}
            </p>
          </div>
        </div>
      </div>
    </TrailerDetailCard>
  );
}

export function TrailerDetailMovementHistory({
  trailer,
}: TrailerDetailMovementProps) {
  const rows = buildMovementHistory(trailer);

  return (
    <TrailerDetailCard title="Movement History">
      <Table className="rounded-none">
        <TableHeader>
          <TableRow className="border-[#2f3336] hover:bg-transparent">
            <TableHead className="text-xs font-normal text-[#71767b]">
              Date & Time
            </TableHead>
            <TableHead className="text-xs font-normal text-[#71767b]">
              Type
            </TableHead>
            <TableHead className="text-xs font-normal text-[#71767b]">
              From
            </TableHead>
            <TableHead className="text-xs font-normal text-[#71767b]">
              To
            </TableHead>
            <TableHead className="text-xs font-normal text-[#71767b]">
              Driver
            </TableHead>
            <TableHead className="text-xs font-normal text-[#71767b]">
              Status
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.id}
              className="border-[#2f3336] hover:bg-[#080808]"
            >
              <TableCell className="text-sm text-[#e7e9ea]">
                {formatFullTimestamp(row.at)}
              </TableCell>
              <TableCell className="text-sm text-white">{row.type}</TableCell>
              <TableCell className="text-sm text-[#71767b]">{row.from}</TableCell>
              <TableCell className="text-sm text-[#71767b]">{row.to}</TableCell>
              <TableCell className="text-sm text-[#71767b]">
                {row.driver}
              </TableCell>
              <TableCell>
                <span
                  className={`inline-flex rounded-none px-2 py-0.5 text-xs font-medium ${row.statusClass}`}
                >
                  {row.status}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="mt-4 border-t border-[#2f3336] pt-4">
        <Link
          href="/movements"
          className="inline-flex items-center gap-1 text-sm text-[#1d9bf0] hover:underline"
        >
          View all movements
          <ArrowUpRight className="size-4" strokeWidth={1.75} />
        </Link>
      </div>
    </TrailerDetailCard>
  );
}
