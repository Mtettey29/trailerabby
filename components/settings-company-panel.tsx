"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import {
  SettingsField,
  SettingsSectionTitle,
  settingsInputClass,
  settingsSelectTriggerClass,
} from "@/components/settings-field";
import type { CompanyTabId } from "@/lib/settings-display";
import { companyInitials } from "@/lib/settings-display";
import type { CompanySettings } from "@/lib/types";
import {
  SETTINGS_BUSINESS_DAYS,
  SETTINGS_CURRENCIES,
  SETTINGS_INDUSTRIES,
  SETTINGS_TIMEZONES,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const COMPANY_TABS: { id: CompanyTabId; label: string }[] = [
  { id: "company_info", label: "Company Information" },
  { id: "localization", label: "Localization" },
  { id: "preferences", label: "Preferences" },
  { id: "branding", label: "Branding" },
];

interface SettingsCompanyPanelProps {
  company: CompanySettings;
  onChange: (company: CompanySettings) => void;
}

export function SettingsCompanyPanel({
  company,
  onChange,
}: SettingsCompanyPanelProps) {
  const [tab, setTab] = useState<CompanyTabId>("company_info");

  function update<K extends keyof CompanySettings>(
    key: K,
    value: CompanySettings[K]
  ) {
    onChange({ ...company, [key]: value });
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="flex border-b border-[#2f3336]">
        {COMPANY_TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "border-b-2 px-4 py-3 text-sm font-medium transition-colors",
              tab === id
                ? "border-[#1d9bf0] text-white"
                : "border-transparent text-[#71767b] hover:text-white"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 p-6">
        {tab === "company_info" && (
          <div className="space-y-8">
            <SettingsSectionTitle>Company Information</SettingsSectionTitle>

            <div className="grid gap-6 lg:grid-cols-[1fr_220px]">
              <div className="grid gap-4 sm:grid-cols-2">
                <SettingsField label="Company Name" htmlFor="company-name">
                  <Input
                    id="company-name"
                    value={company.companyName}
                    onChange={(e) => update("companyName", e.target.value)}
                    className={settingsInputClass}
                  />
                </SettingsField>

                <SettingsField label="Legal Name" htmlFor="legal-name">
                  <Input
                    id="legal-name"
                    value={company.legalName}
                    onChange={(e) => update("legalName", e.target.value)}
                    className={settingsInputClass}
                  />
                </SettingsField>

                <SettingsField label="Industry">
                  <Select
                    value={company.industry}
                    onValueChange={(value) => {
                      if (value) update("industry", value);
                    }}
                  >
                    <SelectTrigger className={settingsSelectTriggerClass}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-none border-[#2f3336] bg-black text-white">
                      {SETTINGS_INDUSTRIES.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </SettingsField>

                <SettingsField label="Phone" htmlFor="company-phone">
                  <Input
                    id="company-phone"
                    value={company.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    className={settingsInputClass}
                  />
                </SettingsField>

                <SettingsField
                  label="Company Email"
                  htmlFor="company-email"
                  className="sm:col-span-2"
                >
                  <Input
                    id="company-email"
                    type="email"
                    value={company.companyEmail}
                    onChange={(e) => update("companyEmail", e.target.value)}
                    className={settingsInputClass}
                  />
                </SettingsField>

                <SettingsField
                  label="Address"
                  htmlFor="company-address"
                  className="sm:col-span-2"
                >
                  <Textarea
                    id="company-address"
                    rows={3}
                    value={company.address}
                    onChange={(e) => update("address", e.target.value)}
                    className={settingsInputClass}
                  />
                </SettingsField>

                <SettingsField label="Website" htmlFor="company-website">
                  <Input
                    id="company-website"
                    value={company.website}
                    onChange={(e) => update("website", e.target.value)}
                    className={settingsInputClass}
                  />
                </SettingsField>

                <SettingsField label="Timezone">
                  <Select
                    value={company.timezone}
                    onValueChange={(value) => {
                      if (value) update("timezone", value);
                    }}
                  >
                    <SelectTrigger className={settingsSelectTriggerClass}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-none border-[#2f3336] bg-black text-white">
                      {SETTINGS_TIMEZONES.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </SettingsField>

                <SettingsField label="Currency">
                  <Select
                    value={company.currency}
                    onValueChange={(value) => {
                      if (value) update("currency", value);
                    }}
                  >
                    <SelectTrigger className={settingsSelectTriggerClass}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-none border-[#2f3336] bg-black text-white">
                      {SETTINGS_CURRENCIES.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </SettingsField>

                <SettingsField
                  label="Company Description"
                  htmlFor="company-description"
                  className="sm:col-span-2"
                >
                  <Textarea
                    id="company-description"
                    rows={4}
                    value={company.companyDescription}
                    onChange={(e) =>
                      update("companyDescription", e.target.value)
                    }
                    className={settingsInputClass}
                  />
                </SettingsField>
              </div>

              <div className="border border-[#2f3336] bg-[#080808] p-4">
                <p className="text-sm font-medium text-white">Company Logo</p>
                <div className="mt-4 flex aspect-square items-center justify-center border border-[#2f3336] bg-[#16181c]">
                  {company.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={company.logoUrl}
                      alt="Company logo"
                      className="max-h-full max-w-full object-contain p-4"
                    />
                  ) : (
                    <span className="text-3xl font-semibold text-white">
                      {companyInitials(company.companyName)}
                    </span>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4 w-full rounded-none border-[#2f3336] text-white hover:bg-[#16181c]"
                  disabled
                >
                  <Upload strokeWidth={1.75} />
                  Change Logo
                </Button>
                <p className="mt-2 text-xs text-[#71767b]">
                  PNG, JPG or SVG. Max size 2MB.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <SettingsSectionTitle>Contact Information</SettingsSectionTitle>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <SettingsField label="Support Email" htmlFor="support-email">
                  <Input
                    id="support-email"
                    type="email"
                    value={company.supportEmail}
                    onChange={(e) => update("supportEmail", e.target.value)}
                    className={settingsInputClass}
                  />
                </SettingsField>
                <SettingsField label="Support Phone" htmlFor="support-phone">
                  <Input
                    id="support-phone"
                    value={company.supportPhone}
                    onChange={(e) => update("supportPhone", e.target.value)}
                    className={settingsInputClass}
                  />
                </SettingsField>
                <SettingsField label="Billing Email" htmlFor="billing-email">
                  <Input
                    id="billing-email"
                    type="email"
                    value={company.billingEmail}
                    onChange={(e) => update("billingEmail", e.target.value)}
                    className={settingsInputClass}
                  />
                </SettingsField>
                <SettingsField
                  label="Emergency Phone"
                  htmlFor="emergency-phone"
                >
                  <Input
                    id="emergency-phone"
                    value={company.emergencyPhone}
                    onChange={(e) => update("emergencyPhone", e.target.value)}
                    className={settingsInputClass}
                  />
                </SettingsField>
              </div>
            </div>

            <div className="space-y-4">
              <SettingsSectionTitle>Business Hours</SettingsSectionTitle>
              <div className="grid gap-4 sm:grid-cols-3">
                <SettingsField label="Days">
                  <Select
                    value={company.businessDays}
                    onValueChange={(value) => {
                      if (value) update("businessDays", value);
                    }}
                    disabled={company.is24x7}
                  >
                    <SelectTrigger className={settingsSelectTriggerClass}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-none border-[#2f3336] bg-black text-white">
                      {SETTINGS_BUSINESS_DAYS.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </SettingsField>
                <SettingsField label="Start Time" htmlFor="business-start">
                  <Input
                    id="business-start"
                    type="time"
                    value={company.businessStartTime}
                    onChange={(e) =>
                      update("businessStartTime", e.target.value)
                    }
                    disabled={company.is24x7}
                    className={settingsInputClass}
                  />
                </SettingsField>
                <SettingsField label="End Time" htmlFor="business-end">
                  <Input
                    id="business-end"
                    type="time"
                    value={company.businessEndTime}
                    onChange={(e) => update("businessEndTime", e.target.value)}
                    disabled={company.is24x7}
                    className={settingsInputClass}
                  />
                </SettingsField>
              </div>
              <label className="flex cursor-pointer items-center gap-3 text-sm text-[#e7e9ea]">
                <input
                  type="checkbox"
                  checked={company.is24x7}
                  onChange={(e) => update("is24x7", e.target.checked)}
                  className="size-4 rounded-none border border-[#2f3336] bg-[#16181c] accent-[#1d9bf0]"
                />
                Check if your operations run 24/7
              </label>
            </div>
          </div>
        )}

        {tab === "localization" && (
          <div className="space-y-6">
            <SettingsSectionTitle>Localization</SettingsSectionTitle>
            <div className="grid gap-4 sm:grid-cols-2">
              <SettingsField label="Timezone">
                <Select
                  value={company.timezone}
                  onValueChange={(value) => {
                    if (value) update("timezone", value);
                  }}
                >
                  <SelectTrigger className={settingsSelectTriggerClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-none border-[#2f3336] bg-black text-white">
                    {SETTINGS_TIMEZONES.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </SettingsField>
              <SettingsField label="Currency">
                <Select
                  value={company.currency}
                  onValueChange={(value) => {
                    if (value) update("currency", value);
                  }}
                >
                  <SelectTrigger className={settingsSelectTriggerClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-none border-[#2f3336] bg-black text-white">
                    {SETTINGS_CURRENCIES.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </SettingsField>
              <SettingsField label="Date Format">
                <Select
                  value={company.dateFormat}
                  onValueChange={(value) => {
                    if (value) update("dateFormat", value);
                  }}
                >
                  <SelectTrigger className={settingsSelectTriggerClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-none border-[#2f3336] bg-black text-white">
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </SettingsField>
              <SettingsField label="Time Format">
                <Select
                  value={company.timeFormat}
                  onValueChange={(value) => {
                    if (value) update("timeFormat", value);
                  }}
                >
                  <SelectTrigger className={settingsSelectTriggerClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-none border-[#2f3336] bg-black text-white">
                    <SelectItem value="12-hour">12-hour</SelectItem>
                    <SelectItem value="24-hour">24-hour</SelectItem>
                  </SelectContent>
                </Select>
              </SettingsField>
              <SettingsField label="Language" className="sm:col-span-2">
                <Select
                  value={company.language}
                  onValueChange={(value) => {
                    if (value) update("language", value);
                  }}
                >
                  <SelectTrigger className={settingsSelectTriggerClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-none border-[#2f3336] bg-black text-white">
                    <SelectItem value="English (US)">English (US)</SelectItem>
                    <SelectItem value="English (UK)">English (UK)</SelectItem>
                    <SelectItem value="Spanish">Spanish</SelectItem>
                  </SelectContent>
                </Select>
              </SettingsField>
            </div>
          </div>
        )}

        {tab === "preferences" && (
          <div className="space-y-6">
            <SettingsSectionTitle>Preferences</SettingsSectionTitle>
            <div className="grid gap-4 sm:grid-cols-2">
              <SettingsField
                label="Default Location"
                htmlFor="default-location"
              >
                <Input
                  id="default-location"
                  value={company.defaultLocation}
                  onChange={(e) => update("defaultLocation", e.target.value)}
                  className={settingsInputClass}
                />
              </SettingsField>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-medium text-white">Notifications</p>
              <label className="flex items-center gap-3 text-sm text-[#e7e9ea]">
                <input
                  type="checkbox"
                  checked={company.emailNotifications}
                  onChange={(e) =>
                    update("emailNotifications", e.target.checked)
                  }
                  className="size-4 rounded-none border border-[#2f3336] bg-[#16181c] accent-[#1d9bf0]"
                />
                Email notifications
              </label>
              <label className="flex items-center gap-3 text-sm text-[#e7e9ea]">
                <input
                  type="checkbox"
                  checked={company.smsNotifications}
                  onChange={(e) => update("smsNotifications", e.target.checked)}
                  className="size-4 rounded-none border border-[#2f3336] bg-[#16181c] accent-[#1d9bf0]"
                />
                SMS notifications
              </label>
              <label className="flex items-center gap-3 text-sm text-[#e7e9ea]">
                <input
                  type="checkbox"
                  checked={company.pushNotifications}
                  onChange={(e) =>
                    update("pushNotifications", e.target.checked)
                  }
                  className="size-4 rounded-none border border-[#2f3336] bg-[#16181c] accent-[#1d9bf0]"
                />
                Push notifications
              </label>
            </div>
          </div>
        )}

        {tab === "branding" && (
          <div className="space-y-6">
            <SettingsSectionTitle>Branding</SettingsSectionTitle>
            <div className="grid gap-4 sm:grid-cols-2">
              <SettingsField label="Logo URL" htmlFor="logo-url">
                <Input
                  id="logo-url"
                  value={company.logoUrl}
                  onChange={(e) => update("logoUrl", e.target.value)}
                  placeholder="https://..."
                  className={settingsInputClass}
                />
              </SettingsField>
              <SettingsField label="Primary Color" htmlFor="primary-color">
                <Input
                  id="primary-color"
                  value={company.primaryColor}
                  onChange={(e) => update("primaryColor", e.target.value)}
                  className={settingsInputClass}
                />
              </SettingsField>
            </div>
            <div className="border border-[#2f3336] bg-[#080808] p-4">
              <p className="text-sm text-[#71767b]">Preview</p>
              <div className="mt-3 flex items-center gap-3">
                <span
                  className="flex size-12 items-center justify-center rounded-none border border-[#2f3336] text-lg font-semibold text-white"
                  style={{ backgroundColor: company.primaryColor }}
                >
                  {companyInitials(company.companyName)}
                </span>
                <div>
                  <p className="font-medium text-white">{company.companyName}</p>
                  <p className="text-sm text-[#71767b]">{company.website}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
