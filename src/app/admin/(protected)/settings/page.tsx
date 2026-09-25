import { getSettings } from "@/app/actions/settings";
import { SettingsForm } from "./SettingsForm";
import { BrandingLogosForm } from "./BrandingLogosForm";
export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Website Settings</h1>
        <p className="text-zinc-400">Configure global website details and social links.</p>
      </div>

      <SettingsForm initialData={settings} />
      <BrandingLogosForm initialData={settings} />
    </div>
  );
}
