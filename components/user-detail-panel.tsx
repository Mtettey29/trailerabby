"use client";

import { useState } from "react";
import { KeyRound, Pencil, UserX, X } from "lucide-react";
import { UserRoleBadge, UserStatusBadge } from "@/components/user-badges";
import type { AppUser } from "@/lib/types";
import { USER_ROLE_LABELS } from "@/lib/types";
import {
  formatJoinedDate,
  formatUserLastLogin,
  getUserInitials,
} from "@/lib/user-display";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PANEL_TABS = [
  { id: "profile", label: "Profile" },
  { id: "permissions", label: "Permissions" },
  { id: "activity", label: "Activity" },
  { id: "assignments", label: "Assignments" },
] as const;

type PanelTabId = (typeof PANEL_TABS)[number]["id"];

interface UserDetailPanelProps {
  user: AppUser;
  onClose: () => void;
  onEdit: () => void;
  onDeactivate: () => void;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
      <span className="text-[#71767b]">{label}</span>
      <span className="text-white">{value || "—"}</span>
    </div>
  );
}

export function UserDetailPanel({
  user,
  onClose,
  onEdit,
  onDeactivate,
}: UserDetailPanelProps) {
  const [tab, setTab] = useState<PanelTabId>("profile");

  return (
    <aside className="flex w-full shrink-0 flex-col border border-[#2f3336] bg-black lg:w-80 xl:w-96">
      <div className="border-b border-[#2f3336] p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-none border border-[#2f3336] bg-[#16181c] text-sm font-medium text-white">
              {getUserInitials(user.name)}
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-base font-medium text-white">
                {user.name}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <UserStatusBadge status={user.status} />
                <UserRoleBadge role={user.role} />
              </div>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="shrink-0 text-[#71767b] hover:bg-[#16181c] hover:text-white"
            onClick={onClose}
            aria-label="Close panel"
          >
            <X strokeWidth={1.75} />
          </Button>
        </div>
      </div>

      <div className="flex border-b border-[#2f3336]">
        {PANEL_TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className={cn(
              "flex-1 border-b-2 px-2 py-3 text-xs font-medium transition-colors",
              tab === id
                ? "border-[#1d9bf0] text-white"
                : "border-transparent text-[#71767b] hover:text-white"
            )}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {tab === "profile" && (
          <div className="space-y-4">
            <DetailRow label="Email" value={user.email} />
            <DetailRow label="Phone" value={user.phone} />
            <DetailRow label="Role" value={USER_ROLE_LABELS[user.role]} />
            <DetailRow
              label="Status"
              value={user.status === "active" ? "Active" : "Inactive"}
            />
            <DetailRow label="Joined" value={formatJoinedDate(user.joinedAt)} />
            <DetailRow
              label="Last Login"
              value={formatUserLastLogin(user.lastLoginAt)}
            />

            <div>
              <p className="mb-2 text-sm text-[#71767b]">Location Access</p>
              {user.locationAccess.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {user.locationAccess.map((loc) => (
                    <span
                      key={loc}
                      className="rounded-none border border-[#2f3336] bg-[#16181c] px-2 py-0.5 text-xs text-[#e7e9ea]"
                    >
                      {loc}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#71767b]">No locations assigned</p>
              )}
            </div>

            <div>
              <p className="mb-2 text-sm text-[#71767b]">Notes</p>
              <p className="rounded-none border border-[#2f3336] bg-[#16181c] p-3 text-sm text-[#e7e9ea]">
                {user.notes || "No notes"}
              </p>
            </div>
          </div>
        )}

        {tab === "permissions" && (
          <div className="space-y-3 text-sm text-[#e7e9ea]">
            <p>
              Role-based access for{" "}
              <span className="text-white">{USER_ROLE_LABELS[user.role]}</span>
              .
            </p>
            <ul className="list-inside list-disc space-y-1 text-[#71767b]">
              {user.role === "administrator" && (
                <>
                  <li>Full system access</li>
                  <li>Manage users and settings</li>
                  <li>View all locations and reports</li>
                </>
              )}
              {user.role === "dispatcher" && (
                <>
                  <li>Manage trailer movements</li>
                  <li>Assign drivers and trailers</li>
                  <li>View assigned locations</li>
                </>
              )}
              {user.role === "maintenance_manager" && (
                <>
                  <li>Schedule and track maintenance</li>
                  <li>Update trailer shop status</li>
                  <li>View maintenance reports</li>
                </>
              )}
              {user.role === "driver" && (
                <>
                  <li>View assigned trailers</li>
                  <li>Update movement status</li>
                </>
              )}
              {user.role === "viewer" && (
                <>
                  <li>Read-only dashboard access</li>
                  <li>View reports and alerts</li>
                </>
              )}
            </ul>
          </div>
        )}

        {tab === "activity" && (
          <div className="space-y-3 text-sm">
            <div className="border border-[#2f3336] bg-[#080808] p-3">
              <p className="text-white">Last login</p>
              <p className="mt-1 text-[#71767b]">
                {formatUserLastLogin(user.lastLoginAt)}
              </p>
            </div>
            <div className="border border-[#2f3336] bg-[#080808] p-3">
              <p className="text-white">Profile updated</p>
              <p className="mt-1 text-[#71767b]">
                {formatUserLastLogin(user.updatedAt)}
              </p>
            </div>
            <p className="text-[#71767b]">
              Detailed activity logs are not enabled for this deployment.
            </p>
          </div>
        )}

        {tab === "assignments" && (
          <div className="space-y-3 text-sm">
            <DetailRow label="Primary location" value={user.location} />
            <div>
              <p className="mb-2 text-[#71767b]">Location access</p>
              {user.locationAccess.length > 0 ? (
                <ul className="space-y-1">
                  {user.locationAccess.map((loc) => (
                    <li
                      key={loc}
                      className="border border-[#2f3336] bg-[#080808] px-3 py-2 text-white"
                    >
                      {loc}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[#71767b]">No assignments</p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 border-t border-[#2f3336] p-4">
        <Button
          type="button"
          variant="outline"
          className="h-9 w-full justify-start rounded-none border-[#2f3336] bg-transparent text-[#1d9bf0] hover:bg-[#16181c] hover:text-[#1d9bf0]"
          disabled
        >
          <KeyRound strokeWidth={1.75} />
          Reset Password
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-9 w-full justify-start rounded-none border-[#2f3336] bg-transparent text-[#1d9bf0] hover:bg-[#16181c] hover:text-[#1d9bf0]"
          onClick={onEdit}
        >
          <Pencil strokeWidth={1.75} />
          Edit User
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-9 w-full justify-start rounded-none border-[#f4212e]/30 bg-transparent text-[#f4212e] hover:bg-[#f4212e]/10 hover:text-[#f4212e]"
          onClick={onDeactivate}
          disabled={user.status === "inactive"}
        >
          <UserX strokeWidth={1.75} />
          Deactivate User
        </Button>
      </div>
    </aside>
  );
}
