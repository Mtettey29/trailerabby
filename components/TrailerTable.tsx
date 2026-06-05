import { Clock, MapPin, Pencil, StickyNote, User } from "lucide-react";
import { DriverCell } from "@/components/driver-avatar";
import type { Trailer } from "@/lib/types";
import { formatFullTimestamp, formatRelativeTime } from "@/lib/format";
import { StatusLabel } from "@/lib/status-ui";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TrailerTableProps {
  trailers: Trailer[];
  onEdit: (trailer: Trailer) => void;
}

function HeaderIcon({ icon: Icon, label }: { icon: typeof User; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[#71767b]">
      <Icon className="size-3.5 text-white" strokeWidth={1.75} />
      {label}
    </span>
  );
}

export function TrailerTable({ trailers, onEdit }: TrailerTableProps) {
  return (
    <Table className="w-full rounded-none">
      <TableHeader>
        <TableRow className="border-[#2f3336] hover:bg-transparent">
          <TableHead className="w-[110px] px-4 text-xs font-normal uppercase tracking-wider text-[#71767b]">
            Trailer #
          </TableHead>
          <TableHead className="w-[100px] px-4 text-xs font-normal uppercase tracking-wider text-[#71767b]">
            Status
          </TableHead>
          <TableHead className="w-[160px] px-4">
            <HeaderIcon icon={User} label="Driver" />
          </TableHead>
          <TableHead className="px-4">
            <HeaderIcon icon={MapPin} label="Location" />
          </TableHead>
          <TableHead className="px-4">
            <HeaderIcon icon={StickyNote} label="Notes" />
          </TableHead>
          <TableHead className="w-[120px] px-4">
            <HeaderIcon icon={Clock} label="Updated" />
          </TableHead>
          <TableHead className="w-12 px-4" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {trailers.length === 0 ? (
          <TableRow className="border-[#2f3336] hover:bg-transparent">
            <TableCell
              colSpan={7}
              className="px-4 py-10 text-center text-sm text-[#71767b]"
            >
              No trailers in this category.
            </TableCell>
          </TableRow>
        ) : (
          trailers.map((trailer) => {
            return (
              <TableRow
                key={trailer.id}
                className="cursor-pointer border-[#2f3336] hover:bg-[#080808]"
                onClick={() => onEdit(trailer)}
              >
                <TableCell className="px-4 font-mono text-sm font-medium text-white">
                  {trailer.trailerNumber}
                </TableCell>
                <TableCell className="px-4">
                  <StatusLabel status={trailer.status} />
                </TableCell>
                <TableCell className="px-4">
                  <DriverCell name={trailer.driver} />
                </TableCell>
                <TableCell className="px-4 text-sm text-[#71767b]">
                  {trailer.location || "—"}
                </TableCell>
                <TableCell className="max-w-md truncate px-4 text-sm text-[#71767b]">
                  {trailer.notes || "—"}
                </TableCell>
                <TableCell
                  className="whitespace-nowrap px-4 text-xs text-[#71767b]"
                  title={formatFullTimestamp(trailer.updatedAt)}
                >
                  {formatRelativeTime(trailer.updatedAt)}
                </TableCell>
                <TableCell className="px-4">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-white hover:bg-[#16181c] hover:text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(trailer);
                    }}
                    aria-label={`Edit ${trailer.trailerNumber}`}
                  >
                    <Pencil className="text-white" strokeWidth={1.75} />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}
