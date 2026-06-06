"use client";

import { useEffect, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import type { Location, LocationStatus, LocationType } from "@/lib/types";
import {
  LOCATION_STATUSES,
  LOCATION_STATUS_LABELS,
  LOCATION_TYPES,
  LOCATION_TYPE_LABELS,
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
import { LocationAddressSearch } from "@/components/location-address-search";

export interface LocationFormData {
  name: string;
  type: LocationType;
  status: LocationStatus;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zip: string;
  latitude: string;
  longitude: string;
}

interface LocationModalProps {
  open: boolean;
  location: Location | null;
  saving: boolean;
  onClose: () => void;
  onSave: (data: LocationFormData) => Promise<void>;
  onDelete?: () => Promise<void>;
}

const emptyForm: LocationFormData = {
  name: "",
  type: "yard",
  status: "active",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  zip: "",
  latitude: "",
  longitude: "",
};

function formatCityStateName(city: string, state: string): string {
  const cityTrim = city.trim();
  const stateTrim = state.trim();
  if (!cityTrim) return "";
  if (!stateTrim) return cityTrim;
  return `${cityTrim}, ${stateTrim}`;
}

export function LocationModal({
  open,
  location,
  saving,
  onClose,
  onSave,
  onDelete,
}: LocationModalProps) {
  const [form, setForm] = useState<LocationFormData>(emptyForm);
  const isEdit = location !== null;

  useEffect(() => {
    if (!open) return;
    if (location) {
      setForm({
        name: location.name,
        type: location.type,
        status: location.status,
        addressLine1: location.addressLine1,
        addressLine2: location.addressLine2,
        city: location.city,
        state: location.state,
        zip: location.zip,
        latitude: String(location.latitude),
        longitude: String(location.longitude),
      });
    } else {
      setForm(emptyForm);
    }
  }, [open, location]);

  function updateCityState(city: string, state: string) {
    setForm((prev) => {
      const prevAutoName = formatCityStateName(prev.city, prev.state);
      const nextName =
        !isEdit && (!prev.name.trim() || prev.name === prevAutoName)
          ? formatCityStateName(city, state)
          : prev.name;

      return { ...prev, city, state, name: nextName };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const name = form.name.trim() || formatCityStateName(form.city, form.state);
    await onSave({ ...form, name });
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
              {isEdit ? "Edit location" : "Add location"}
            </DialogTitle>
            <p className="text-sm text-[#71767b]">
              Enter the town and state. Add the street address when you have it.
            </p>
          </DialogHeader>

          <div className="mt-4 grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label className="text-[#e7e9ea]">Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(value) => {
                    if (value) setForm({ ...form, type: value as LocationType });
                  }}
                >
                  <SelectTrigger className="rounded-none border-[#2f3336] bg-[#16181c] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-none border-[#2f3336] bg-black text-white">
                    {LOCATION_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {LOCATION_TYPE_LABELS[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label className="text-[#e7e9ea]">Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(value) => {
                    if (value)
                      setForm({ ...form, status: value as LocationStatus });
                  }}
                >
                  <SelectTrigger className="rounded-none border-[#2f3336] bg-[#16181c] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-none border-[#2f3336] bg-black text-white">
                    {LOCATION_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {LOCATION_STATUS_LABELS[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="grid gap-2 sm:col-span-1">
                <Label htmlFor="loc-city" className="text-[#e7e9ea]">
                  City
                </Label>
                <Input
                  id="loc-city"
                  required
                  value={form.city}
                  onChange={(e) => updateCityState(e.target.value, form.state)}
                  placeholder="Atlanta"
                  className="rounded-none border-[#2f3336] bg-[#16181c] text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="loc-state" className="text-[#e7e9ea]">
                  State
                </Label>
                <Input
                  id="loc-state"
                  required
                  value={form.state}
                  onChange={(e) => updateCityState(form.city, e.target.value)}
                  placeholder="GA"
                  className="rounded-none border-[#2f3336] bg-[#16181c] text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="loc-zip" className="text-[#e7e9ea]">
                  ZIP
                </Label>
                <Input
                  id="loc-zip"
                  value={form.zip}
                  onChange={(e) => setForm({ ...form, zip: e.target.value })}
                  placeholder="30318"
                  className="rounded-none border-[#2f3336] bg-[#16181c] text-white"
                />
              </div>
            </div>

            <LocationAddressSearch
              form={form}
              onApply={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
            />

            <div className="grid gap-2">
              <Label htmlFor="loc-name" className="text-[#e7e9ea]">
                Display name
              </Label>
              <Input
                id="loc-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Atlanta, GA"
                className="rounded-none border-[#2f3336] bg-[#16181c] text-white"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="loc-address1" className="text-[#e7e9ea]">
                Street address
              </Label>
              <Input
                id="loc-address1"
                value={form.addressLine1}
                onChange={(e) =>
                  setForm({ ...form, addressLine1: e.target.value })
                }
                placeholder="123 Main St"
                className="rounded-none border-[#2f3336] bg-[#16181c] text-white"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="loc-address2" className="text-[#e7e9ea]">
                Address line 2
              </Label>
              <Input
                id="loc-address2"
                value={form.addressLine2}
                onChange={(e) =>
                  setForm({ ...form, addressLine2: e.target.value })
                }
                placeholder="Suite, building, etc."
                className="rounded-none border-[#2f3336] bg-[#16181c] text-white"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="loc-lat" className="text-[#e7e9ea]">
                  Latitude
                </Label>
                <Input
                  id="loc-lat"
                  required
                  inputMode="decimal"
                  value={form.latitude}
                  onChange={(e) =>
                    setForm({ ...form, latitude: e.target.value })
                  }
                  placeholder="33.749"
                  className="rounded-none border-[#2f3336] bg-[#16181c] text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="loc-lng" className="text-[#e7e9ea]">
                  Longitude
                </Label>
                <Input
                  id="loc-lng"
                  required
                  inputMode="decimal"
                  value={form.longitude}
                  onChange={(e) =>
                    setForm({ ...form, longitude: e.target.value })
                  }
                  placeholder="-84.388"
                  className="rounded-none border-[#2f3336] bg-[#16181c] text-white"
                />
              </div>
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
                {isEdit ? "Save changes" : "Add location"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
