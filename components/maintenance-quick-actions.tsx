"use client";

import Link from "next/link";
import {
  CalendarPlus,
  ClipboardList,
  FileUp,
  Wrench,
} from "lucide-react";
import { PanelCard } from "@/components/panel-card";
import { Button } from "@/components/ui/button";

interface MaintenanceQuickActionsProps {
  onScheduleService: () => void;
}

export function MaintenanceQuickActions({
  onScheduleService,
}: MaintenanceQuickActionsProps) {
  const actions: Array<{
    label: string;
    icon: typeof CalendarPlus;
    onClick?: () => void;
    disabled?: boolean;
  }> = [
    {
      label: "Schedule service",
      icon: CalendarPlus,
      onClick: onScheduleService,
    },
    {
      label: "Create work order",
      icon: ClipboardList,
      onClick: onScheduleService,
    },
    {
      label: "Record maintenance",
      icon: Wrench,
      onClick: onScheduleService,
    },
    {
      label: "Upload inspection",
      icon: FileUp,
      disabled: true,
    },
  ];

  return (
    <PanelCard title="Quick actions" bodyClassName="p-4">
      <div className="grid grid-cols-1 gap-2">
        {actions.map(({ label, icon: Icon, onClick, disabled }) => (
          <Button
            key={label}
            type="button"
            variant="outline"
            disabled={disabled}
            className="h-auto justify-start gap-3 rounded-none border-[#2f3336] bg-[#16181c] px-3 py-3 text-sm text-white hover:bg-[#080808] hover:text-white"
            onClick={onClick}
          >
            <Icon className="size-4 shrink-0" strokeWidth={1.75} />
            {label}
          </Button>
        ))}
      </div>
      <div className="mt-3 border-t border-[#2f3336] pt-3">
        <Link
          href="/maintenance?tab=work_orders"
          className="text-xs text-[#1d9bf0] hover:underline"
        >
          View all work orders →
        </Link>
      </div>
    </PanelCard>
  );
}
