import Image from "next/image";
import type React from "react";
import { BRAND_LOGO_URL, BRAND_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: "h-6",
  md: "h-8",
  lg: "h-14",
} as const;

type LogoProps = React.ComponentProps<"div"> & {
  size?: keyof typeof sizeClasses;
};

export function Logo({ className, size = "md", ...props }: LogoProps) {
  const heightClass = sizeClasses[size];

  return (
    <div
      className={cn("flex shrink-0 items-center", className)}
      {...props}
    >
      <Image
        src={BRAND_LOGO_URL}
        alt={BRAND_NAME}
        width={320}
        height={120}
        unoptimized
        className={cn("w-auto object-contain", heightClass)}
        priority={size === "lg"}
      />
    </div>
  );
}
