import { getUserInitials } from "@/lib/user-display";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  name: string;
  imageUrl?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASS = {
  sm: "size-8 text-xs",
  md: "size-12 text-sm",
  lg: "size-16 text-base",
} as const;

export function UserAvatar({
  name,
  imageUrl,
  size = "sm",
  className,
}: UserAvatarProps) {
  const sizeClass = SIZE_CLASS[size];

  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt=""
        className={cn(
          "shrink-0 rounded-none border border-[#2f3336] object-cover",
          sizeClass,
          className
        )}
      />
    );
  }

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-none border border-[#2f3336] bg-[#16181c] font-medium text-white",
        sizeClass,
        className
      )}
    >
      {getUserInitials(name)}
    </span>
  );
}
