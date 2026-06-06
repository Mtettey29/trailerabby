import {
  DRIVER_STATUS_CLASS,
} from "@/lib/driver-display";
import type { DriverStatus } from "@/lib/types";
import { DRIVER_STATUS_LABELS } from "@/lib/types";

const BADGE_BASE =
  "inline-flex items-center rounded-none px-2 py-0.5 text-xs font-medium";

export function DriverStatusBadge({ status }: { status: DriverStatus }) {
  return (
    <span className={`${BADGE_BASE} ${DRIVER_STATUS_CLASS[status]}`}>
      {DRIVER_STATUS_LABELS[status]}
    </span>
  );
}
