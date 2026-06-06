import type {
  MaintenancePriority,
  MaintenanceService,
  MaintenanceServiceStatus,
  MaintenanceServiceType,
  Trailer,
} from "./types";
import {
  MAINTENANCE_PRIORITY_LABELS,
  MAINTENANCE_SERVICE_STATUS_LABELS,
  MAINTENANCE_SERVICE_TYPE_LABELS,
} from "./types";

export type MaintenancePageFilters = {
  search: string;
  type: MaintenanceServiceType | "all";
  status: MaintenanceServiceStatus | "all";
  priority: MaintenancePriority | "all";
};

export const DEFAULT_MAINTENANCE_PAGE_FILTERS: MaintenancePageFilters = {
  search: "",
  type: "all",
  status: "all",
  priority: "all",
};

export const MAINTENANCE_STATUS_CLASS: Record<MaintenanceServiceStatus, string> =
  {
    due_soon: "border border-[#ffad1f]/30 bg-[#ffad1f]/10 text-[#ffad1f]",
    overdue: "border border-[#f4212e]/30 bg-[#f4212e]/10 text-[#f4212e]",
    scheduled: "border border-[#1d9bf0]/30 bg-[#1d9bf0]/10 text-[#1d9bf0]",
    completed: "border border-[#00ba7c]/30 bg-[#00ba7c]/10 text-[#00ba7c]",
  };

export const MAINTENANCE_PRIORITY_CLASS: Record<MaintenancePriority, string> =
  {
    high: "text-[#f4212e]",
    medium: "text-[#ffad1f]",
    low: "text-[#00ba7c]",
  };

export const MAINTENANCE_STATUS_DOT: Record<MaintenanceServiceStatus, string> =
  {
    due_soon: "bg-[#ffad1f]",
    overdue: "bg-[#f4212e]",
    scheduled: "bg-[#1d9bf0]",
    completed: "bg-[#00ba7c]",
  };

export type CostCategory =
  | "tires"
  | "brakes"
  | "inspections"
  | "repairs"
  | "other";

export const COST_CATEGORY_LABELS: Record<CostCategory, string> = {
  tires: "Tires",
  brakes: "Brakes",
  inspections: "Inspections",
  repairs: "Repairs",
  other: "Other",
};

export const COST_CATEGORY_COLORS: Record<CostCategory, string> = {
  tires: "#ffad1f",
  brakes: "#f4212e",
  inspections: "#1d9bf0",
  repairs: "#7856ff",
  other: "#71767b",
};

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function serviceCostCategory(type: MaintenanceServiceType): CostCategory {
  switch (type) {
    case "tire_service":
      return "tires";
    case "brake_service":
      return "brakes";
    case "dot_inspection":
    case "annual_inspection":
      return "inspections";
    case "general_repair":
      return "repairs";
    default:
      return "other";
  }
}

export function maintenanceStats(
  services: MaintenanceService[],
  trailers: Trailer[]
) {
  const today = startOfDay(new Date());
  const weekEnd = new Date(today);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const dueThisWeek = services.filter((service) => {
    if (service.status === "completed") return false;
    const due = startOfDay(new Date(service.dueDate));
    return due >= today && due <= weekEnd;
  }).length;

  const overdue = services.filter((service) => service.status === "overdue").length;
  const inService = trailers.filter((t) => t.status === "in_shop").length;
  const totalCost = services.reduce((sum, service) => sum + service.cost, 0);
  const total = trailers.length;

  const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);

  return {
    totalTrailers: total,
    dueThisWeek,
    overdue,
    inService,
    maintenanceCost: totalCost,
    dueThisWeekPct: pct(dueThisWeek),
    overduePct: pct(overdue),
    inServicePct: pct(inService),
  };
}

export function maintenanceCostBreakdown(services: MaintenanceService[]) {
  const totals: Record<CostCategory, number> = {
    tires: 0,
    brakes: 0,
    inspections: 0,
    repairs: 0,
    other: 0,
  };

  for (const service of services) {
    const category = serviceCostCategory(service.serviceType);
    totals[category] += service.cost;
  }

  const total = Object.values(totals).reduce((sum, value) => sum + value, 0);

  return (Object.keys(totals) as CostCategory[]).map((category) => ({
    category,
    label: COST_CATEGORY_LABELS[category],
    amount: totals[category],
    color: COST_CATEGORY_COLORS[category],
    pct: total > 0 ? Math.round((totals[category] / total) * 100) : 0,
  }));
}

export function formatMaintenanceDueDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTechnician(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "—";
  const parts = trimmed.split(/\s+/);
  if (parts.length < 2) return trimmed;
  return `${parts[0]} ${parts[parts.length - 1].charAt(0).toUpperCase()}.`;
}

export function applyMaintenanceFilters(
  services: MaintenanceService[],
  filters: MaintenancePageFilters
): MaintenanceService[] {
  const search = filters.search.trim().toLowerCase();

  return services.filter((service) => {
    if (filters.type !== "all" && service.serviceType !== filters.type) {
      return false;
    }
    if (filters.status !== "all" && service.status !== filters.status) {
      return false;
    }
    if (filters.priority !== "all" && service.priority !== filters.priority) {
      return false;
    }
    if (!search) return true;

    const haystack = [
      service.trailerNumber,
      service.technician,
      service.notes,
      MAINTENANCE_SERVICE_TYPE_LABELS[service.serviceType],
      MAINTENANCE_SERVICE_STATUS_LABELS[service.status],
      MAINTENANCE_PRIORITY_LABELS[service.priority],
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(search);
  });
}

export function servicesForTab(
  services: MaintenanceService[],
  tab: "overview" | "service_schedule" | "work_orders" | "history"
): MaintenanceService[] {
  switch (tab) {
    case "history":
      return services.filter((service) => service.status === "completed");
    case "work_orders":
      return services.filter(
        (service) =>
          service.status === "scheduled" || service.status === "overdue"
      );
    case "service_schedule":
    case "overview":
    default:
      return services.filter((service) => service.status !== "completed");
  }
}
