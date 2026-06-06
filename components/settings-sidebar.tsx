"use client";

import {
  ArrowLeftRight,
  Bell,
  Building2,
  FileText,
  Plug,
  Shield,
  Truck,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { SettingsSectionId } from "@/lib/settings-display";
import { cn } from "@/lib/utils";

const SECTIONS: {
  id: SettingsSectionId;
  title: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    id: "company",
    title: "Company Settings",
    description: "Manage company profile and preferences",
    icon: Building2,
  },
  {
    id: "trailers",
    title: "Trailer Settings",
    description: "Configure trailer types, status, and fields",
    icon: Truck,
  },
  {
    id: "movements",
    title: "Movement Settings",
    description: "Manage movement types, workflows, and statuses",
    icon: ArrowLeftRight,
  },
  {
    id: "maintenance",
    title: "Maintenance Settings",
    description: "Service intervals, alerts, and templates",
    icon: Wrench,
  },
  {
    id: "notifications",
    title: "Notifications",
    description: "Email, SMS, and push notification settings",
    icon: Bell,
  },
  {
    id: "integrations",
    title: "Integrations",
    description: "Connect with third-party systems and services",
    icon: Plug,
  },
  {
    id: "security",
    title: "Security",
    description: "Clerk sign-in and administrator overview links",
    icon: Shield,
  },
  {
    id: "audit",
    title: "Audit Logs",
    description: "View system activity and user actions",
    icon: FileText,
  },
];

interface SettingsSidebarProps {
  active: SettingsSectionId;
  onChange: (section: SettingsSectionId) => void;
}

export function SettingsSidebar({ active, onChange }: SettingsSidebarProps) {
  return (
    <nav className="w-full shrink-0 border border-[#2f3336] bg-black lg:w-72">
      <ul className="divide-y divide-[#2f3336]">
        {SECTIONS.map(({ id, title, description, icon: Icon }) => {
          const isActive = active === id;
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => onChange(id)}
                className={cn(
                  "flex w-full items-start gap-3 px-4 py-4 text-left transition-colors",
                  isActive
                    ? "bg-[#080808] text-white"
                    : "text-[#e7e9ea] hover:bg-[#080808]"
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-none border",
                    isActive
                      ? "border-[#1d9bf0]/30 bg-[#1d9bf0]/10 text-[#1d9bf0]"
                      : "border-[#2f3336] bg-[#16181c] text-[#71767b]"
                  )}
                >
                  <Icon className="size-4" strokeWidth={1.75} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium">{title}</span>
                  <span className="mt-1 block text-xs text-[#71767b]">
                    {description}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
