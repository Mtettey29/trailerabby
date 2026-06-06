import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { DriversPage } from "@/components/drivers-page";

function DriversFallback() {
  return (
    <div className="flex items-center gap-2 py-16 text-sm text-[#71767b]">
      <Loader2 className="size-4 animate-spin text-white" />
      Loading drivers…
    </div>
  );
}

export default function DriversRoute() {
  return (
    <AppShell>
      <Suspense fallback={<DriversFallback />}>
        <DriversPage />
      </Suspense>
    </AppShell>
  );
}
