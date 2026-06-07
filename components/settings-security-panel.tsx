"use client";

import { useState } from "react";
import { Copy, Link2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

export function SettingsSecurityPanel() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guestUrl, setGuestUrl] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setCopied(false);
    try {
      const res = await fetch("/api/auth/guest-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expiresInDays: 7 }),
      });
      const data = (await res.json()) as {
        url?: string;
        expiresAt?: string;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to generate link");
      }
      setGuestUrl(data.url ?? null);
      setExpiresAt(data.expiresAt ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate link");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!guestUrl) return;
    await navigator.clipboard.writeText(guestUrl);
    setCopied(true);
  }

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-white">Access &amp; security</h2>
      <p className="mt-1 text-sm text-[#71767b]">
        Clerk handles sign-in for dispatch staff. As administrator, generate a
        time-limited overview link to share with anyone — no account required,
        view-only access.
      </p>

      <div className="mt-8 border border-[#2f3336] p-5">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center border border-[#2f3336] bg-[#16181c]">
            <Link2 className="size-4 text-[#1d9bf0]" strokeWidth={1.75} />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-medium text-white">
              Overview link
            </h3>
            <p className="mt-1 text-xs text-[#71767b]">
              Read-only access to the full board — trailers, drivers, locations,
              alerts, maintenance, and reports. Recipients open the link once;
              no Clerk account needed. Expires after 7 days.
            </p>
            <Button
              type="button"
              className="mt-4 h-9 rounded-none bg-[#1d9bf0] text-white hover:bg-[#1a8cd8]"
              onClick={() => void handleGenerate()}
              disabled={loading}
            >
              {loading && <Loader2 className="animate-spin" />}
              Generate overview link
            </Button>
          </div>
        </div>

        {error && (
          <Alert
            variant="destructive"
            className="mt-4 border-[#f4212e]/30 bg-[#f4212e]/10"
          >
            <AlertTitle className="text-white">Error</AlertTitle>
            <AlertDescription className="text-[#e7e9ea]">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {guestUrl && (
          <div className="mt-4 space-y-2 border border-[#2f3336] bg-[#080808] p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-[#71767b]">
              Share this URL
            </p>
            <p className="break-all text-sm text-[#e7e9ea]">{guestUrl}</p>
            {expiresAt && (
              <p className="text-xs text-[#71767b]">
                Expires{" "}
                {new Date(expiresAt).toLocaleString("en-US", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-none border-[#2f3336] bg-[#16181c] text-white hover:bg-[#080808]"
              onClick={() => void handleCopy()}
            >
              <Copy className="size-3.5" />
              {copied ? "Copied" : "Copy link"}
            </Button>
          </div>
        )}
      </div>

      <div className="mt-8 border border-[#2f3336] p-5">
        <h3 className="text-sm font-medium text-white">Signed-in accounts</h3>
        <ul className="mt-3 space-y-2 text-sm text-[#71767b]">
          <li>
            <span className="text-[#e7e9ea]">dispatch1@littleabbyco.com</span>{" "}
            — Dispatcher
          </li>
          <li>
            <span className="text-[#e7e9ea]">dispatch2@littleabbyco.com</span>{" "}
            — Dispatcher
          </li>
          <li>
            <span className="text-[#e7e9ea]">michaeltettey29@gmail.com</span> —
            Administrator
          </li>
        </ul>
        <p className="mt-4 text-xs text-[#71767b]">
          Production Clerk instance on trailerabby.wotedigital.tech. Restricted
          sign-up — only invited staff can authenticate. The Users page links
          each roster row to its Clerk profile (photo, sign-in, invites).
          Anyone not on the roster lands on /no-access after sign-in.
        </p>
      </div>
    </div>
  );
}
