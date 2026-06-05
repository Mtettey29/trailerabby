import {
  ArrowUpRight,
  MapPin,
  RefreshCw,
  Shield,
  Truck,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { TrailerStatus } from "./types";
import { STATUS_LABELS } from "./types";

export const STATUS_ICONS: Record<TrailerStatus, LucideIcon> = {
  outbound: ArrowUpRight,
  onsite: MapPin,
  in_shop: Wrench,
};

export const STATUS_LABEL_CLASS =
  "inline-flex items-center gap-1 text-xs text-[#e7e9ea] [&_svg]:size-3 [&_svg]:text-white";

export function StatusLabel({ status }: { status: TrailerStatus }) {
  const Icon = STATUS_ICONS[status];
  return (
    <span className={STATUS_LABEL_CLASS}>
      <Icon strokeWidth={1.75} />
      {STATUS_LABELS[status]}
    </span>
  );
}

export const SUMMARY_META = [
  {
    key: "total",
    label: "Total Trailers",
    subtitle: "All registered trailers",
    icon: Truck,
  },
  {
    key: "movements_today",
    label: "Movements Today",
    subtitle: null,
    icon: RefreshCw,
  },
  {
    key: "outbound",
    label: "In Transit",
    subtitle: "Currently on the move",
    icon: ArrowUpRight,
  },
  {
    key: "onsite",
    label: "At Location",
    subtitle: "At yards / locations",
    icon: Shield,
  },
  {
    key: "in_shop",
    label: "Under Maintenance",
    subtitle: "Out of service",
    icon: Wrench,
  },
] as const;

export type KpiKey = (typeof SUMMARY_META)[number]["key"];

export const KPI_ACCENT_CLASS: Record<KpiKey, { bg: string; icon: string }> = {
  total: { bg: "bg-[#1d9bf0]/15", icon: "text-[#1d9bf0]" },
  movements_today: { bg: "bg-[#00ba7c]/15", icon: "text-[#00ba7c]" },
  outbound: { bg: "bg-[#7856ff]/15", icon: "text-[#c4b5fd]" },
  onsite: { bg: "bg-[#ffad1f]/15", icon: "text-[#ffad1f]" },
  in_shop: { bg: "bg-[#f4212e]/15", icon: "text-[#f4212e]" },
};
