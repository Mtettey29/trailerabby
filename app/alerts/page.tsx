import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { AlertsPage } from "@/components/alerts-page";

function AlertsFallback() {
  return (
    <div className="flex items-center gap-2 py-16 text-sm text-[#71767b]">
      <Loader2 className="size-4 animate-spin text-white" />
      Loading alerts…
    </div>
  );
}

export default function AlertsRoute() {
  return (
    <AppShell>
      <Suspense fallback={<AlertsFallback />}>
        <AlertsPage />
      </Suspense>
    </AppShell>
  );
}
