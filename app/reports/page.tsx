import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ReportsPage } from "@/components/reports-page";

function ReportsFallback() {
  return (
    <div className="flex items-center gap-2 py-16 text-sm text-[#71767b]">
      <Loader2 className="size-4 animate-spin text-white" />
      Loading reports…
    </div>
  );
}

export default function ReportsRoute() {
  return (
    <AppShell>
      <Suspense fallback={<ReportsFallback />}>
        <ReportsPage />
      </Suspense>
    </AppShell>
  );
}
