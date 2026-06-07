"use client";

import { SignOutButton, UserButton } from "@clerk/nextjs";
import { LogOut, UserRound } from "lucide-react";
import { useAppUser } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";

const SIGN_OUT_URL = "/sign-in";

const userButtonAppearance = {
  elements: {
    avatarBox: "size-7 rounded-none",
    userButtonPopoverCard: "rounded-none border border-[#2f3336]",
  },
};

function ClerkUserMenu() {
  return (
    <UserButton appearance={userButtonAppearance}>
      <UserButton.MenuItems>
        <UserButton.Link
          label="Dispatch profile"
          labelIcon={<UserRound className="size-4" strokeWidth={1.75} />}
          href="/users?me=1"
        />
        <UserButton.Action label="manageAccount" />
        <UserButton.Action label="signOut" />
      </UserButton.MenuItems>
    </UserButton>
  );
}

function SignOutControl({
  className,
  showLabel = true,
}: {
  className?: string;
  showLabel?: boolean;
}) {
  return (
    <SignOutButton redirectUrl={SIGN_OUT_URL}>
      <Button
        type="button"
        variant="outline"
        className={
          className ??
          "h-9 rounded-none border-[#2f3336] bg-[#16181c] text-sm text-white hover:bg-[#080808] hover:text-white"
        }
      >
        <LogOut className="text-white" strokeWidth={1.75} />
        {showLabel ? <span>Sign out</span> : null}
      </Button>
    </SignOutButton>
  );
}

export function UserAccountControls({
  layout = "header",
}: {
  layout?: "header" | "sidebar";
}) {
  const { user } = useAppUser();
  const displayName =
    user?.name?.trim() || user?.email?.split("@")[0] || "Account";

  if (layout === "sidebar") {
    return (
      <div className="flex flex-col gap-2 border-t border-[#2f3336] px-2 py-3">
        <div className="flex min-w-0 items-center gap-2 group-data-[collapsible=icon]:justify-center">
          <ClerkUserMenu />
          <span className="min-w-0 truncate text-xs text-[#e7e9ea] group-data-[collapsible=icon]:hidden">
            {displayName}
          </span>
        </div>
        <SignOutControl
          showLabel
          className="h-8 w-full justify-start gap-2 rounded-none border-[#2f3336] bg-[#16181c] text-xs text-white hover:bg-[#080808] hover:text-white group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="hidden max-w-[10rem] truncate text-sm text-[#71767b] sm:inline">
        {displayName}
      </span>
      <div className="flex items-center rounded-none border border-[#2f3336] bg-[#16181c] px-2 py-1">
        <ClerkUserMenu />
      </div>
      <SignOutControl />
    </div>
  );
}
