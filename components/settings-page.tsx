"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { SettingsCompanyPanel } from "@/components/settings-company-panel";
import { SettingsPlaceholderPanel } from "@/components/settings-placeholder-panel";
import { SettingsSecurityPanel } from "@/components/settings-security-panel";
import { SettingsSidebar } from "@/components/settings-sidebar";
import { hasCompanyChanges } from "@/lib/settings-display";
import type { SettingsSectionId } from "@/lib/settings-display";
import type { AppSettings, CompanySettings } from "@/lib/types";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const PLACEHOLDER_COPY: Record<
  Exclude<SettingsSectionId, "company" | "security">,
  { title: string; description: string }
> = {
  trailers: {
    title: "Trailer Settings",
    description:
      "Configure trailer types, default statuses, and custom fields for your fleet.",
  },
  movements: {
    title: "Movement Settings",
    description:
      "Manage movement types, workflows, and status transitions.",
  },
  maintenance: {
    title: "Maintenance Settings",
    description:
      "Set service intervals, alert thresholds, and maintenance templates.",
  },
  notifications: {
    title: "Notification Settings",
    description:
      "Configure email, SMS, and push notification delivery preferences.",
  },
  integrations: {
    title: "Integrations",
    description:
      "Connect third-party systems such as ELD providers and accounting tools.",
  },
  audit: {
    title: "Audit Logs",
    description: "Review system activity and user actions across the platform.",
  },
};

export function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [draft, setDraft] = useState<CompanySettings | null>(null);
  const [section, setSection] = useState<SettingsSectionId>("company");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const isDirty = useMemo(() => {
    if (!settings || !draft) return false;
    return hasCompanyChanges(settings.company, draft);
  }, [settings, draft]);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/settings", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load settings");
      const data = (await res.json()) as { settings: AppSettings };
      setSettings(data.settings);
      setDraft(data.settings.company);
      setError(null);
    } catch {
      setError("Could not load settings. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSettings();
  }, [fetchSettings]);

  async function handleSave() {
    if (!draft) return;
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company: draft }),
      });
      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        throw new Error(err.error ?? "Save failed");
      }
      const data = (await res.json()) as { settings: AppSettings };
      setSettings(data.settings);
      setDraft(data.settings.company);
      setSaved(true);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex w-full flex-1 flex-col gap-0">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <PageHeader
          title="Settings"
          subtitle="Manage company settings and system preferences."
        />
        <Button
          type="button"
          className="h-9 shrink-0 rounded-none bg-[#1d9bf0] px-4 font-medium text-white hover:bg-[#1a8cd8] disabled:opacity-50 print:hidden"
          onClick={() => void handleSave()}
          disabled={!isDirty || saving || loading}
        >
          {saving && <Loader2 className="animate-spin" />}
          Save Changes
        </Button>
      </div>

      {error && (
        <Alert
          variant="destructive"
          className="mt-6 border-[#f4212e]/30 bg-[#f4212e]/10"
        >
          <AlertCircle className="text-white" />
          <AlertTitle className="text-white">Error</AlertTitle>
          <AlertDescription className="text-[#e7e9ea]">{error}</AlertDescription>
          <AlertAction>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
              onClick={() => setError(null)}
            >
              Dismiss
            </Button>
          </AlertAction>
        </Alert>
      )}

      {saved && !error && (
        <Alert className="mt-6 border-[#00ba7c]/30 bg-[#00ba7c]/10">
          <AlertTitle className="text-white">Saved</AlertTitle>
          <AlertDescription className="text-[#e7e9ea]">
            Your settings have been updated.
          </AlertDescription>
          <AlertAction>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
              onClick={() => setSaved(false)}
            >
              Dismiss
            </Button>
          </AlertAction>
        </Alert>
      )}

      {loading ? (
        <div className="flex items-center gap-2 py-16 text-sm text-[#71767b]">
          <Loader2 className="size-4 animate-spin text-white" />
          Loading settings…
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start">
          <SettingsSidebar active={section} onChange={setSection} />

          <div className="min-w-0 flex-1 border border-[#2f3336] bg-black">
            {section === "company" && draft ? (
              <SettingsCompanyPanel
                company={draft}
                onChange={setDraft}
              />
            ) : section === "security" ? (
              <SettingsSecurityPanel />
            ) : section !== "company" ? (
              <SettingsPlaceholderPanel
                title={PLACEHOLDER_COPY[section].title}
                description={PLACEHOLDER_COPY[section].description}
              />
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
