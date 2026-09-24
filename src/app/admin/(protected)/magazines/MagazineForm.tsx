"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createMagazine, updateMagazine } from "@/app/actions/magazine";
import { toast } from "sonner";
import { Magazine } from "@prisma/client";
import { Edit, Plus } from "lucide-react";

export function MagazineForm({ magazine }: { magazine?: Magazine }) {
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [coverImage, setCoverImage] = useState(magazine?.coverImage || "");
  const [pdfUrl, setPdfUrl] = useState(magazine?.pdfUrl || "");
  const [isUploading, setIsUploading] = useState(false);

  const isEditing = !!magazine;

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>, type: "image" | "pdf") {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", e.target.files[0]);
    formData.append("folder", "magazines");
    
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        if (type === "image") setCoverImage(data.url);
        if (type === "pdf") setPdfUrl(data.url);
        toast.success(`${type === "image" ? "Cover" : "PDF"} uploaded!`);
      } else {
        toast.error(data.error || "Upload failed");
      }
    } catch (err) {
      toast.error("Upload error");
    } finally {
      setIsUploading(false);
    }
  }

  async function action(formData: FormData) {
    if (!pdfUrl) {
      toast.error("You must upload a PDF file.");
      return;
    }
    
    setIsSaving(true);
    try {
      const data = {
        title: formData.get("title") as string,
        month: formData.get("month") as string,
        year: formData.get("year") as string,
        coverImage: coverImage,
        pdfUrl: pdfUrl,
      };

      if (isEditing) {
        await updateMagazine(magazine.id, data);
        toast.success("Magazine updated");
      } else {
        await createMagazine(data);
        toast.success("Magazine created");
      }
      setOpen(false);
    } catch (e) {
      toast.error("Failed to save magazine");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {isEditing ? (
        <DialogTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" />} >
          <Edit size={16} />
        </DialogTrigger>
      ) : (
        <DialogTrigger render={<Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2" />}>
          <Plus size={18} /> Add Magazine
        </DialogTrigger>
      )}
      <DialogContent className="bg-card border-border sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-foreground">{isEditing ? "Edit" : "Add"} Magazine</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label className="text-foreground">Title *</Label>
              <Input name="title" defaultValue={magazine?.title} required placeholder="e.g. TechBytes Issue #2" className="bg-input border-border text-foreground" />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Month *</Label>
              <Input name="month" defaultValue={magazine?.month} required placeholder="e.g. October" className="bg-input border-border text-foreground" />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Year *</Label>
              <Input name="year" defaultValue={magazine?.year} required placeholder="e.g. 2026" className="bg-input border-border text-foreground" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-foreground">Cover Image</Label>
            <div className="flex items-center gap-4">
              {coverImage && <img src={coverImage} alt="Preview" className="w-12 h-12 rounded object-cover" />}
              <Input type="file" accept="image/*" onChange={(e) => handleUpload(e, "image")} disabled={isUploading} className="bg-input border-border text-foreground cursor-pointer" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">PDF Document *</Label>
            <div className="flex items-center gap-4">
              {pdfUrl && <span className="text-tech-teal text-sm truncate max-w-[150px]">PDF Uploaded</span>}
              <Input type="file" accept="application/pdf" onChange={(e) => handleUpload(e, "pdf")} disabled={isUploading} className="bg-input border-border text-foreground cursor-pointer" />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isSaving || isUploading} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {isSaving ? "Saving..." : "Save Magazine"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
