import {
  ArrowDown,
  ArrowLeftRight,
  ArrowUpRight,
  CheckCircle,
  Package,
  type LucideIcon,
} from "lucide-react";
import type { TrailerStatus } from "@/lib/types";
import {
  MOVEMENT_TYPE_CLASS,
  MOVEMENT_TYPE_LABELS,
  STATUS_DISPLAY,
  type MovementType,
} from "@/lib/movements";

const MOVEMENT_ICONS: Record<MovementType, LucideIcon> = {
  departed: ArrowUpRight,
  arrived: ArrowDown,
  picked_up: Package,
  delivered: CheckCircle,
  repositioned: ArrowLeftRight,
};

const BADGE_BASE =
  "inline-flex items-center gap-1 rounded-none px-2 py-0.5 text-xs font-medium";

export function MovementTypeBadge({ type }: { type: MovementType }) {
  const Icon = MOVEMENT_ICONS[type];
  return (
    <span className={`${BADGE_BASE} ${MOVEMENT_TYPE_CLASS[type]}`}>
      <Icon className="size-3" strokeWidth={1.75} />
      {MOVEMENT_TYPE_LABELS[type]}
    </span>
  );
}

export function MovementStatusBadge({ status }: { status: TrailerStatus }) {
  const { label, className } = STATUS_DISPLAY[status];
  return (
    <span className={`${BADGE_BASE} ${className}`}>{label}</span>
  );
}
