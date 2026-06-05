import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { MovementsPage } from "@/components/movements-page";

function MovementsFallback() {
  return (
    <div className="flex items-center gap-2 py-16 text-sm text-[#71767b]">
      <Loader2 className="size-4 animate-spin text-white" />
      Loading movements…
    </div>
  );
}

export default function MovementsRoute() {
  return (
    <AppShell>
      <Suspense fallback={<MovementsFallback />}>
        <MovementsPage />
      </Suspense>
    </AppShell>
  );
}
