import type { ClerkLinkStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const LABELS: Record<ClerkLinkStatus, string> = {
  linked: "Clerk linked",
  invited: "Invite pending",
  none: "No Clerk account",
};

const CLASS: Record<ClerkLinkStatus, string> = {
  linked: "border-[#00ba7c]/30 bg-[#00ba7c]/10 text-[#00ba7c]",
  invited: "border-[#ffad1f]/30 bg-[#ffad1f]/10 text-[#ffad1f]",
  none: "border-[#2f3336] bg-[#16181c] text-[#71767b]",
};

export function UserClerkBadge({ status }: { status: ClerkLinkStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-none border px-2 py-0.5 text-xs font-medium",
        CLASS[status]
      )}
    >
      {LABELS[status]}
    </span>
  );
}
