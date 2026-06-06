import { Clock, Plus } from "lucide-react";
import type { Trailer, TrailerStatus } from "@/lib/types";
import { STATUS_LABELS, STATUS_SECTION_IDS, STATUS_SECTION_TITLES } from "@/lib/types";
import { formatFullTimestamp, formatRelativeTime } from "@/lib/format";
import { STATUS_ICONS } from "@/lib/status-ui";
import { Button } from "@/components/ui/button";
import { TrailerTable } from "./TrailerTable";

interface TrailerSectionProps {
  status: TrailerStatus;
  trailers: Trailer[];
  onEdit: (trailer: Trailer) => void;
  onAdd?: (status: TrailerStatus) => void;
}

export function TrailerSection({
  status,
  trailers,
  onEdit,
  onAdd,
}: TrailerSectionProps) {
  const sectionTrailers = trailers.filter((t) => t.status === status);
  const Icon = STATUS_ICONS[status];
  const sectionId = STATUS_SECTION_IDS[status];
  const latestUpdate = sectionTrailers.reduce<string | null>((latest, t) => {
    if (!latest || t.updatedAt > latest) return t.updatedAt;
    return latest;
  }, null);

  return (
    <section id={sectionId} className="scroll-mt-16">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-0.5">
        <h2 className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[#71767b]">
          <Icon className="size-3.5 text-white" strokeWidth={1.75} />
          {STATUS_SECTION_TITLES[status]}
        </h2>
        <div className="flex items-center gap-3">
          {latestUpdate && (
            <span
              className="inline-flex items-center gap-1.5 text-xs text-[#71767b]"
              title={formatFullTimestamp(latestUpdate)}
            >
              <Clock className="size-3 text-white" strokeWidth={1.75} />
              Section updated {formatRelativeTime(latestUpdate)}
            </span>
          )}
          <span className="text-xs tabular-nums text-[#71767b]">
            {sectionTrailers.length}
          </span>
        </div>
      </div>
      <div className="overflow-hidden rounded-none border border-[#2f3336] bg-black">
        <TrailerTable
          trailers={sectionTrailers}
          onEdit={onEdit}
          readOnly={!onAdd}
        />
        {onAdd && (
          <div className="border-t border-[#2f3336] p-2 print:hidden">
            <Button
              type="button"
              variant="ghost"
              className="h-9 w-full justify-start gap-2 rounded-lg border border-dashed border-[#2f3336] text-sm text-[#71767b] hover:bg-[#16181c] hover:text-white"
              onClick={() => onAdd(status)}
            >
              <Plus className="size-4 text-white" strokeWidth={1.75} />
              Add {STATUS_LABELS[status].toLowerCase()} trailer
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
