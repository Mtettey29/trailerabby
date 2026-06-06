"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, Loader2, Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { UserDetailPanel } from "@/components/user-detail-panel";
import { UserFiltersBar } from "@/components/user-filters-bar";
import { UserModal, type UserFormData } from "@/components/user-modal";
import { UserSummary } from "@/components/user-summary";
import { UsersPageTable } from "@/components/users-page-table";
import {
  applyUserFilters,
  DEFAULT_USER_PAGE_FILTERS,
  type UserPageFilters,
} from "@/lib/user-display";
import type { AppUser, Location } from "@/lib/types";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const POLL_INTERVAL_MS = 30_000;

function toPayload(data: UserFormData) {
  return {
    name: data.name,
    email: data.email,
    phone: data.phone,
    role: data.role,
    status: data.status,
    location: data.location,
    locationAccess: data.locationAccess,
    notes: data.notes,
  };
}

export function UsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AppUser | null>(null);
  const [selected, setSelected] = useState<AppUser | null>(null);
  const [saving, setSaving] = useState(false);
  const [filters, setFilters] = useState<UserPageFilters>(
    DEFAULT_USER_PAGE_FILTERS
  );

  const locationOptions = useMemo(() => {
    const names = new Set<string>();
    for (const loc of locations) {
      if (loc.name.trim()) names.add(loc.name.trim());
    }
    for (const user of users) {
      if (user.location.trim()) names.add(user.location.trim());
      for (const access of user.locationAccess) {
        if (access.trim()) names.add(access.trim());
      }
    }
    return [...names].sort();
  }, [locations, users]);

  const filteredUsers = useMemo(
    () => applyUserFilters(users, filters),
    [users, filters]
  );

  const fetchData = useCallback(async () => {
    try {
      const [usersRes, locationsRes] = await Promise.all([
        fetch("/api/users", { cache: "no-store" }),
        fetch("/api/locations", { cache: "no-store" }),
      ]);
      if (!usersRes.ok) throw new Error("Failed to load users");
      if (!locationsRes.ok) throw new Error("Failed to load locations");

      const usersData = (await usersRes.json()) as { users: AppUser[] };
      const locationsData = (await locationsRes.json()) as {
        locations: Location[];
      };

      setUsers(usersData.users);
      setLocations(locationsData.locations);
      setError(null);
    } catch {
      setError("Could not load users. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
    const id = setInterval(() => void fetchData(), POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchData]);

  useEffect(() => {
    if (!selected) return;
    const fresh = users.find((user) => user.id === selected.id);
    if (fresh) setSelected(fresh);
    else setSelected(null);
  }, [users, selected]);

  function openAdd() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(user: AppUser) {
    setEditing(user);
    setModalOpen(true);
  }

  function closeModal() {
    if (!saving) {
      setModalOpen(false);
      setEditing(null);
    }
  }

  async function handleSave(data: UserFormData) {
    setSaving(true);
    try {
      if (editing) {
        const res = await fetch(`/api/users/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(toPayload(data)),
        });
        if (!res.ok) {
          const err = (await res.json()) as { error?: string };
          throw new Error(err.error ?? "Update failed");
        }
        const { user } = (await res.json()) as { user: AppUser };
        setUsers((prev) => prev.map((u) => (u.id === user.id ? user : u)));
        setSelected((prev) => (prev?.id === user.id ? user : prev));
      } else {
        const res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(toPayload(data)),
        });
        if (!res.ok) {
          const err = (await res.json()) as { error?: string };
          throw new Error(err.error ?? "Create failed");
        }
        const { user } = (await res.json()) as { user: AppUser };
        setUsers((prev) => [...prev, user]);
        setSelected(user);
      }
      setModalOpen(false);
      setEditing(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!editing) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${editing.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      setUsers((prev) => prev.filter((u) => u.id !== editing.id));
      setSelected((prev) => (prev?.id === editing.id ? null : prev));
      setModalOpen(false);
      setEditing(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate(user: AppUser) {
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "inactive" }),
      });
      if (!res.ok) throw new Error("Deactivate failed");
      const { user: updated } = (await res.json()) as { user: AppUser };
      setUsers((prev) =>
        prev.map((u) => (u.id === updated.id ? updated : u))
      );
      setSelected(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Deactivate failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex w-full flex-1 flex-col gap-0">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PageHeader
          title="Users"
          subtitle="Manage system users, roles and permissions."
        />
        <Button
          className="h-9 shrink-0 rounded-none bg-white px-4 font-bold text-black hover:bg-[#e7e9ea] print:hidden lg:mt-0"
          onClick={openAdd}
        >
          <Plus className="text-black" strokeWidth={2} />
          Add User
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

      {loading ? (
        <div className="flex items-center gap-2 py-16 text-sm text-[#71767b]">
          <Loader2 className="size-4 animate-spin text-white" />
          Loading users…
        </div>
      ) : (
        <>
          <div className="mt-6">
            <UserSummary users={users} />
          </div>

          <div className="mt-6 flex flex-col gap-0 xl:flex-row">
            <div className="min-w-0 flex-1">
              <UserFiltersBar
                users={users}
                filters={filters}
                onFiltersChange={setFilters}
              />
              <UsersPageTable
                users={filteredUsers}
                selectedId={selected?.id ?? null}
                onSelect={setSelected}
                onEdit={openEdit}
              />
            </div>

            {selected && (
              <div className="mt-6 xl:mt-0 xl:ml-0 xl:border-l-0">
                <UserDetailPanel
                  user={selected}
                  onClose={() => setSelected(null)}
                  onEdit={() => openEdit(selected)}
                  onDeactivate={() => void handleDeactivate(selected)}
                />
              </div>
            )}
          </div>
        </>
      )}

      <UserModal
        open={modalOpen}
        user={editing}
        locationOptions={locationOptions}
        saving={saving}
        onClose={closeModal}
        onSave={handleSave}
        onDelete={editing ? handleDelete : undefined}
      />
    </div>
  );
}
