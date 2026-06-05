import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { LocationsPage } from "@/components/locations-page";

function LocationsFallback() {
  return (
    <div className="flex items-center gap-2 py-16 text-sm text-[#71767b]">
      <Loader2 className="size-4 animate-spin text-white" />
      Loading locations…
    </div>
  );
}

export default function LocationsRoute() {
  return (
    <AppShell>
      <Suspense fallback={<LocationsFallback />}>
        <LocationsPage />
      </Suspense>
    </AppShell>
  );
}
