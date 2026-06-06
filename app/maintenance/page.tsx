import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { MaintenancePage } from "@/components/maintenance-page";

function MaintenanceFallback() {
  return (
    <div className="flex items-center gap-2 py-16 text-sm text-[#71767b]">
      <Loader2 className="size-4 animate-spin text-white" />
      Loading maintenance…
    </div>
  );
}

export default function MaintenanceRoute() {
  return (
    <AppShell>
      <Suspense fallback={<MaintenanceFallback />}>
        <MaintenancePage />
      </Suspense>
    </AppShell>
  );
}
