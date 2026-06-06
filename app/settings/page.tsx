import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { SettingsPage } from "@/components/settings-page";

function SettingsFallback() {
  return (
    <div className="flex items-center gap-2 py-16 text-sm text-[#71767b]">
      <Loader2 className="size-4 animate-spin text-white" />
      Loading settings…
    </div>
  );
}

export default function SettingsRoute() {
  return (
    <AppShell>
      <Suspense fallback={<SettingsFallback />}>
        <SettingsPage />
      </Suspense>
    </AppShell>
  );
}
