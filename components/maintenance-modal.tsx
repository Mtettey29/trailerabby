"use client";

import { useEffect, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import type {
  MaintenancePriority,
  MaintenanceService,
  MaintenanceServiceStatus,
  MaintenanceServiceType,
  Trailer,
} from "@/lib/types";
import {
  MAINTENANCE_PRIORITIES,
  MAINTENANCE_PRIORITY_LABELS,
  MAINTENANCE_SERVICE_STATUSES,
  MAINTENANCE_SERVICE_STATUS_LABELS,
  MAINTENANCE_SERVICE_TYPES,
  MAINTENANCE_SERVICE_TYPE_LABELS,
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
import { Textarea } from "@/components/ui/textarea";

export interface MaintenanceFormData {
  trailerNumber: string;
  serviceType: MaintenanceServiceType;
  dueDate: string;
  status: MaintenanceServiceStatus;
  priority: MaintenancePriority;
  technician: string;
  cost: string;
  notes: string;
}

interface MaintenanceModalProps {
  open: boolean;
  service: MaintenanceService | null;
  trailers: Trailer[];
  saving: boolean;
  onClose: () => void;
  onSave: (data: MaintenanceFormData) => Promise<void>;
  onDelete?: () => Promise<void>;
}

const emptyForm: MaintenanceFormData = {
  trailerNumber: "",
  serviceType: "dot_inspection",
  dueDate: "",
  status: "scheduled",
  priority: "medium",
  technician: "",
  cost: "",
  notes: "",
};

export function MaintenanceModal({
  open,
  service,
  trailers,
  saving,
  onClose,
  onSave,
  onDelete,
}: MaintenanceModalProps) {
  const [form, setForm] = useState<MaintenanceFormData>(emptyForm);
  const isEdit = service !== null;

  useEffect(() => {
    if (!open) return;
    if (service) {
      setForm({
        trailerNumber: service.trailerNumber,
        serviceType: service.serviceType,
        dueDate: service.dueDate.slice(0, 10),
        status: service.status,
        priority: service.priority,
        technician: service.technician,
        cost: service.cost ? String(service.cost) : "",
        notes: service.notes,
      });
    } else {
      setForm({
        ...emptyForm,
        dueDate: new Date().toISOString().slice(0, 10),
        trailerNumber: trailers[0]?.trailerNumber ?? "",
      });
    }
  }, [open, service, trailers]);

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
              {isEdit ? "Edit service" : "Schedule service"}
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4 grid gap-4">
            <div className="grid gap-2">
              <Label className="text-[#e7e9ea]">Trailer</Label>
              <Select
                value={form.trailerNumber}
                onValueChange={(value) => {
                  if (value) setForm({ ...form, trailerNumber: value });
                }}
              >
                <SelectTrigger className="rounded-none border-[#2f3336] bg-[#16181c] text-white">
                  <SelectValue placeholder="Select trailer" />
                </SelectTrigger>
                <SelectContent className="rounded-none border-[#2f3336] bg-black text-white">
                  {trailers.map((trailer) => (
                    <SelectItem
                      key={trailer.id}
                      value={trailer.trailerNumber}
                    >
                      {trailer.trailerNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label className="text-[#e7e9ea]">Service type</Label>
              <Select
                value={form.serviceType}
                onValueChange={(value) => {
                  if (value)
                    setForm({
                      ...form,
                      serviceType: value as MaintenanceServiceType,
                    });
                }}
              >
                <SelectTrigger className="rounded-none border-[#2f3336] bg-[#16181c] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-none border-[#2f3336] bg-black text-white">
                  {MAINTENANCE_SERVICE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {MAINTENANCE_SERVICE_TYPE_LABELS[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="maint-due" className="text-[#e7e9ea]">
                  Due date
                </Label>
                <Input
                  id="maint-due"
                  type="date"
                  required
                  value={form.dueDate}
                  onChange={(e) =>
                    setForm({ ...form, dueDate: e.target.value })
                  }
                  className="rounded-none border-[#2f3336] bg-[#16181c] text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-[#e7e9ea]">Priority</Label>
                <Select
                  value={form.priority}
                  onValueChange={(value) => {
                    if (value)
                      setForm({
                        ...form,
                        priority: value as MaintenancePriority,
                      });
                  }}
                >
                  <SelectTrigger className="rounded-none border-[#2f3336] bg-[#16181c] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-none border-[#2f3336] bg-black text-white">
                    {MAINTENANCE_PRIORITIES.map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        {MAINTENANCE_PRIORITY_LABELS[priority]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label className="text-[#e7e9ea]">Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(value) => {
                    if (value)
                      setForm({
                        ...form,
                        status: value as MaintenanceServiceStatus,
                      });
                  }}
                >
                  <SelectTrigger className="rounded-none border-[#2f3336] bg-[#16181c] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-none border-[#2f3336] bg-black text-white">
                    {MAINTENANCE_SERVICE_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {MAINTENANCE_SERVICE_STATUS_LABELS[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="maint-cost" className="text-[#e7e9ea]">
                  Est. cost
                </Label>
                <Input
                  id="maint-cost"
                  inputMode="decimal"
                  value={form.cost}
                  onChange={(e) => setForm({ ...form, cost: e.target.value })}
                  placeholder="0"
                  className="rounded-none border-[#2f3336] bg-[#16181c] text-white"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="maint-tech" className="text-[#e7e9ea]">
                Technician
              </Label>
              <Input
                id="maint-tech"
                value={form.technician}
                onChange={(e) =>
                  setForm({ ...form, technician: e.target.value })
                }
                placeholder="Mike R."
                className="rounded-none border-[#2f3336] bg-[#16181c] text-white"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="maint-notes" className="text-[#e7e9ea]">
                Notes
              </Label>
              <Textarea
                id="maint-notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="rounded-none border-[#2f3336] bg-[#16181c] text-white"
              />
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
                {isEdit ? "Save changes" : "Schedule service"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
