import {
  ALERT_SEVERITY_CLASS,
  ALERT_STATUS_CLASS,
} from "@/lib/alert-display";
import type { AlertSeverity, AlertStatus } from "@/lib/types";
import {
  ALERT_SEVERITY_LABELS,
  ALERT_STATUS_LABELS,
} from "@/lib/types";

const BADGE_BASE =
  "inline-flex items-center rounded-none px-2 py-0.5 text-xs font-medium";

export function AlertSeverityBadge({
  severity,
}: {
  severity: AlertSeverity;
}) {
  return (
    <span className={`${BADGE_BASE} ${ALERT_SEVERITY_CLASS[severity]}`}>
      {ALERT_SEVERITY_LABELS[severity]}
    </span>
  );
}

export function AlertStatusBadge({ status }: { status: AlertStatus }) {
  return (
    <span className={`${BADGE_BASE} ${ALERT_STATUS_CLASS[status]}`}>
      {ALERT_STATUS_LABELS[status]}
    </span>
  );
}
