"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";
import { UserRoleBadge, UserStatusBadge } from "@/components/user-badges";
import type { AppUser } from "@/lib/types";
import {
  formatUserLastLogin,
  getUserInitials,
} from "@/lib/user-display";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

type SortKey =
  | "name"
  | "role"
  | "email"
  | "phone"
  | "location"
  | "status"
  | "lastLogin";
type SortDir = "asc" | "desc";

interface UsersPageTableProps {
  users: AppUser[];
  selectedId: string | null;
  onSelect: (user: AppUser) => void;
  onEdit: (user: AppUser) => void;
}

export function UsersPageTable({
  users,
  selectedId,
  onSelect,
  onEdit,
}: UsersPageTableProps) {
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const sorted = useMemo(() => {
    return [...users].sort((a, b) => {
      let diff = 0;
      switch (sortKey) {
        case "name":
          diff = a.name.localeCompare(b.name);
          break;
        case "role":
          diff = a.role.localeCompare(b.role);
          break;
        case "email":
          diff = a.email.localeCompare(b.email);
          break;
        case "phone":
          diff = a.phone.localeCompare(b.phone);
          break;
        case "location":
          diff = a.location.localeCompare(b.location);
          break;
        case "status":
          diff = a.status.localeCompare(b.status);
          break;
        case "lastLogin":
          diff =
            new Date(a.lastLoginAt).getTime() -
            new Date(b.lastLoginAt).getTime();
          break;
      }
      return sortDir === "asc" ? diff : -diff;
    });
  }, [users, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const firstUserId = sorted[0]?.id;

  useEffect(() => {
    setPage(1);
  }, [sorted.length, firstUserId]);

  const pageUsers = useMemo(() => {
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * PAGE_SIZE;
    return sorted.slice(start, start + PAGE_SIZE);
  }, [sorted, page, totalPages]);

  const rangeStart = sorted.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, sorted.length);

  function goToPage(next: number) {
    setPage(Math.min(Math.max(1, next), totalPages));
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function SortHeader({
    label,
    column,
  }: {
    label: string;
    column: SortKey;
  }) {
    return (
      <button
        type="button"
        className="inline-flex items-center gap-1 hover:text-white"
        onClick={() => toggleSort(column)}
      >
        {label}
        {sortKey === column &&
          (sortDir === "asc" ? (
            <ArrowUp className="size-3" strokeWidth={1.75} />
          ) : (
            <ArrowDown className="size-3" strokeWidth={1.75} />
          ))}
      </button>
    );
  }

  const pageWindow = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (page <= 3) return [1, 2, 3];
    if (page >= totalPages - 2) {
      return [totalPages - 2, totalPages - 1, totalPages];
    }
    return [page - 1, page, page + 1];
  }, [page, totalPages]);

  return (
    <div className="border border-t-0 border-[#2f3336] bg-black">
      <Table className="rounded-none">
        <TableHeader>
          <TableRow className="border-[#2f3336] bg-[#080808] hover:bg-[#080808]">
            <TableHead className="px-4 text-xs font-normal text-[#71767b]">
              <SortHeader label="Name" column="name" />
            </TableHead>
            <TableHead className="px-4 text-xs font-normal text-[#71767b]">
              <SortHeader label="Role" column="role" />
            </TableHead>
            <TableHead className="hidden px-4 text-xs font-normal text-[#71767b] md:table-cell">
              <SortHeader label="Email" column="email" />
            </TableHead>
            <TableHead className="hidden px-4 text-xs font-normal text-[#71767b] lg:table-cell">
              <SortHeader label="Phone" column="phone" />
            </TableHead>
            <TableHead className="hidden px-4 text-xs font-normal text-[#71767b] xl:table-cell">
              <SortHeader label="Location" column="location" />
            </TableHead>
            <TableHead className="px-4 text-xs font-normal text-[#71767b]">
              <SortHeader label="Status" column="status" />
            </TableHead>
            <TableHead className="hidden px-4 text-xs font-normal text-[#71767b] lg:table-cell">
              <SortHeader label="Last Login" column="lastLogin" />
            </TableHead>
            <TableHead className="w-12 px-4" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageUsers.length === 0 ? (
            <TableRow className="border-[#2f3336] hover:bg-transparent">
              <TableCell
                colSpan={8}
                className="px-4 py-16 text-center text-sm text-[#71767b]"
              >
                No users match your filters.
              </TableCell>
            </TableRow>
          ) : (
            pageUsers.map((user) => (
              <TableRow
                key={user.id}
                className={cn(
                  "cursor-pointer border-[#2f3336] hover:bg-[#080808]",
                  selectedId === user.id && "bg-[#080808]"
                )}
                onClick={() => onSelect(user)}
              >
                <TableCell className="px-4">
                  <div className="flex items-center gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-none border border-[#2f3336] bg-[#16181c] text-xs font-medium text-white">
                      {getUserInitials(user.name)}
                    </span>
                    <span className="text-sm font-medium text-white">
                      {user.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="px-4">
                  <UserRoleBadge role={user.role} />
                </TableCell>
                <TableCell className="hidden px-4 text-sm text-[#71767b] md:table-cell">
                  {user.email}
                </TableCell>
                <TableCell className="hidden px-4 text-sm text-[#71767b] lg:table-cell">
                  {user.phone || "—"}
                </TableCell>
                <TableCell className="hidden px-4 text-sm text-[#71767b] xl:table-cell">
                  {user.location || "—"}
                </TableCell>
                <TableCell className="px-4">
                  <UserStatusBadge status={user.status} />
                </TableCell>
                <TableCell className="hidden px-4 text-sm text-[#e7e9ea] lg:table-cell">
                  {formatUserLastLogin(user.lastLoginAt)}
                </TableCell>
                <TableCell className="px-4">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-[#71767b] hover:bg-[#16181c] hover:text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(user);
                    }}
                    aria-label={`Actions for ${user.name}`}
                  >
                    <MoreHorizontal strokeWidth={1.75} />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#2f3336] px-4 py-3 text-xs text-[#71767b]">
        <span>
          Showing {rangeStart} to {rangeEnd} of {sorted.length} users
        </span>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="rounded-none border-[#2f3336] text-white hover:bg-[#16181c]"
            disabled={page <= 1}
            onClick={() => goToPage(page - 1)}
            aria-label="Previous page"
          >
            <ChevronLeft strokeWidth={1.75} />
          </Button>
          {pageWindow[0] > 1 && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="min-w-8 rounded-none border-[#2f3336] text-white hover:bg-[#16181c]"
                onClick={() => goToPage(1)}
              >
                1
              </Button>
              {pageWindow[0] > 2 && <span className="px-1">…</span>}
            </>
          )}
          {pageWindow.map((pageNum) => (
            <Button
              key={pageNum}
              type="button"
              variant="outline"
              size="sm"
              className={`min-w-8 rounded-none border-[#2f3336] px-2 tabular-nums ${
                pageNum === page
                  ? "border-[#1d9bf0] bg-[#1d9bf0]/10 text-[#1d9bf0]"
                  : "text-white hover:bg-[#16181c]"
              }`}
              onClick={() => goToPage(pageNum)}
            >
              {pageNum}
            </Button>
          ))}
          {pageWindow[pageWindow.length - 1] < totalPages && (
            <>
              {pageWindow[pageWindow.length - 1] < totalPages - 1 && (
                <span className="px-1">…</span>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="min-w-8 rounded-none border-[#2f3336] text-white hover:bg-[#16181c]"
                onClick={() => goToPage(totalPages)}
              >
                {totalPages}
              </Button>
            </>
          )}
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="rounded-none border-[#2f3336] text-white hover:bg-[#16181c]"
            disabled={page >= totalPages}
            onClick={() => goToPage(page + 1)}
            aria-label="Next page"
          >
            <ChevronRight strokeWidth={1.75} />
          </Button>
        </div>
      </div>
    </div>
  );
}
