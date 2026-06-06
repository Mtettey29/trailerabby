"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import {
  AlertSeverityBadge,
  AlertStatusBadge,
} from "@/components/alert-badges";
import {
  ALERT_SEVERITY_DOT,
  formatAlertTime,
  formatAssignee,
} from "@/lib/alert-display";
import type { SystemAlert } from "@/lib/types";
import { ALERT_TYPE_LABELS } from "@/lib/types";
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

interface AlertsPageTableProps {
  alerts: SystemAlert[];
  onResolve: (alert: SystemAlert) => void;
  onReopen: (alert: SystemAlert) => void;
}

export function AlertsPageTable({
  alerts,
  onResolve,
  onReopen,
}: AlertsPageTableProps) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(alerts.length / PAGE_SIZE));
  const firstAlertId = alerts[0]?.id;

  useEffect(() => {
    setPage(1);
  }, [alerts.length, firstAlertId]);

  const pageAlerts = useMemo(() => {
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * PAGE_SIZE;
    return alerts.slice(start, start + PAGE_SIZE);
  }, [alerts, page, totalPages]);

  const rangeStart = alerts.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, alerts.length);

  function goToPage(next: number) {
    setPage(Math.min(Math.max(1, next), totalPages));
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
              Alert
            </TableHead>
            <TableHead className="px-4 text-xs font-normal text-[#71767b]">
              Type
            </TableHead>
            <TableHead className="px-4 text-xs font-normal text-[#71767b]">
              Severity
            </TableHead>
            <TableHead className="px-4 text-xs font-normal text-[#71767b]">
              Related to
            </TableHead>
            <TableHead className="px-4 text-xs font-normal text-[#71767b]">
              Time
            </TableHead>
            <TableHead className="px-4 text-xs font-normal text-[#71767b]">
              Status
            </TableHead>
            <TableHead className="px-4 text-xs font-normal text-[#71767b]">
              Assigned to
            </TableHead>
            <TableHead className="w-12 px-4" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageAlerts.length === 0 ? (
            <TableRow className="border-[#2f3336] hover:bg-transparent">
              <TableCell
                colSpan={8}
                className="px-4 py-16 text-center text-sm text-[#71767b]"
              >
                No alerts match your filters.
              </TableCell>
            </TableRow>
          ) : (
            pageAlerts.map((alert) => (
              <TableRow
                key={alert.id}
                className="border-[#2f3336] hover:bg-[#080808]"
              >
                <TableCell className="px-4">
                  <div className="flex items-start gap-2">
                    <span
                      className={`mt-1.5 size-2 shrink-0 rounded-full ${ALERT_SEVERITY_DOT[alert.severity]}`}
                      aria-hidden
                    />
                    <span className="text-sm text-white">{alert.message}</span>
                  </div>
                </TableCell>
                <TableCell className="px-4 text-sm text-[#71767b]">
                  {ALERT_TYPE_LABELS[alert.type]}
                </TableCell>
                <TableCell className="px-4">
                  <AlertSeverityBadge severity={alert.severity} />
                </TableCell>
                <TableCell className="px-4 font-mono text-sm text-[#e7e9ea]">
                  {alert.relatedTo}
                </TableCell>
                <TableCell className="px-4 text-sm text-[#71767b]">
                  {formatAlertTime(alert.createdAt)}
                </TableCell>
                <TableCell className="px-4">
                  <AlertStatusBadge status={alert.status} />
                </TableCell>
                <TableCell className="px-4 text-sm text-[#71767b]">
                  {formatAssignee(alert.assignedTo)}
                </TableCell>
                <TableCell className="px-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className="inline-flex size-8 items-center justify-center rounded-none text-[#71767b] hover:bg-[#16181c] hover:text-white"
                      aria-label={`Actions for alert`}
                    >
                      <MoreHorizontal strokeWidth={1.75} />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="rounded-none border-[#2f3336] bg-black text-white"
                    >
                      {alert.status === "open" ? (
                        <DropdownMenuItem
                          className="rounded-none focus:bg-[#16181c] focus:text-white"
                          onClick={() => onResolve(alert)}
                        >
                          Mark resolved
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          className="rounded-none focus:bg-[#16181c] focus:text-white"
                          onClick={() => onReopen(alert)}
                        >
                          Reopen
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
          Showing {rangeStart} to {rangeEnd} of {alerts.length} alerts
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
