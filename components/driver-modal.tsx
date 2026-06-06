"use client";

import { useEffect, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import type { Driver, DriverStatus } from "@/lib/types";
import {
  DRIVER_STATUSES,
  DRIVER_STATUS_LABELS,
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

export interface DriverFormData {
  name: string;
  driverId: string;
  phone: string;
  status: DriverStatus;
  currentAssignment: string;
}

interface DriverModalProps {
  open: boolean;
  driver: Driver | null;
  saving: boolean;
  onClose: () => void;
  onSave: (data: DriverFormData) => Promise<void>;
  onDelete?: () => Promise<void>;
}

const emptyForm: DriverFormData = {
  name: "",
  driverId: "",
  phone: "",
  status: "on_duty",
  currentAssignment: "",
};

export function DriverModal({
  open,
  driver,
  saving,
  onClose,
  onSave,
  onDelete,
}: DriverModalProps) {
  const [form, setForm] = useState<DriverFormData>(emptyForm);
  const isEdit = driver !== null;

  useEffect(() => {
    if (!open) return;
    if (driver) {
      setForm({
        name: driver.name,
        driverId: driver.driverId,
        phone: driver.phone,
        status: driver.status,
        currentAssignment: driver.currentAssignment,
      });
    } else {
      setForm(emptyForm);
    }
  }, [open, driver]);

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
        className="border-[#2f3336] bg-black text-white sm:max-w-lg"
        showCloseButton={!saving}
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-white">
              {isEdit ? "Edit driver" : "Add driver"}
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4 grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="driver-name" className="text-[#e7e9ea]">
                Name
              </Label>
              <Input
                id="driver-name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="John Smith"
                className="rounded-none border-[#2f3336] bg-[#16181c] text-white"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="driver-id" className="text-[#e7e9ea]">
                  Driver ID
                </Label>
                <Input
                  id="driver-id"
                  required
                  value={form.driverId}
                  onChange={(e) =>
                    setForm({ ...form, driverId: e.target.value })
                  }
                  placeholder="DRV-1001"
                  className="rounded-none border-[#2f3336] bg-[#16181c] text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="driver-phone" className="text-[#e7e9ea]">
                  Phone
                </Label>
                <Input
                  id="driver-phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="(404) 555-0101"
                  className="rounded-none border-[#2f3336] bg-[#16181c] text-white"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="text-[#e7e9ea]">Status</Label>
              <Select
                value={form.status}
                onValueChange={(value) => {
                  if (value) setForm({ ...form, status: value as DriverStatus });
                }}
              >
                <SelectTrigger className="rounded-none border-[#2f3336] bg-[#16181c] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-none border-[#2f3336] bg-black text-white">
                  {DRIVER_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {DRIVER_STATUS_LABELS[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="driver-assignment" className="text-[#e7e9ea]">
                Current assignment
              </Label>
              <Input
                id="driver-assignment"
                value={form.currentAssignment}
                onChange={(e) =>
                  setForm({ ...form, currentAssignment: e.target.value })
                }
                placeholder="Trailer number (optional)"
                className="rounded-none border-[#2f3336] bg-[#16181c] text-white"
              />
              <p className="text-xs text-[#71767b]">
                Leave blank to derive from trailer driver field when linked.
              </p>
            </div>
          </div>

          <DialogFooter className="mt-6 gap-2 sm:justify-between">
            {isEdit && onDelete ? (
              <Button
                type="button"
                variant="ghost"
                className="rounded-none text-[#f4212e] hover:bg-[#f4212e]/10 hover:text-[#f4212e]"
                onClick={() => void onDelete()}
                disabled={saving}
              >
                <Trash2 className="size-4" />
                Delete
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-none border-[#2f3336] bg-transparent text-white hover:bg-[#16181c]"
                onClick={onClose}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-none bg-white font-bold text-black hover:bg-[#e7e9ea]"
                disabled={saving}
              >
                {saving && <Loader2 className="size-4 animate-spin" />}
                {isEdit ? "Save changes" : "Add driver"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
