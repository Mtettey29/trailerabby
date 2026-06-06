"use client";

import Link from "next/link";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import { UsersIcon } from "lucide-react";

export function NavUser({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <Link
        href="/users"
        className="flex h-9 items-center gap-2 rounded-none transition-colors hover:opacity-90"
      >
        <Avatar className="size-6">
          <AvatarFallback className="bg-[#2f3336] text-white">
            <UsersIcon className="size-3" />
          </AvatarFallback>
        </Avatar>
        <span className="text-sm text-[#e7e9ea]">Dispatch team</span>
      </Link>
    );
  }

  return (
    <Link
      href="/users"
      className="flex h-10 items-center gap-2 rounded-none px-2 transition-colors hover:bg-[#080808]"
    >
      <Avatar className="size-5">
        <AvatarFallback className="bg-[#16181c] text-white">
          <UsersIcon className="size-3" />
        </AvatarFallback>
      </Avatar>
      <span className="text-sm font-medium text-[#e7e9ea]">Dispatch team</span>
    </Link>
  );
}
