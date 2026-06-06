"use client";

import { Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAppUser } from "@/components/auth-provider";
import { canAccessPath } from "@/lib/permissions";

export function RoleGate({ children }: { children: React.ReactNode }) {
  const { user, status } = useAppUser();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (status === "forbidden") {
      router.replace("/no-access");
      return;
    }
    if (user && !canAccessPath(user.role, pathname)) {
      router.replace("/");
    }
  }, [status, user, pathname, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-sm text-[#71767b]">
        <Loader2 className="size-4 animate-spin text-white" />
        Loading…
      </div>
    );
  }

  if (status === "forbidden") return null;

  return <>{children}</>;
}
