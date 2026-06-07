"use client";

import { SignOutButton, UserButton } from "@clerk/nextjs";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppUser } from "@/components/auth-provider";
import { canManageUsers } from "@/lib/permissions";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const SIGN_OUT_URL = "/sign-in";

const userButtonAppearance = {
  elements: {
    avatarBox: "size-7 rounded-none",
    userButtonPopoverCard: "rounded-none border border-[#2f3336]",
    userButtonTrigger: "focus:shadow-none",
  },
};

export function SidebarAccountFooter() {
  const { user } = useAppUser();
  const pathname = usePathname();

  if (!user) return null;

  const displayName =
    user.name?.trim() || user.email?.split("@")[0] || "Account";
  const isAdmin = canManageUsers(user.role);
  const profileHref = isAdmin ? "/users" : "/users?me=1";
  const linkLabel = isAdmin ? "Dispatch team" : displayName;
  const isProfileActive =
    pathname === "/users" || pathname.startsWith("/users/");

  return (
    <div className="flex flex-col gap-3 border-t border-[#2f3336] px-1.5 py-3">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="sm"
            isActive={isProfileActive}
            tooltip={linkLabel}
            className="h-auto min-h-8 gap-2 py-1.5 text-[#e7e9ea] [&_svg]:text-white"
            render={
              <Link
                href={profileHref}
                className="flex min-w-0 flex-1 items-center gap-2"
              />
            }
          >
            <span
              className="flex shrink-0 items-center"
              onClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => event.stopPropagation()}
            >
              <UserButton appearance={userButtonAppearance}>
                <UserButton.MenuItems>
                  <UserButton.Action label="manageAccount" />
                </UserButton.MenuItems>
              </UserButton>
            </span>
            <span className="min-w-0 truncate group-data-[collapsible=icon]:hidden">
              {linkLabel}
            </span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>

      <SignOutButton redirectUrl={SIGN_OUT_URL}>
        <button
          type="button"
          className="flex w-full items-center gap-2 px-2 py-1 text-left text-xs text-[#71767b] transition-colors hover:text-[#e7e9ea] group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
        >
          <LogOut className="size-3.5 shrink-0" strokeWidth={1.75} />
          <span className="group-data-[collapsible=icon]:hidden">Sign out</span>
        </button>
      </SignOutButton>
    </div>
  );
}
