import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { UsersPage } from "@/components/users-page";

function UsersFallback() {
  return (
    <div className="flex items-center gap-2 py-16 text-sm text-[#71767b]">
      <Loader2 className="size-4 animate-spin text-white" />
      Loading users…
    </div>
  );
}

export default function UsersRoute() {
  return (
    <AppShell>
      <Suspense fallback={<UsersFallback />}>
        <UsersPage />
      </Suspense>
    </AppShell>
  );
}
