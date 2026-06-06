import {
  ArrowLeftRight,
  Gauge,
  MapPin,
  Route,
  Truck,
} from "lucide-react";
import { FleetStatusBadge, TrailerTypeBadge } from "@/components/trailer-fleet-badges";
import type { TrailerDetailMeta } from "@/lib/trailer-detail";
import type { Trailer } from "@/lib/types";
import { formatDriverShort } from "@/lib/movements";

interface TrailerDetailSummaryProps {
  trailer: Trailer;
  meta: TrailerDetailMeta;
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-[#71767b]">{label}</p>
      <p className="mt-1 text-sm text-white">{value}</p>
    </div>
  );
}

export function TrailerDetailSummary({
  trailer,
  meta,
}: TrailerDetailSummaryProps) {
  const driver = trailer.driver.trim()
    ? formatDriverShort(trailer.driver)
    : "—";

  return (
    <div className="border border-[#2f3336] bg-black">
      <div className="grid gap-px bg-[#2f3336] lg:grid-cols-[220px_1fr_240px]">
        <div className="flex items-center justify-center bg-[#080808] p-6">
          <div className="flex size-full min-h-40 flex-col items-center justify-center border border-[#2f3336] bg-[#16181c]">
            <Truck className="size-16 text-[#71767b]" strokeWidth={1.25} />
            <p className="mt-3 text-xs text-[#71767b]">{meta.typeLabel}</p>
          </div>
        </div>

        <div className="bg-black p-6">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-mono text-2xl font-semibold text-white">
              {meta.displayId}
            </h1>
            <FleetStatusBadge status={meta.fleetStatus} />
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetaItem label="Type" value={meta.typeLabel} />
            <MetaItem
              label="Status"
              value={
                meta.fleetStatus === "in_transit"
                  ? "In Transit"
                  : meta.fleetStatus === "at_location"
                    ? "At Location"
                    : meta.fleetStatus === "under_maintenance"
                      ? "In Shop"
                      : "Out of Service"
              }
            />
            <MetaItem label="Current Driver" value={driver} />
            <MetaItem label="Current Location" value={meta.currentLocation} />
          </div>

          <div className="mt-6 grid gap-4 border-t border-[#2f3336] pt-6 sm:grid-cols-2 xl:grid-cols-4">
            <MetaItem
              label="Manufacturer"
              value={trailer.manufacturer.trim() || "—"}
            />
            <MetaItem label="VIN" value={meta.vin} />
            <MetaItem label="License Plate" value={meta.licensePlate} />
            <MetaItem
              label="Year"
              value={trailer.vehicleYear > 0 ? String(trailer.vehicleYear) : "—"}
            />
            <MetaItem label="Last Inspection" value={meta.lastInspection} />
            <MetaItem label="Next Service Due" value={meta.nextServiceDue} />
          </div>
        </div>

        <div className="bg-black p-6">
          <p className="text-sm font-medium text-white">Quick Info</p>
          <ul className="mt-4 space-y-4">
            <li className="flex items-start gap-3 text-sm">
              <Gauge className="mt-0.5 size-4 shrink-0 text-[#71767b]" />
              <div>
                <p className="text-[#71767b]">Total Mileage</p>
                <p className="text-white tabular-nums">
                  {meta.totalMileage.toLocaleString()} mi
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3 text-sm">
              <Route className="mt-0.5 size-4 shrink-0 text-[#71767b]" />
              <div>
                <p className="text-[#71767b]">Total Movements</p>
                <p className="text-white tabular-nums">{meta.totalMovements}</p>
              </div>
            </li>
            <li className="flex items-start gap-3 text-sm">
              <ArrowLeftRight className="mt-0.5 size-4 shrink-0 text-[#71767b]" />
              <div>
                <p className="text-[#71767b]">In Service Since</p>
                <p className="text-white">{meta.inServiceSince}</p>
              </div>
            </li>
            <li className="flex items-start gap-3 text-sm">
              <MapPin className="mt-0.5 size-4 shrink-0 text-[#71767b]" />
              <div>
                <p className="text-[#71767b]">Home Location</p>
                <p className="text-white">{meta.homeLocation}</p>
              </div>
            </li>
          </ul>
          <div className="mt-6">
            <TrailerTypeBadge type={meta.type} />
          </div>
        </div>
      </div>
    </div>
  );
}
