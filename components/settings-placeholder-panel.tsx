import { SettingsSectionTitle } from "@/components/settings-field";

interface SettingsPlaceholderPanelProps {
  title: string;
  description: string;
}

export function SettingsPlaceholderPanel({
  title,
  description,
}: SettingsPlaceholderPanelProps) {
  return (
    <div className="space-y-6 p-6">
      <SettingsSectionTitle>{title}</SettingsSectionTitle>
      <p className="text-sm text-[#71767b]">{description}</p>
      <div className="border border-dashed border-[#2f3336] bg-[#080808] p-8 text-center text-sm text-[#71767b]">
        Configuration options for this section are not enabled in this
        deployment.
      </div>
    </div>
  );
}
