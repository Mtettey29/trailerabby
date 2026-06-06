import {
  Eye,
  Shield,
  Truck,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { AppUser } from "@/lib/types";
import { userStats } from "@/lib/user-display";

const CARDS: {
  key: keyof ReturnType<typeof userStats>;
  pctKey?: keyof ReturnType<typeof userStats>;
  label: string;
  sublabel?: string;
  icon: LucideIcon;
  accent: { bg: string; icon: string };
}[] = [
  {
    key: "total",
    label: "Total Users",
    sublabel: "All users",
    icon: Users,
    accent: { bg: "bg-[#1d9bf0]/15", icon: "text-[#1d9bf0]" },
  },
  {
    key: "active",
    pctKey: "activePct",
    label: "Active Users",
    icon: Users,
    accent: { bg: "bg-[#00ba7c]/15", icon: "text-[#00ba7c]" },
  },
  {
    key: "administrators",
    pctKey: "administratorsPct",
    label: "Administrators",
    icon: Shield,
    accent: { bg: "bg-[#7856ff]/15", icon: "text-[#c4b5fd]" },
  },
  {
    key: "dispatchers",
    pctKey: "dispatchersPct",
    label: "Dispatchers",
    icon: UserCog,
    accent: { bg: "bg-[#1d9bf0]/15", icon: "text-[#1d9bf0]" },
  },
  {
    key: "drivers",
    pctKey: "driversPct",
    label: "Drivers",
    icon: Truck,
    accent: { bg: "bg-[#00ba7c]/15", icon: "text-[#00ba7c]" },
  },
  {
    key: "viewers",
    pctKey: "viewersPct",
    label: "Viewers",
    icon: Eye,
    accent: { bg: "bg-[#71767b]/15", icon: "text-[#71767b]" },
  },
];

interface UserSummaryProps {
  users: AppUser[];
}

export function UserSummary({ users }: UserSummaryProps) {
  const stats = userStats(users);

  return (
    <div className="grid grid-cols-1 gap-px border border-[#2f3336] bg-[#2f3336] sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {CARDS.map(({ key, pctKey, label, sublabel, icon: Icon, accent }) => (
        <div key={key} className="bg-black p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-[#71767b]">{label}</p>
              <p className="mt-2 text-2xl font-medium tabular-nums text-white">
                {stats[key]}
              </p>
              {pctKey && stats.total > 0 ? (
                <p className="mt-1 text-xs text-[#71767b]">
                  {stats[pctKey]}% of total
                </p>
              ) : sublabel ? (
                <p className="mt-1 text-xs text-[#71767b]">{sublabel}</p>
              ) : null}
            </div>
            <div
              className={`flex size-10 shrink-0 items-center justify-center rounded-none ${accent.bg}`}
            >
              <Icon className={`size-5 ${accent.icon}`} strokeWidth={1.75} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
