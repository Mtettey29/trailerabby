"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import {
  MaintenancePriorityLabel,
  MaintenanceStatusBadge,
} from "@/components/maintenance-badges";
import {
  formatMaintenanceDueDate,
  formatTechnician,
} from "@/lib/maintenance-display";
import type { MaintenanceService } from "@/lib/types";
import { MAINTENANCE_SERVICE_TYPE_LABELS } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PAGE_SIZE = 10;

interface MaintenanceServiceTableProps {
  services: MaintenanceService[];
  onEdit: (service: MaintenanceService) => void;
  onComplete: (service: MaintenanceService) => void;
}

export function MaintenanceServiceTable({
  services,
  onEdit,
  onComplete,
}: MaintenanceServiceTableProps) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(services.length / PAGE_SIZE));
  const firstId = services[0]?.id;

  useEffect(() => {
    setPage(1);
  }, [services.length, firstId]);

  const pageServices = useMemo(() => {
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * PAGE_SIZE;
    return services.slice(start, start + PAGE_SIZE);
  }, [services, page, totalPages]);

  const rangeStart = services.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, services.length);

  function goToPage(next: number) {
    setPage(Math.min(Math.max(1, next), totalPages));
  }

  return (
    <div className="border border-[#2f3336] bg-black">
      <Table className="rounded-none">
        <TableHeader>
          <TableRow className="border-[#2f3336] bg-[#080808] hover:bg-[#080808]">
            <TableHead className="px-4 text-xs font-normal text-[#71767b]">
              Trailer ID
            </TableHead>
            <TableHead className="px-4 text-xs font-normal text-[#71767b]">
              Service type
            </TableHead>
            <TableHead className="px-4 text-xs font-normal text-[#71767b]">
              Due date
            </TableHead>
            <TableHead className="px-4 text-xs font-normal text-[#71767b]">
              Status
            </TableHead>
            <TableHead className="px-4 text-xs font-normal text-[#71767b]">
              Priority
            </TableHead>
            <TableHead className="px-4 text-xs font-normal text-[#71767b]">
              Technician
            </TableHead>
            <TableHead className="w-12 px-4" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageServices.length === 0 ? (
            <TableRow className="border-[#2f3336] hover:bg-transparent">
              <TableCell
                colSpan={7}
                className="px-4 py-16 text-center text-sm text-[#71767b]"
              >
                No services match your filters.
              </TableCell>
            </TableRow>
          ) : (
            pageServices.map((service) => (
              <TableRow
                key={service.id}
                className="cursor-pointer border-[#2f3336] hover:bg-[#080808]"
                onClick={() => onEdit(service)}
              >
                <TableCell className="px-4 font-mono text-sm font-medium text-white">
                  {service.trailerNumber}
                </TableCell>
                <TableCell className="px-4 text-sm text-[#e7e9ea]">
                  {MAINTENANCE_SERVICE_TYPE_LABELS[service.serviceType]}
                </TableCell>
                <TableCell className="px-4 text-sm text-[#71767b]">
                  {formatMaintenanceDueDate(service.dueDate)}
                </TableCell>
                <TableCell className="px-4">
                  <MaintenanceStatusBadge status={service.status} />
                </TableCell>
                <TableCell className="px-4">
                  <MaintenancePriorityLabel priority={service.priority} />
                </TableCell>
                <TableCell className="px-4 text-sm text-[#71767b]">
                  {formatTechnician(service.technician)}
                </TableCell>
                <TableCell className="px-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className="inline-flex size-8 items-center justify-center rounded-none text-[#71767b] hover:bg-[#16181c] hover:text-white"
                      aria-label="Service actions"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal strokeWidth={1.75} />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="rounded-none border-[#2f3336] bg-black text-white"
                    >
                      <DropdownMenuItem
                        className="rounded-none focus:bg-[#16181c] focus:text-white"
                        onClick={() => onEdit(service)}
                      >
                        Edit
                      </DropdownMenuItem>
                      {service.status !== "completed" && (
                        <DropdownMenuItem
                          className="rounded-none focus:bg-[#16181c] focus:text-white"
                          onClick={() => onComplete(service)}
                        >
                          Mark completed
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#2f3336] px-4 py-3 text-xs text-[#71767b]">
        <span>
          Showing {rangeStart} to {rangeEnd} of {services.length} services
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
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="min-w-8 rounded-none border-[#1d9bf0] bg-[#1d9bf0]/10 px-2 tabular-nums text-[#1d9bf0]"
          >
            {page}
          </Button>
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
