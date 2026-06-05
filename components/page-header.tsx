"use client";

import { Bell, CalendarRange } from "lucide-react";
import { NavUser } from "@/components/nav-user";
import { Button } from "@/components/ui/button";

function formatWeekRange(date: Date): string {
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

interface PageHeaderProps {
  title: string;
  subtitle: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  const today = new Date();

  return (
    <div className="flex flex-col gap-4 border-b border-[#2f3336] pb-6 lg:flex-row lg:items-start lg:justify-between print:block">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-white print:text-black">
          {title}
        </h1>
        <p className="mt-1 text-sm text-[#71767b] print:text-gray-600">
          {subtitle}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 print:hidden">
        <Button
          type="button"
          variant="outline"
          className="h-9 rounded-none border-[#2f3336] bg-[#16181c] text-sm text-white hover:bg-[#080808] hover:text-white"
          disabled
        >
          <CalendarRange className="text-white" strokeWidth={1.75} />
          {formatWeekRange(today)}
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
        <div className="rounded-none border border-[#2f3336] bg-[#16181c] px-2">
          <NavUser compact />
        </div>
      </div>
    </div>
  );
}
