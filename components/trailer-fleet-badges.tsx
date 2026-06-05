import type { FleetDisplayStatus, TrailerType } from "@/lib/trailer-display";
import {
  FLEET_STATUS_CLASS,
  FLEET_STATUS_LABELS,
} from "@/lib/trailer-display";

const BADGE_BASE =
  "inline-flex items-center rounded-none px-2 py-0.5 text-xs font-medium";

export function FleetStatusBadge({ status }: { status: FleetDisplayStatus }) {
  return (
    <span className={`${BADGE_BASE} ${FLEET_STATUS_CLASS[status]}`}>
      {FLEET_STATUS_LABELS[status]}
    </span>
  );
}

export function TrailerTypeBadge({ type }: { type: TrailerType }) {
  return (
    <span className={`${BADGE_BASE} border border-[#2f3336] bg-[#16181c] text-[#e7e9ea]`}>
      {type}
    </span>
  );
}
