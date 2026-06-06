import type {
  AlertSeverity,
  AlertStatus,
  AlertType,
  SystemAlert,
} from "./types";
import {
  ALERT_SEVERITY_LABELS,
  ALERT_STATUS_LABELS,
  ALERT_TYPE_LABELS,
} from "./types";

export type AlertPageFilters = {
  search: string;
  severity: AlertSeverity | "all";
  status: AlertStatus | "all";
  type: AlertType | "all";
  relatedTo: string;
};

export const DEFAULT_ALERT_PAGE_FILTERS: AlertPageFilters = {
  search: "",
  severity: "all",
  status: "all",
  type: "all",
  relatedTo: "all",
};

export const ALERT_SEVERITY_CLASS: Record<AlertSeverity, string> = {
  critical: "border border-[#f4212e]/30 bg-[#f4212e]/10 text-[#f4212e]",
  warning: "border border-[#ffad1f]/30 bg-[#ffad1f]/10 text-[#ffad1f]",
  info: "border border-[#1d9bf0]/30 bg-[#1d9bf0]/10 text-[#1d9bf0]",
};

export const ALERT_STATUS_CLASS: Record<AlertStatus, string> = {
  open: "border border-[#f4212e]/30 bg-[#f4212e]/10 text-[#f4212e]",
  resolved: "border border-[#00ba7c]/30 bg-[#00ba7c]/10 text-[#00ba7c]",
};

export const ALERT_SEVERITY_DOT: Record<AlertSeverity, string> = {
  critical: "bg-[#f4212e]",
  warning: "bg-[#ffad1f]",
  info: "bg-[#1d9bf0]",
};

export function alertStats(alerts: SystemAlert[]) {
  const total = alerts.length;
  const critical = alerts.filter((a) => a.severity === "critical").length;
  const warning = alerts.filter((a) => a.severity === "warning").length;
  const info = alerts.filter((a) => a.severity === "info").length;
  const resolved = alerts.filter((a) => a.status === "resolved").length;

  const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);

  return {
    total,
    critical,
    warning,
    info,
    resolved,
    criticalPct: pct(critical),
    warningPct: pct(warning),
    infoPct: pct(info),
  };
}

export function formatAlertTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatAssignee(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "—";
  const parts = trimmed.split(/\s+/);
  if (parts.length < 2) return trimmed;
  return `${parts[0]} ${parts[parts.length - 1].charAt(0).toUpperCase()}.`;
}

export function uniqueRelatedTo(alerts: SystemAlert[]): string[] {
  const values = new Set<string>();
  for (const alert of alerts) {
    const related = alert.relatedTo.trim();
    if (related) values.add(related);
  }
  return [...values].sort();
}

export function applyAlertFilters(
  alerts: SystemAlert[],
  filters: AlertPageFilters
): SystemAlert[] {
  const search = filters.search.trim().toLowerCase();

  return alerts.filter((alert) => {
    if (filters.severity !== "all" && alert.severity !== filters.severity) {
      return false;
    }
    if (filters.status !== "all" && alert.status !== filters.status) {
      return false;
    }
    if (filters.type !== "all" && alert.type !== filters.type) {
      return false;
    }
    if (
      filters.relatedTo !== "all" &&
      alert.relatedTo.trim() !== filters.relatedTo
    ) {
      return false;
    }
    if (!search) return true;

    const haystack = [
      alert.message,
      alert.relatedTo,
      alert.assignedTo,
      ALERT_TYPE_LABELS[alert.type],
      ALERT_SEVERITY_LABELS[alert.severity],
      ALERT_STATUS_LABELS[alert.status],
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(search);
  });
}
