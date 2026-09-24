"use client";

import { useState } from "react";
import { updateSettings } from "@/app/actions/settings";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { WebsiteSettings } from "@prisma/client";

export function SettingsForm({ initialData }: { initialData: WebsiteSettings }) {
  const [isSaving, setIsSaving] = useState(false);
  
  async function action(formData: FormData) {
    setIsSaving(true);
    try {
      await updateSettings(initialData.id, {
        clubName: formData.get("clubName") as string,
        description: formData.get("description") as string,
        whatsappUrl: formData.get("whatsappUrl") as string,
        instagramUrl: formData.get("instagramUrl") as string,
        linkedinUrl: formData.get("linkedinUrl") as string,
        footerText: formData.get("footerText") as string,
      });
      toast.success("Settings saved successfully.");
    } catch (e) {
      toast.error("Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-white">Global Information</CardTitle>
      </CardHeader>
      <form action={action}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Club Name</Label>
              <Input name="clubName" defaultValue={initialData.clubName} required className="bg-zinc-800 border-zinc-700 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Description</Label>
              <Input name="description" defaultValue={initialData.description} required className="bg-zinc-800 border-zinc-700 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">WhatsApp URL</Label>
              <Input name="whatsappUrl" defaultValue={initialData.whatsappUrl || ""} className="bg-zinc-800 border-zinc-700 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Instagram URL</Label>
              <Input name="instagramUrl" defaultValue={initialData.instagramUrl || ""} className="bg-zinc-800 border-zinc-700 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">LinkedIn URL</Label>
              <Input name="linkedinUrl" defaultValue={initialData.linkedinUrl || ""} className="bg-zinc-800 border-zinc-700 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Footer Text</Label>
              <Input name="footerText" defaultValue={initialData.footerText} required className="bg-zinc-800 border-zinc-700 text-white" />
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t border-zinc-800 mt-4 pt-4">
          <Button type="submit" disabled={isSaving} className="bg-cyan-600 hover:bg-cyan-700 text-white">
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
