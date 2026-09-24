"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createEvent, updateEvent } from "@/app/actions/event";
import { toast } from "sonner";
import { Event, EventImage } from "@prisma/client";
import { Edit, Plus, X } from "lucide-react";

type EventWithImages = Event & { images?: EventImage[] };

export function EventForm({ event }: { event?: EventWithImages }) {
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [coverImage, setCoverImage] = useState(event?.coverImage || "");
  const [galleryImages, setGalleryImages] = useState<string[]>(
    event?.images?.map((img) => img.url) || []
  );
  const [isUploading, setIsUploading] = useState(false);

  const isEditing = !!event;

  useEffect(() => {
    if (open) {
      setCoverImage(event?.coverImage || "");
      setGalleryImages(event?.images?.map((img) => img.url) || []);
    }
  }, [open, event]);

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", e.target.files[0]);
    formData.append("folder", "events");
    
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        setCoverImage(data.url);
        toast.success("Cover image uploaded!");
      } else {
        toast.error(data.error || "Upload failed");
      }
    } catch (err) {
      toast.error("Upload error");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    
    const files = Array.from(e.target.files);
    let successCount = 0;
    
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "events");
      
      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (res.ok) {
          setGalleryImages(prev => [...prev, data.url]);
          successCount++;
        } else {
          toast.error(data.error || `Upload failed for ${file.name}`);
        }
      } catch (err) {
        toast.error(`Upload error for ${file.name}`);
      }
    }
    
    if (successCount > 0) {
      toast.success(`Uploaded ${successCount} gallery image(s)!`);
    }
    
    setIsUploading(false);
    // clear the file input
    e.target.value = '';
  }

  const removeGalleryImage = (urlToRemove: string) => {
    setGalleryImages(prev => prev.filter(url => url !== urlToRemove));
  };

  async function action(formData: FormData) {
    setIsSaving(true);
    try {
      const data = {
        title: formData.get("title") as string,
        slug: formData.get("slug") as string,
        startDate: new Date(formData.get("startDate") as string),
        endDate: formData.get("endDate") ? new Date(formData.get("endDate") as string) : undefined,
        shortOverview: formData.get("shortOverview") as string,
        detailedDescription: formData.get("detailedDescription") as string,
        status: formData.get("status") as string,
        registrationStatus: formData.get("registrationStatus") as string,
        googleFormUrl: formData.get("googleFormUrl") as string,
        coverImage: coverImage,
        images: galleryImages,
      };

      if (isEditing) {
        await updateEvent(event.id, data);
        toast.success("Event updated");
      } else {
        await createEvent(data);
        toast.success("Event created");
      }
      setOpen(false);
    } catch (e) {
      toast.error("Failed to save event");
    } finally {
      setIsSaving(false);
    }
  }

  // Helper to format date for input type="datetime-local"
  const formatDate = (date?: Date) => {
    if (!date) return "";
    return new Date(date).toISOString().slice(0, 16);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {isEditing ? (
        <DialogTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" />}>
          <Edit size={16} />
        </DialogTrigger>
      ) : (
        <DialogTrigger render={<Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2" />}>
          <Plus size={18} /> Add Event
        </DialogTrigger>
      )}
      <DialogContent className="bg-card border-border sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">{isEditing ? "Edit" : "Add"} Event</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-6 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground">Title *</Label>
              <Input name="title" defaultValue={event?.title} required className="bg-input border-border text-foreground" />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Slug (URL) *</Label>
              <Input name="slug" defaultValue={event?.slug} required placeholder="e.g. algohack-2026" className="bg-input border-border text-foreground" />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Start Date *</Label>
              <Input type="datetime-local" name="startDate" defaultValue={formatDate(event?.startDate)} required className="bg-input border-border text-foreground" />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">End Date</Label>
              <Input type="datetime-local" name="endDate" defaultValue={formatDate(event?.endDate || undefined)} className="bg-input border-border text-foreground" />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Event Status *</Label>
              <select name="status" defaultValue={event?.status || "UPCOMING"} className="flex h-9 w-full rounded-md border border-border bg-input px-3 py-1 text-sm shadow-sm transition-colors text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                <option value="UPCOMING">Upcoming</option>
                <option value="ONGOING">Ongoing</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Registration Status *</Label>
              <select name="registrationStatus" defaultValue={event?.registrationStatus || "CLOSED"} className="flex h-9 w-full rounded-md border border-border bg-input px-3 py-1 text-sm shadow-sm transition-colors text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                <option value="OPEN">Open</option>
                <option value="CLOSED">Closed</option>
                <option value="COMING_SOON">Coming Soon</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-foreground">Google Form Registration URL</Label>
            <Input name="googleFormUrl" defaultValue={event?.googleFormUrl || ""} type="url" className="bg-input border-border text-foreground" />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Short Overview *</Label>
            <Input name="shortOverview" defaultValue={event?.shortOverview} required className="bg-input border-border text-foreground" />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Detailed Description</Label>
            <Textarea name="detailedDescription" defaultValue={event?.detailedDescription || ""} className="bg-input border-border text-foreground min-h-[100px]" />
          </div>
          
          <div className="space-y-4 border-t border-border pt-4">
            <h3 className="text-sm font-medium text-foreground">Media</h3>
            
            <div className="space-y-2">
              <Label className="text-foreground">Event Cover Image</Label>
              <div className="flex items-center gap-4">
                {coverImage && <img src={coverImage} alt="Cover Preview" className="w-24 h-12 rounded object-cover" />}
                <Input type="file" accept="image/jpeg, image/png, image/webp" onChange={handleCoverUpload} disabled={isUploading} className="bg-input border-border text-foreground cursor-pointer" />
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <Label className="text-foreground flex items-center justify-between">
                <span>Event Gallery</span>
                <span className="text-xs text-muted-foreground font-normal">Select multiple images</span>
              </Label>
              <Input type="file" multiple accept="image/jpeg, image/png, image/webp" onChange={handleGalleryUpload} disabled={isUploading} className="bg-input border-border text-foreground cursor-pointer" />
              
              {galleryImages.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                  {galleryImages.map((url, index) => (
                    <div key={index} className="relative group rounded-lg overflow-hidden border border-border aspect-video">
                      <img src={url} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(url)}
                        className="absolute top-1 right-1 bg-black/50 hover:bg-destructive/80 text-white rounded-full p-1 transition-colors"
                        title="Remove image"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border">
            <Button type="submit" disabled={isSaving || isUploading} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {isSaving ? "Saving..." : "Save Event"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
