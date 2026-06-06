"use client";

import { useEffect, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import type { AppUser, UserRole, UserStatus } from "@/lib/types";
import {
  USER_ROLES,
  USER_ROLE_LABELS,
  USER_STATUSES,
  USER_STATUS_LABELS,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface UserFormData {
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  location: string;
  locationAccess: string[];
  notes: string;
}

interface UserModalProps {
  open: boolean;
  user: AppUser | null;
  locationOptions: string[];
  saving: boolean;
  onClose: () => void;
  onSave: (data: UserFormData) => Promise<void>;
  onDelete?: () => Promise<void>;
}

const emptyForm: UserFormData = {
  name: "",
  email: "",
  phone: "",
  role: "dispatcher",
  status: "active",
  location: "",
  locationAccess: [],
  notes: "",
};

export function UserModal({
  open,
  user,
  locationOptions,
  saving,
  onClose,
  onSave,
  onDelete,
}: UserModalProps) {
  const [form, setForm] = useState<UserFormData>(emptyForm);
  const [accessInput, setAccessInput] = useState("");
  const isEdit = user !== null;

  useEffect(() => {
    if (!open) return;
    if (user) {
      setForm({
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        location: user.location,
        locationAccess: [...user.locationAccess],
        notes: user.notes,
      });
    } else {
      setForm(emptyForm);
    }
    setAccessInput("");
  }, [open, user]);

  function toggleLocationAccess(location: string) {
    setForm((prev) => {
      const has = prev.locationAccess.includes(location);
      return {
        ...prev,
        locationAccess: has
          ? prev.locationAccess.filter((l) => l !== location)
          : [...prev.locationAccess, location],
      };
    });
  }

  function addCustomAccess() {
    const value = accessInput.trim();
    if (!value) return;
    setForm((prev) => ({
      ...prev,
      locationAccess: prev.locationAccess.includes(value)
        ? prev.locationAccess
        : [...prev.locationAccess, value],
    }));
    setAccessInput("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSave(form);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !saving) onClose();
      }}
    >
      <DialogContent
        className="max-h-[90vh] overflow-y-auto border-[#2f3336] bg-black text-white sm:max-w-lg"
        showCloseButton={!saving}
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-white">
              {isEdit ? "Edit user" : "Add user"}
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user-name" className="text-[#e7e9ea]">
                Name
              </Label>
              <Input
                id="user-name"
                required
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                className="rounded-none border-[#2f3336] bg-[#16181c] text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-email" className="text-[#e7e9ea]">
                Email
              </Label>
              <Input
                id="user-email"
                type="email"
                required
                value={form.email}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, email: e.target.value }))
                }
                className="rounded-none border-[#2f3336] bg-[#16181c] text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-phone" className="text-[#e7e9ea]">
                Phone
              </Label>
              <Input
                id="user-phone"
                value={form.phone}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, phone: e.target.value }))
                }
                className="rounded-none border-[#2f3336] bg-[#16181c] text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[#e7e9ea]">Role</Label>
                <Select
                  value={form.role}
                  onValueChange={(value) => {
                    if (value)
                      setForm((prev) => ({
                        ...prev,
                        role: value as UserRole,
                      }));
                  }}
                >
                  <SelectTrigger className="rounded-none border-[#2f3336] bg-[#16181c] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-none border-[#2f3336] bg-black text-white">
                    {USER_ROLES.map((role) => (
                      <SelectItem key={role} value={role}>
                        {USER_ROLE_LABELS[role]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[#e7e9ea]">Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(value) => {
                    if (value)
                      setForm((prev) => ({
                        ...prev,
                        status: value as UserStatus,
                      }));
                  }}
                >
                  <SelectTrigger className="rounded-none border-[#2f3336] bg-[#16181c] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-none border-[#2f3336] bg-black text-white">
                    {USER_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {USER_STATUS_LABELS[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[#e7e9ea]">Primary location</Label>
              <Select
                value={form.location || "__none__"}
                onValueChange={(value) => {
                  if (value)
                    setForm((prev) => ({
                      ...prev,
                      location: value === "__none__" ? "" : value,
                    }));
                }}
              >
                <SelectTrigger className="rounded-none border-[#2f3336] bg-[#16181c] text-white">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent className="rounded-none border-[#2f3336] bg-black text-white">
                  <SelectItem value="__none__">None</SelectItem>
                  {locationOptions.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[#e7e9ea]">Location access</Label>
              <div className="flex flex-wrap gap-2">
                {locationOptions.map((loc) => {
                  const selected = form.locationAccess.includes(loc);
                  return (
                    <button
                      key={loc}
                      type="button"
                      className={`rounded-none border px-2 py-0.5 text-xs ${
                        selected
                          ? "border-[#1d9bf0] bg-[#1d9bf0]/10 text-[#1d9bf0]"
                          : "border-[#2f3336] bg-[#16181c] text-[#71767b] hover:text-white"
                      }`}
                      onClick={() => toggleLocationAccess(loc)}
                    >
                      {loc}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <Input
                  value={accessInput}
                  onChange={(e) => setAccessInput(e.target.value)}
                  placeholder="Add custom location"
                  className="rounded-none border-[#2f3336] bg-[#16181c] text-white"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomAccess();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="shrink-0 rounded-none border-[#2f3336] text-white hover:bg-[#16181c]"
                  onClick={addCustomAccess}
                >
                  Add
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-notes" className="text-[#e7e9ea]">
                Notes
              </Label>
              <textarea
                id="user-notes"
                rows={3}
                value={form.notes}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, notes: e.target.value }))
                }
                className="w-full rounded-none border border-[#2f3336] bg-[#16181c] p-3 text-sm text-white outline-none focus-visible:ring-1 focus-visible:ring-[#1d9bf0]"
              />
            </div>
          </div>

          <DialogFooter className="mt-6 gap-2 sm:justify-between">
            {isEdit && onDelete ? (
              <Button
                type="button"
                variant="outline"
                className="rounded-none border-[#f4212e]/30 text-[#f4212e] hover:bg-[#f4212e]/10 hover:text-[#f4212e]"
                disabled={saving}
                onClick={() => void onDelete()}
              >
                <Trash2 strokeWidth={1.75} />
                Delete
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-none border-[#2f3336] text-white hover:bg-[#16181c]"
                disabled={saving}
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-none bg-white font-bold text-black hover:bg-[#e7e9ea]"
                disabled={saving}
              >
                {saving && <Loader2 className="animate-spin" />}
                {isEdit ? "Save changes" : "Add user"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
