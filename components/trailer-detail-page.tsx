"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ChevronDown,
  Loader2,
  Pencil,
} from "lucide-react";
import { useCanMutate } from "@/components/auth-provider";
import { PageHeaderActions } from "@/components/page-header-actions";
import { TrailerDetailDocuments } from "@/components/trailer-detail-documents";
import { AlertSeverityBadge } from "@/components/alert-badges";
import { TrailerDetailAside } from "@/components/trailer-detail-aside";
import { TrailerDetailCard } from "@/components/trailer-detail-card";
import {
  TrailerDetailCurrentMovement,
  TrailerDetailMovementHistory,
} from "@/components/trailer-detail-movement";
import { TrailerDetailSummary } from "@/components/trailer-detail-summary";
import { TrailerModal, type TrailerFormData } from "@/components/TrailerModal";
import {
  alertsForTrailer,
  buildTrailerDetailMeta,
  maintenanceForTrailer,
  trailerHistoryEvents,
  type TrailerDetailTabId,
} from "@/lib/trailer-detail";
import {
  formatMaintenanceDueDate,
  MAINTENANCE_STATUS_CLASS,
} from "@/lib/maintenance-display";
import { formatFullTimestamp, formatRelativeTime } from "@/lib/format";
import type { MaintenanceService, SystemAlert, Trailer } from "@/lib/types";
import {
  MAINTENANCE_SERVICE_TYPE_LABELS,
  MAINTENANCE_SERVICE_STATUS_LABELS,
} from "@/lib/types";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
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
import { cn } from "@/lib/utils";

const TABS: { id: TrailerDetailTabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "movements", label: "Movements" },
  { id: "maintenance", label: "Maintenance" },
  { id: "documents", label: "Documents" },
  { id: "alerts", label: "Alerts" },
  { id: "history", label: "History" },
];

