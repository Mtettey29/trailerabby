"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { PanelCard } from "@/components/panel-card";
import { MAINTENANCE_STATUS_DOT } from "@/lib/maintenance-display";
import type { MaintenanceService } from "@/lib/types";
import { MAINTENANCE_SERVICE_STATUS_LABELS } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MaintenanceCalendarProps {
  services: MaintenanceService[];
}

export function MaintenanceCalendar({ services }: MaintenanceCalendarProps) {
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const days = useMemo(() => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const firstDay = new Date(year, monthIndex, 1).getDay();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

    const cells: Array<{ date: Date | null; key: string }> = [];
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;

    for (let i = 0; i < startOffset; i++) {
      cells.push({ date: null, key: `empty-start-${i}` });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      cells.push({
        date: new Date(year, monthIndex, day),
        key: `${year}-${monthIndex}-${day}`,
      });
    }

    return cells;
  }, [month]);

  const servicesByDay = useMemo(() => {
    const map = new Map<string, MaintenanceService[]>();
    for (const service of services) {
      const date = new Date(service.dueDate);
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      const list = map.get(key) ?? [];
      list.push(service);
      map.set(key, list);
    }
    return map;
  }, [services]);

  const today = new Date();

  function shiftMonth(delta: number) {
    setMonth((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1));
  }

  const monthLabel = month.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <PanelCard title="Maintenance calendar" bodyClassName="p-4">
      <div className="mb-3 flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-[#71767b] hover:text-white"
          onClick={() => shiftMonth(-1)}
          aria-label="Previous month"
        >
          <ChevronLeft strokeWidth={1.75} />
        </Button>
        <span className="text-sm font-medium text-white">{monthLabel}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-[#71767b] hover:text-white"
          onClick={() => shiftMonth(1)}
          aria-label="Next month"
        >
          <ChevronRight strokeWidth={1.75} />
        </Button>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[10px] text-[#71767b]">
        {["M", "T", "W", "T", "F", "S", "S"].map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map(({ date, key }) => {
          if (!date) {
            return <span key={key} className="aspect-square" />;
          }

          const dayKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
          const dayServices = servicesByDay.get(dayKey) ?? [];
          const isToday =
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();

          return (
            <div
              key={key}
              className={cn(
                "flex aspect-square flex-col items-center justify-center rounded-none text-xs",
                isToday && "bg-[#1d9bf0] text-white"
              )}
            >
              <span className={isToday ? "text-white" : "text-[#e7e9ea]"}>
                {date.getDate()}
              </span>
              {dayServices.length > 0 && (
                <div className="mt-0.5 flex gap-0.5">
                  {dayServices.slice(0, 3).map((service) => (
                    <span
                      key={service.id}
                      className={`size-1 rounded-full ${MAINTENANCE_STATUS_DOT[service.status]}`}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <ul className="mt-4 space-y-1.5 border-t border-[#2f3336] pt-3">
        {(
          Object.keys(MAINTENANCE_SERVICE_STATUS_LABELS) as Array<
            keyof typeof MAINTENANCE_SERVICE_STATUS_LABELS
          >
        ).map((status) => (
          <li
            key={status}
            className="flex items-center gap-2 text-[10px] text-[#71767b]"
          >
            <span
              className={`size-2 rounded-full ${MAINTENANCE_STATUS_DOT[status]}`}
            />
            {MAINTENANCE_SERVICE_STATUS_LABELS[status]}
          </li>
        ))}
      </ul>
    </PanelCard>
  );
}
