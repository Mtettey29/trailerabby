import { cn } from "@/lib/utils";

interface TrailerDetailCardProps {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function TrailerDetailCard({
  title,
  action,
  children,
  className,
}: TrailerDetailCardProps) {
  return (
    <section
      className={cn(
        "border border-[#2f3336] bg-black",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-[#2f3336] px-4 py-3">
        <h2 className="text-sm font-medium text-white">{title}</h2>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}
