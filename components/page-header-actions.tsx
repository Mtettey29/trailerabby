"use client";

import { Bell, CalendarRange } from "lucide-react";
import Link from "next/link";
import { useAppUser } from "@/components/auth-provider";
import { UserAccountControls } from "@/components/user-account-controls";
import { canManageUsers } from "@/lib/permissions";
import { isGuestViewer } from "@/lib/guest-token";
import { Button } from "@/components/ui/button";

export function formatWeekRange(date: Date): string {
  const start = new Date(date);
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diff);

  const end = new Date(start);
  end.setDate(end.getDate() + 6);

  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return `${fmt(start)} – ${fmt(end)}, ${start.getFullYear()}`;
}

export function PageHeaderActions() {
  const { user } = useAppUser();
  const guest = isGuestViewer(user);

  async function handleExitView() {
    await fetch("/api/auth/guest-exit", { method: "POST" });
    window.location.href = "/sign-in";
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="h-9 rounded-none border-[#2f3336] bg-[#16181c] text-sm text-white hover:bg-[#080808] hover:text-white"
        disabled
      >
        <CalendarRange className="text-white" strokeWidth={1.75} />
        {formatWeekRange(new Date())}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-9 rounded-none border-[#2f3336] bg-[#16181c] text-white hover:bg-[#080808] hover:text-white"
        disabled
        aria-label="Notifications"
      >
        <Bell className="text-white" strokeWidth={1.75} />
      </Button>
      {user && canManageUsers(user.role) && (
        <Button
          type="button"
          variant="outline"
          className="h-9 rounded-none border-[#2f3336] bg-[#16181c] text-sm text-white hover:bg-[#080808] hover:text-white"
          render={<Link href="/users" />}
        >
          Dispatch team
        </Button>
      )}
      {guest ? (
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#71767b]">View only</span>
          <Button
            type="button"
            variant="outline"
            className="h-9 rounded-none border-[#2f3336] bg-[#16181c] text-sm text-white hover:bg-[#080808] hover:text-white"
            onClick={() => void handleExitView()}
          >
            Exit view
          </Button>
        </div>
      ) : (
        <UserAccountControls />
      )}
    </>
  );
}
