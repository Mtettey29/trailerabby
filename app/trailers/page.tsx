import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { TrailersPage } from "@/components/trailers-page";

function TrailersFallback() {
  return (
    <div className="flex items-center gap-2 py-16 text-sm text-[#71767b]">
      <Loader2 className="size-4 animate-spin text-white" />
      Loading trailers…
    </div>
  );
}

export default function TrailersRoute() {
  return (
    <AppShell>
      <Suspense fallback={<TrailersFallback />}>
        <TrailersPage />
      </Suspense>
    </AppShell>
  );
}
