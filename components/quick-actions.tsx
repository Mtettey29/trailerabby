"use client";

import Link from "next/link";
import {
  ArrowLeftRight,
  FileText,
  MapPin,
  Plus,
} from "lucide-react";
import { PanelCard } from "@/components/panel-card";
import { Button } from "@/components/ui/button";

interface QuickActionsProps {
  onAddTrailer: () => void;
  onGenerateReport: () => void;
}

export function QuickActions({
  onAddTrailer,
  onGenerateReport,
}: QuickActionsProps) {
  const actions = [
    {
      label: "Add movement",
      icon: ArrowLeftRight,
      href: "/movements",
    },
    {
      label: "Add trailer",
      icon: Plus,
      onClick: onAddTrailer,
    },
    {
      label: "Add location",
      icon: MapPin,
      disabled: true,
    },
    {
      label: "Generate report",
      icon: FileText,
      onClick: onGenerateReport,
    },
  ] as const;

  return (
    <PanelCard title="Quick actions" bodyClassName="p-4">
      <div className="grid grid-cols-2 gap-2">
        {actions.map(({ label, icon: Icon, ...rest }) => {
          const className =
            "h-auto flex-col gap-2 rounded-none border-[#2f3336] bg-[#16181c] px-3 py-4 text-xs text-white hover:bg-[#080808] hover:text-white";

          if ("href" in rest && rest.href) {
            return (
              <Button
                key={label}
                variant="outline"
                className={className}
                render={<Link href={rest.href} />}
              >
                <Icon className="text-white" strokeWidth={1.75} />
                {label}
              </Button>
            );
          }

          return (
            <Button
              key={label}
              type="button"
              variant="outline"
              className={className}
              onClick={"onClick" in rest ? rest.onClick : undefined}
              disabled={"disabled" in rest ? rest.disabled : false}
            >
              <Icon className="text-white" strokeWidth={1.75} />
              {label}
            </Button>
          );
        })}
      </div>
    </PanelCard>
  );
}
