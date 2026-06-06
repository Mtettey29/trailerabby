import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface SettingsFieldProps {
  label: string;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}

export function SettingsField({
  label,
  htmlFor,
  className,
  children,
}: SettingsFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={htmlFor} className="text-sm text-[#e7e9ea]">
        {label}
      </Label>
      {children}
    </div>
  );
}

export function SettingsSectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="border-b border-[#2f3336] pb-3 text-base font-medium text-white">
      {children}
    </h2>
  );
}

export const settingsInputClass =
  "rounded-none border-[#2f3336] bg-[#16181c] text-white placeholder:text-[#71767b]";

export const settingsSelectTriggerClass =
  "rounded-none border-[#2f3336] bg-[#16181c] text-white";
