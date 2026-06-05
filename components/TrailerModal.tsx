"use client";

import { useEffect, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import type { Trailer, TrailerStatus } from "@/lib/types";
import { STATUS_LABELS, TRAILER_STATUSES } from "@/lib/types";
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
import { Textarea } from "@/components/ui/textarea";

export interface TrailerFormData {
  trailerNumber: string;
  status: TrailerStatus;
  driver: string;
  location: string;
  notes: string;
}

interface TrailerModalProps {
  open: boolean;
  trailer: Trailer | null;
  defaultStatus?: TrailerStatus;
  saving: boolean;
  onClose: () => void;
  onSave: (data: TrailerFormData) => Promise<void>;
  onDelete?: () => Promise<void>;
}

const emptyForm: TrailerFormData = {
  trailerNumber: "",
  status: "onsite",
  driver: "",
  location: "",
  notes: "",
};

export function TrailerModal({
  open,
  trailer,
  defaultStatus,
  saving,
  onClose,
  onSave,
  onDelete,
}: TrailerModalProps) {
  const [form, setForm] = useState<TrailerFormData>(emptyForm);
  const isEdit = trailer !== null;

  useEffect(() => {
    if (!open) return;
    if (trailer) {
      setForm({
        trailerNumber: trailer.trailerNumber,
        status: trailer.status,
        driver: trailer.driver,
        location: trailer.location,
        notes: trailer.notes,
      });
    } else {
      setForm({
        ...emptyForm,
        status: defaultStatus ?? emptyForm.status,
      });
    }
  }, [open, trailer, defaultStatus]);

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
              {isEdit ? "Edit Trailer" : "Add Trailer"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="trailerNumber" className="text-[#e7e9ea]">
                Trailer #
              </Label>
              <Input
                id="trailerNumber"
                required
                value={form.trailerNumber}
                onChange={(e) =>
                  setForm((f) => ({ ...f, trailerNumber: e.target.value }))
                }
                placeholder="e.g. T-1042"
                className="border-[#2f3336] bg-black text-white placeholder:text-[#71767b]"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status" className="text-[#e7e9ea]">
                Status
              </Label>
              <Select
                value={form.status}
                onValueChange={(value) =>
                  setForm((f) => ({
                    ...f,
                    status: value as TrailerStatus,
                  }))
                }
              >
                <SelectTrigger
                  id="status"
                  className="w-full border-[#2f3336] bg-black text-white"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-[#2f3336] bg-black text-white">
                  {TRAILER_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="driver" className="text-[#e7e9ea]">
                Driver
              </Label>
              <Input
                id="driver"
                value={form.driver}
                onChange={(e) =>
                  setForm((f) => ({ ...f, driver: e.target.value }))
                }
                placeholder="Optional"
                className="border-[#2f3336] bg-black text-white placeholder:text-[#71767b]"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="location" className="text-[#e7e9ea]">
                Location
              </Label>
              <Input
                id="location"
                value={form.location}
                onChange={(e) =>
                  setForm((f) => ({ ...f, location: e.target.value }))
                }
                placeholder="City, yard, or route"
                className="border-[#2f3336] bg-black text-white placeholder:text-[#71767b]"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes" className="text-[#e7e9ea]">
                Notes
              </Label>
              <Textarea
                id="notes"
                rows={3}
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
                placeholder="Optional notes"
                className="border-[#2f3336] bg-black text-white placeholder:text-[#71767b]"
              />
            </div>
          </div>

          <DialogFooter className="flex-row justify-between border-[#2f3336] bg-black sm:justify-between">
            <div>
              {isEdit && onDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={saving}
                  onClick={() => void onDelete()}
                >
                  <Trash2 className="text-white" />
                  Delete
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={saving}
                onClick={onClose}
                className="rounded-full border-[#536471] bg-transparent text-white hover:bg-[#16181c]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="rounded-full bg-white font-bold text-black hover:bg-[#e7e9ea]"
              >
                {saving && <Loader2 className="animate-spin text-black" />}
                {saving ? "Saving…" : "Save"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
