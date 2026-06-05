import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { TrailerBoard } from "@/components/trailer-board";

function BoardFallback() {
  return (
    <div className="flex items-center gap-2 py-12 text-sm text-[#71767b]">
      <Loader2 className="size-4 animate-spin text-white" />
      Loading board…
    </div>
  );
}

export function Dashboard() {
  return (
    <AppShell>
      <Suspense fallback={<BoardFallback />}>
        <TrailerBoard />
      </Suspense>
    </AppShell>
  );
}
