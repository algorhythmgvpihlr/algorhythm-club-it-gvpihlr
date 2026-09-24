"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
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
import { createTeamMember, updateTeamMember } from "@/app/actions/team";
import { toast } from "sonner";
import { TeamMember } from "@prisma/client";
import { Edit, Plus } from "lucide-react";

type TeamFormData = {
  name: string;
  position: string;
  category: string;
  academicYear: string;
  branch: string;
  designation: string;
};

export function TeamForm({ member }: { member?: TeamMember }) {
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(member?.photoUrl || "");
  const [isUploading, setIsUploading] = useState(false);

  const isEditing = !!member;

  const { control, handleSubmit, reset } = useForm<TeamFormData>({
    defaultValues: {
      name: "",
      position: "",
      category: "BOARD_26_27",
      academicYear: "",
      branch: "",
      designation: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (member) {
        reset({
          name: member.name ?? "",
          position: member.position ?? "",
          category: member.category ?? "BOARD_26_27",
          academicYear: member.academicYear ?? "",
          branch: member.branch ?? "",
          designation: member.designation ?? "",
        });
        setPhotoUrl(member.photoUrl || "");
      } else {
        reset({
          name: "",
          position: "",
          category: "BOARD_26_27",
          academicYear: "",
          branch: "",
          designation: "",
        });
        setPhotoUrl("");
      }
    }
  }, [open, member, reset]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", e.target.files[0]);
    formData.append("folder", "team");
    
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        setPhotoUrl(data.url);
        toast.success("Image uploaded!");
      } else {
        toast.error(data.error || "Upload failed");
      }
    } catch (err) {
      toast.error("Upload error");
    } finally {
      setIsUploading(false);
    }
  }

  const onSubmit = async (data: TeamFormData) => {
    setIsSaving(true);
    try {
      const payload = {
        ...data,
        photoUrl: photoUrl,
      };

      if (isEditing) {
        await updateTeamMember(member.id, payload);
        toast.success("Team member updated");
      } else {
        await createTeamMember(payload);
        toast.success("Team member created");
      }
      setOpen(false);
    } catch (e) {
      toast.error("Failed to save team member");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {isEditing ? (
        <DialogTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" />}>
          <Edit size={16} />
        </DialogTrigger>
      ) : (
        <DialogTrigger render={<Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2" />}>
          <Plus size={18} /> Add Member
        </DialogTrigger>
      )}
      <DialogContent className="bg-card border-border sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-foreground">{isEditing ? "Edit" : "Add"} Team Member</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground">Name *</Label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Input {...field} value={field.value ?? ""} required className="bg-input border-border text-foreground" />
                )}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Position *</Label>
              <Controller
                name="position"
                control={control}
                render={({ field }) => (
                  <Input {...field} value={field.value ?? ""} required placeholder="e.g. President" className="bg-input border-border text-foreground" />
                )}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Category *</Label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <select {...field} value={field.value ?? "BOARD_26_27"} className="flex h-9 w-full rounded-md border border-border bg-input px-3 py-1 text-sm shadow-sm transition-colors text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                    <option value="FOUNDER">Founder</option>
                    <option value="BOARD_26_27">Board 2026-2027</option>
                    <option value="BOARD_24_26">Board 2024-2026</option>
                    <option value="VOLUNTEER">Volunteer</option>
                    <option value="FACULTY">Faculty</option>
                  </select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Academic Year</Label>
              <Controller
                name="academicYear"
                control={control}
                render={({ field }) => (
                  <Input {...field} value={field.value ?? ""} placeholder="e.g. 2024-2028" className="bg-input border-border text-foreground" />
                )}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Branch</Label>
              <Controller
                name="branch"
                control={control}
                render={({ field }) => (
                  <Input {...field} value={field.value ?? ""} placeholder="e.g. IT" className="bg-input border-border text-foreground" />
                )}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Faculty Designation</Label>
              <Controller
                name="designation"
                control={control}
                render={({ field }) => (
                  <Input {...field} value={field.value ?? ""} placeholder="e.g. Asst. Professor" className="bg-input border-border text-foreground" />
                )}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-foreground">Profile Photo</Label>
            <div className="flex items-center gap-4">
              {photoUrl && <img src={photoUrl} alt="Preview" className="w-12 h-12 rounded object-cover" />}
              <Input type="file" accept="image/*" onChange={handleUpload} disabled={isUploading} className="bg-input border-border text-foreground cursor-pointer" />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isSaving || isUploading} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {isSaving ? "Saving..." : "Save Member"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
