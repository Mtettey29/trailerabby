import { cn } from "@/lib/utils";

interface PanelCardProps {
  id?: string;
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function PanelCard({
  id,
  title,
  action,
  children,
  className,
  bodyClassName,
}: PanelCardProps) {
  return (
    <section
      id={id}
      className={cn(
        "overflow-hidden rounded-none border border-[#2f3336] bg-black",
        className
      )}
    >
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 border-b border-[#2f3336] px-4 py-3">
          {title ? (
            <h2 className="text-sm font-medium text-white">{title}</h2>
          ) : (
            <span />
          )}
          {action}
        </div>
      )}
      <div className={cn(bodyClassName)}>{children}</div>
    </section>
  );
}
