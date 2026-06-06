import { USER_ROLE_CLASS, USER_STATUS_CLASS } from "@/lib/user-display";
import type { UserRole, UserStatus } from "@/lib/types";
import { USER_ROLE_LABELS, USER_STATUS_LABELS } from "@/lib/types";

const BADGE_BASE =
  "inline-flex items-center rounded-none px-2 py-0.5 text-xs font-medium";

export function UserRoleBadge({ role }: { role: UserRole }) {
  return (
    <span className={`${BADGE_BASE} ${USER_ROLE_CLASS[role]}`}>
      {USER_ROLE_LABELS[role]}
    </span>
  );
}

export function UserStatusBadge({ status }: { status: UserStatus }) {
  return (
    <span className={`${BADGE_BASE} ${USER_STATUS_CLASS[status]}`}>
      {USER_STATUS_LABELS[status]}
    </span>
  );
}
