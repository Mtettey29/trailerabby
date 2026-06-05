"use client";

import { SectionNavLink } from "@/components/section-nav-link";
import { STATUS_LABELS, STATUS_SECTION_IDS, TRAILER_STATUSES } from "@/lib/types";
import { STATUS_ICONS } from "@/lib/status-ui";
import { cn } from "@/lib/utils";

export function SectionNavBar() {
  return (
    <nav
      className="hidden items-center gap-1 md:flex"
      aria-label="Trailer sections"
    >
      {TRAILER_STATUSES.map((status) => {
        const Icon = STATUS_ICONS[status];
        const sectionId = STATUS_SECTION_IDS[status];

        return (
          <SectionNavLink
            key={status}
            href={`/#${sectionId}`}
            sectionId={sectionId}
            className={cn(
              "inline-flex items-center gap-2 px-2 py-1 text-sm text-[#71767b] transition-colors hover:text-white"
            )}
          >
            <Icon className="size-3.5 text-white" strokeWidth={1.75} />
            {STATUS_LABELS[status]}
          </SectionNavLink>
        );
      })}
    </nav>
  );
}
