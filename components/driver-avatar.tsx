import { Minus } from "lucide-react";
import { getDriverAvatarStyle } from "@/lib/driver-avatar";
import { cn } from "@/lib/utils";

interface DriverAvatarProps {
  name: string;
  className?: string;
}

export function DriverAvatar({ name, className }: DriverAvatarProps) {
  const style = getDriverAvatarStyle(name);
  const unassigned = !name.trim();

  return (
    <span
      className={cn(
        "inline-flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-medium",
        style.className,
        className
      )}
      aria-hidden={unassigned}
    >
      {unassigned ? (
        <Minus className="size-3" strokeWidth={2} />
      ) : (
        style.initials
      )}
    </span>
  );
}

interface DriverCellProps {
  name: string;
}

export function DriverCell({ name }: DriverCellProps) {
  const unassigned = !name.trim();

  return (
    <div className="flex items-center gap-2">
      <DriverAvatar name={name} />
      {unassigned ? (
        <span className="italic text-[#71767b]">Unassigned</span>
      ) : (
        <span className="text-[#e7e9ea]">{name}</span>
      )}
    </div>
  );
}
