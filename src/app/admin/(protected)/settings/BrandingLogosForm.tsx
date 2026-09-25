"use client";

import { useState } from "react";
import { updateBrandingLogos } from "@/app/actions/settings";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { WebsiteSettings } from "@prisma/client";
import { useSession } from "next-auth/react";

export function BrandingLogosForm({ initialData }: { initialData: WebsiteSettings }) {
  const { data: session } = useSession();
  const [isSaving, setIsSaving] = useState(false);
  const [algoLogoId, setAlgoLogoId] = useState(initialData.algorhythmLogoFileId || "1MksFuGHsvPK1lKR2VpWwpDLBUFzVYRtA");
  const [gvpihlrLogoId, setGvpihlrLogoId] = useState(initialData.gvpihlrLogoFileId || "1eIjTCmN1tN9p7VAhwoIHm5Tv3kfBDTxl");
  const [isUploadingAlgo, setIsUploadingAlgo] = useState(false);
  const [isUploadingGvpihlr, setIsUploadingGvpihlr] = useState(false);

  if (session?.user?.role !== "SUPER_ADMIN") {
    return null;
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>, setLogoId: (id: string) => void, setUploading: (state: boolean) => void) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "misc");

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok && data.success) {
        setLogoId(data.id);
        toast.success("Logo uploaded successfully. Remember to save changes.");
      } else {
        toast.error(data.error || "Failed to upload logo.");
      }
    } catch (error) {
      toast.error("An error occurred during upload.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      await updateBrandingLogos(initialData.id, algoLogoId, gvpihlrLogoId);
      toast.success("Branding logos updated successfully.");
    } catch (e: any) {
      toast.error(e.message || "Failed to save branding logos.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800 mt-6">
      <CardHeader>
        <CardTitle className="text-white">Branding / Logos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Label className="text-zinc-300">AlgoRhythm Club Logo</Label>
            <div className="border border-zinc-700 bg-zinc-800 rounded-md p-4 flex items-center justify-center">
              <img src={`/api/media/${algoLogoId}`} alt="AlgoRhythm Logo Preview" className="h-24 w-auto object-contain" />
            </div>
            <Input 
              type="file" 
              accept="image/png, image/jpeg, image/jpg, image/webp" 
              onChange={(e) => handleUpload(e, setAlgoLogoId, setIsUploadingAlgo)}
              disabled={isUploadingAlgo || isSaving}
              className="bg-zinc-800 border-zinc-700 text-white cursor-pointer"
            />
            {isUploadingAlgo && <p className="text-xs text-zinc-400">Uploading...</p>}
          </div>

          <div className="space-y-4">
            <Label className="text-zinc-300">GVPIHLR Institutional Logo</Label>
            <div className="border border-zinc-700 bg-zinc-800 rounded-md p-4 flex items-center justify-center">
              <img src={`/api/media/${gvpihlrLogoId}`} alt="GVPIHLR Logo Preview" className="h-24 w-auto object-contain" />
            </div>
            <Input 
              type="file" 
              accept="image/png, image/jpeg, image/jpg, image/webp" 
              onChange={(e) => handleUpload(e, setGvpihlrLogoId, setIsUploadingGvpihlr)}
              disabled={isUploadingGvpihlr || isSaving}
              className="bg-zinc-800 border-zinc-700 text-white cursor-pointer"
            />
            {isUploadingGvpihlr && <p className="text-xs text-zinc-400">Uploading...</p>}
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t border-zinc-800 mt-4 pt-4">
        <Button onClick={handleSave} disabled={isSaving || isUploadingAlgo || isUploadingGvpihlr} className="bg-cyan-600 hover:bg-cyan-700 text-white">
          {isSaving ? "Saving..." : "Save Branding Logos"}
        </Button>
      </CardFooter>
    </Card>
  );
}
