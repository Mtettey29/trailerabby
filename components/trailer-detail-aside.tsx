import Link from "next/link";
import {
  AlertTriangle,
  Fuel,
  Lock,
  Thermometer,
} from "lucide-react";
import { AlertSeverityBadge } from "@/components/alert-badges";
import { TrailerDetailCard } from "@/components/trailer-detail-card";
import {
  maintenanceSummaryLines,
  trailerStatusDetails,
} from "@/lib/trailer-detail";
import type { TrailerDetailMeta } from "@/lib/trailer-detail";
import { MAINTENANCE_STATUS_CLASS } from "@/lib/maintenance-display";
import { formatFullTimestamp, formatRelativeTime } from "@/lib/format";
import type { MaintenanceService, SystemAlert, Trailer } from "@/lib/types";

interface TrailerDetailAsideProps {
  trailer: Trailer;
  meta: TrailerDetailMeta;
  services: MaintenanceService[];
  alerts: SystemAlert[];
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-[#71767b]">{label}</span>
      <span className="text-right text-white">{value}</span>
    </div>
  );
}

export function TrailerDetailAside({
  trailer,
  meta,
  services,
  alerts,
}: TrailerDetailAsideProps) {
  const status = trailerStatusDetails(trailer, meta.type);
  const maintenance = maintenanceSummaryLines(trailer, services);
  const openAlerts = alerts.filter((alert) => alert.status === "open");

  return (
    <div className="space-y-6">
      <TrailerDetailCard title="Trailer Status">
        <div className="space-y-3">
          <DetailRow label="Status" value={status.statusLabel} />
          <DetailRow label="Current Location" value={status.location} />
          <DetailRow
            label="Last Update"
            value={formatFullTimestamp(status.lastUpdate)}
          />
          <DetailRow label="Updated By" value={status.updatedBy} />
          <DetailRow
            label="Odometer"
            value={`${status.odometer.toLocaleString()} mi`}
          />
          {status.fuelLevel !== null && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-[#71767b]">
                  <Fuel className="size-4" />
                  Fuel Level
                </span>
                <span className="text-white">{status.fuelLevel}%</span>
              </div>
              <div className="h-2 border border-[#2f3336] bg-[#16181c]">
                <div
                  className="h-full bg-[#1d9bf0]"
                  style={{ width: `${status.fuelLevel}%` }}
                />
              </div>
            </div>
          )}
          <DetailRow
            label="Door Status"
            value={status.doorStatus}
          />
          {status.temperature && (
            <DetailRow
              label="Temperature"
              value={status.temperature}
            />
          )}
          {status.doorStatus === "Locked" && (
            <p className="flex items-center gap-2 text-xs text-[#71767b]">
              <Lock className="size-3.5" />
              Secured for transit
            </p>
          )}
          {status.temperature && (
            <p className="flex items-center gap-2 text-xs text-[#71767b]">
              <Thermometer className="size-3.5" />
              Reefer unit reporting normally
            </p>
          )}
        </div>
      </TrailerDetailCard>

      <TrailerDetailCard
        title="Maintenance Summary"
        action={
          <Link
            href="/maintenance"
            className="text-xs text-[#1d9bf0] hover:underline"
          >
            View
          </Link>
        }
      >
        <div className="space-y-4 text-sm">
          <div>
            <p className="text-[#71767b]">Next Service</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="text-white">{maintenance.nextServiceDate}</span>
              <span
                className={`inline-flex rounded-none px-2 py-0.5 text-xs font-medium ${
                  MAINTENANCE_STATUS_CLASS[maintenance.nextServiceStatus]
                }`}
              >
                {maintenance.nextServiceStatusLabel}
              </span>
            </div>
          </div>
          <DetailRow
            label="Service Type"
            value={maintenance.nextServiceType}
          />
          <DetailRow
            label="Mileage at Next Service"
            value={`${maintenance.mileageAtNextService.toLocaleString()} mi`}
          />
          <DetailRow
            label="Open Work Orders"
            value={String(maintenance.openWorkOrders)}
          />
          <div className="border-t border-[#2f3336] pt-4">
            <p className="text-[#71767b]">Last Service</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="text-white">{maintenance.lastServiceDate}</span>
              <span className="inline-flex rounded-none border border-[#00ba7c]/30 bg-[#00ba7c]/10 px-2 py-0.5 text-xs font-medium text-[#00ba7c]">
                Completed
              </span>
            </div>
            <p className="mt-1 text-xs text-[#71767b]">
              {maintenance.lastServiceType}
            </p>
          </div>
        </div>
      </TrailerDetailCard>

      <TrailerDetailCard
        title="Active Alerts"
        action={
          <Link
            href="/alerts"
            className="text-xs text-[#1d9bf0] hover:underline"
          >
            View all
          </Link>
        }
      >
        {openAlerts.length === 0 ? (
          <p className="text-sm text-[#71767b]">No open alerts for this trailer.</p>
        ) : (
          <ul className="space-y-4">
            {openAlerts.slice(0, 3).map((alert) => (
              <li
                key={alert.id}
                className="border border-[#2f3336] bg-[#080808] p-3"
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    className={`mt-0.5 size-4 shrink-0 ${
                      alert.severity === "critical"
                        ? "text-[#f4212e]"
                        : alert.severity === "warning"
                          ? "text-[#ffad1f]"
                          : "text-[#1d9bf0]"
                    }`}
                    strokeWidth={1.75}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-white">{alert.message}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <AlertSeverityBadge severity={alert.severity} />
                      <span className="text-xs text-[#71767b]">
                        {formatRelativeTime(alert.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </TrailerDetailCard>
    </div>
  );
}