export function TrailerDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const trailerId = params.id;
  const canEdit = useCanMutate();

  const [trailer, setTrailer] = useState<Trailer | null>(null);
  const [maintenance, setMaintenance] = useState<MaintenanceService[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TrailerDetailTabId>("overview");
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [trailerRes, maintenanceRes, alertsRes] = await Promise.all([
        fetch(`/api/trailers/${trailerId}`, { cache: "no-store" }),
        fetch("/api/maintenance", { cache: "no-store" }),
        fetch("/api/alerts", { cache: "no-store" }),
      ]);

      if (trailerRes.status === 404) {
        setNotFound(true);
        return;
      }
      if (!trailerRes.ok) throw new Error("Failed to load trailer");
      if (!maintenanceRes.ok) throw new Error("Failed to load maintenance");
      if (!alertsRes.ok) throw new Error("Failed to load alerts");

      const trailerData = (await trailerRes.json()) as { trailer: Trailer };
      const maintenanceData = (await maintenanceRes.json()) as {
        services: MaintenanceService[];
      };
      const alertsData = (await alertsRes.json()) as { alerts: SystemAlert[] };

      setTrailer(trailerData.trailer);
      setMaintenance(maintenanceData.services);
      setAlerts(alertsData.alerts);
      setNotFound(false);
      setError(null);
    } catch {
      setError("Could not load trailer details. Try again.");
    } finally {
      setLoading(false);
    }
  }, [trailerId]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const trailerServices = useMemo(
    () =>
      trailer
        ? maintenanceForTrailer(maintenance, trailer.trailerNumber)
        : [],
    [maintenance, trailer]
  );

  const trailerAlerts = useMemo(
    () =>
      trailer ? alertsForTrailer(alerts, trailer.trailerNumber) : [],
    [alerts, trailer]
  );

  const meta = useMemo(
    () => (trailer ? buildTrailerDetailMeta(trailer, trailerServices) : null),
    [trailer, trailerServices]
  );

  async function handleSave(data: TrailerFormData) {
    if (!trailer) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/trailers/${trailer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        throw new Error(err.error ?? "Update failed");
      }
      const { trailer: updated } = (await res.json()) as { trailer: Trailer };
      setTrailer(updated);
      setModalOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-16 text-sm text-[#71767b]">
        <Loader2 className="size-4 animate-spin text-white" />
        Loading trailer…
      </div>
    );
  }

  if (notFound || !trailer || !meta) {
    return (
      <div className="space-y-4 py-16 text-center">
        <p className="text-white">Trailer not found.</p>
        <Link
          href="/trailers"
          className="inline-flex h-9 items-center justify-center rounded-none border border-[#2f3336] px-4 text-sm text-white hover:bg-[#16181c]"
        >
          Back to Trailers
        </Link>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-1 flex-col gap-0">
      <div className="flex flex-col gap-4 border-b border-[#2f3336] pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/trailers"
            className="inline-flex h-9 items-center gap-2 text-[#71767b] hover:text-white"
          >
            <ArrowLeft strokeWidth={1.75} />
            Back to Trailers
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canEdit ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                className="inline-flex h-9 items-center gap-2 rounded-none border border-[#2f3336] bg-[#16181c] px-3 text-sm text-white hover:bg-[#080808]"
              >
                Actions
                <ChevronDown className="size-4 text-[#71767b]" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="rounded-none border-[#2f3336] bg-black text-white">
                <DropdownMenuItem
                  className="rounded-none focus:bg-[#16181c] focus:text-white"
                  onClick={() => setModalOpen(true)}
                >
                  <Pencil strokeWidth={1.75} />
                  Edit trailer
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="rounded-none focus:bg-[#16181c] focus:text-white"
                  onClick={() => router.push("/movements")}
                >
                  View movements
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="h-9 rounded-none border-[#2f3336] bg-[#16181c] text-sm text-white hover:bg-[#080808]"
              onClick={() => router.push("/movements")}
            >
              View movements
            </Button>
          )}
          <PageHeaderActions />
        </div>
      </div>

      {error && (
        <Alert
          variant="destructive"
          className="mt-6 border-[#f4212e]/30 bg-[#f4212e]/10"
        >
          <AlertCircle className="text-white" />
          <AlertTitle className="text-white">Error</AlertTitle>
          <AlertDescription className="text-[#e7e9ea]">{error}</AlertDescription>
          <AlertAction>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
              onClick={() => setError(null)}
            >
              Dismiss
            </Button>
          </AlertAction>
        </Alert>
      )}

      <div className="mt-6">
        <TrailerDetailSummary trailer={trailer} meta={meta} />
      </div>

      <div className="mt-6 flex border-b border-[#2f3336]">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "border-b-2 px-4 py-3 text-sm font-medium transition-colors",
              tab === id
                ? "border-[#1d9bf0] text-white"
                : "border-transparent text-[#71767b] hover:text-white"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "overview" && (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
            <div className="space-y-6">
              <TrailerDetailCurrentMovement trailer={trailer} />
              <TrailerDetailMovementHistory trailer={trailer} />
              <TrailerDetailDocuments trailer={trailer} compact />
            </div>
            <TrailerDetailAside
              trailer={trailer}
              meta={meta}
              services={trailerServices}
              alerts={trailerAlerts}
            />
          </div>
        )}

        {tab === "movements" && (
          <div className="space-y-6">
            <TrailerDetailCurrentMovement trailer={trailer} />
            <TrailerDetailMovementHistory trailer={trailer} />
          </div>
        )}

        {tab === "maintenance" && (
          <TrailerDetailCard title="Maintenance Records">
            {trailerServices.length === 0 ? (
              <p className="text-sm text-[#71767b]">
                No maintenance records for this trailer.
              </p>
            ) : (
              <Table className="rounded-none">
                <TableHeader>
                  <TableRow className="border-[#2f3336] hover:bg-transparent">
                    <TableHead className="text-xs font-normal text-[#71767b]">
                      Due Date
                    </TableHead>
                    <TableHead className="text-xs font-normal text-[#71767b]">
                      Service Type
                    </TableHead>
                    <TableHead className="text-xs font-normal text-[#71767b]">
                      Status
                    </TableHead>
                    <TableHead className="text-xs font-normal text-[#71767b]">
                      Technician
                    </TableHead>
                    <TableHead className="text-xs font-normal text-[#71767b]">
                      Cost
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trailerServices.map((service) => (
                    <TableRow
                      key={service.id}
                      className="border-[#2f3336] hover:bg-[#080808]"
                    >
                      <TableCell className="text-sm text-[#e7e9ea]">
                        {formatMaintenanceDueDate(service.dueDate)}
                      </TableCell>
                      <TableCell className="text-sm text-white">
                        {MAINTENANCE_SERVICE_TYPE_LABELS[service.serviceType]}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex rounded-none px-2 py-0.5 text-xs font-medium ${MAINTENANCE_STATUS_CLASS[service.status]}`}
                        >
                          {MAINTENANCE_SERVICE_STATUS_LABELS[service.status]}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-[#71767b]">
                        {service.technician || "—"}
                      </TableCell>
                      <TableCell className="text-sm text-[#71767b] tabular-nums">
                        ${service.cost.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TrailerDetailCard>
        )}

        {tab === "documents" && <TrailerDetailDocuments trailer={trailer} />}

        {tab === "alerts" && (
          <TrailerDetailCard title="Alerts">
            {trailerAlerts.length === 0 ? (
              <p className="text-sm text-[#71767b]">
                No alerts linked to this trailer.
              </p>
            ) : (
              <ul className="space-y-3">
                {trailerAlerts.map((alert) => (
                  <li
                    key={alert.id}
                    className="flex flex-wrap items-start justify-between gap-3 border border-[#2f3336] bg-[#080808] p-4"
                  >
                    <div>
                      <p className="text-sm text-white">{alert.message}</p>
                      <p className="mt-2 text-xs text-[#71767b]">
                        {formatRelativeTime(alert.createdAt)} ·{" "}
                        {alert.assignedTo || "Unassigned"}
                      </p>
                    </div>
                    <AlertSeverityBadge severity={alert.severity} />
                  </li>
                ))}
              </ul>
            )}
          </TrailerDetailCard>
        )}

        {tab === "history" && (
          <TrailerDetailCard title="History">
            <ul className="space-y-4">
              {trailerHistoryEvents(trailer).map((event) => (
                <li
                  key={event.id}
                  className="border-l-2 border-[#2f3336] pl-4"
                >
                  <p className="text-sm font-medium text-white">{event.label}</p>
                  <p className="mt-1 text-sm text-[#71767b]">{event.detail}</p>
                  <p className="mt-1 text-xs text-[#71767b]">
                    {formatFullTimestamp(event.at)}
                  </p>
                </li>
              ))}
            </ul>
          </TrailerDetailCard>
        )}
      </div>

      {canEdit && (
        <TrailerModal
          open={modalOpen}
          trailer={trailer}
          saving={saving}
          onClose={() => {
            if (!saving) setModalOpen(false);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
