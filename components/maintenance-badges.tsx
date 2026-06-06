import {
  MAINTENANCE_PRIORITY_CLASS,
  MAINTENANCE_STATUS_CLASS,
} from "@/lib/maintenance-display";
import type {
  MaintenancePriority,
  MaintenanceServiceStatus,
} from "@/lib/types";
import {
  MAINTENANCE_PRIORITY_LABELS,
  MAINTENANCE_SERVICE_STATUS_LABELS,
} from "@/lib/types";

const BADGE_BASE =
  "inline-flex items-center rounded-none px-2 py-0.5 text-xs font-medium";

export function MaintenanceStatusBadge({
  status,
}: {
  status: MaintenanceServiceStatus;
}) {
  return (
    <span className={`${BADGE_BASE} ${MAINTENANCE_STATUS_CLASS[status]}`}>
      {MAINTENANCE_SERVICE_STATUS_LABELS[status]}
    </span>
  );
}

export function MaintenancePriorityLabel({
  priority,
}: {
  priority: MaintenancePriority;
}) {
  return (
    <span
      className={`text-sm font-medium ${MAINTENANCE_PRIORITY_CLASS[priority]}`}
    >
      {MAINTENANCE_PRIORITY_LABELS[priority]}
    </span>
  );
}
