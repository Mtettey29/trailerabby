import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { TrailerDetailPage } from "@/components/trailer-detail-page";

function TrailerDetailFallback() {
  return (
    <div className="flex items-center gap-2 py-16 text-sm text-[#71767b]">
      <Loader2 className="size-4 animate-spin text-white" />
      Loading trailer…
    </div>
  );
}

export default function TrailerDetailRoute() {
  return (
    <AppShell>
      <Suspense fallback={<TrailerDetailFallback />}>
        <TrailerDetailPage />
      </Suspense>
    </AppShell>
  );
}
