import { Truck } from "lucide-react";
import type React from "react";
import { cn } from "@/lib/utils";

export const LogoIcon = (props: React.ComponentProps<typeof Truck>) => (
  <Truck strokeWidth={1.75} {...props} />
);

export const Logo = ({
  className,
  ...props
}: React.ComponentProps<"div">) => (
  <div className={cn("flex items-center gap-2 text-white", className)} {...props}>
    <Truck className="size-3.5 shrink-0" strokeWidth={1.75} />
    <span className="text-xs font-bold tracking-tight">Trailer Abby</span>
  </div>
);
