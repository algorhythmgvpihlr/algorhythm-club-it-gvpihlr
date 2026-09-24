"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import { toast } from "sonner";

export default function AdminGalleryPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    
    // We can upload multiple files sequentially or concurrently
    const files = Array.from(e.target.files);
    let successCount = 0;

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "gallery");
      
      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (res.ok) {
          const data = await res.json();
          setUploadedImages((prev) => [...prev, data.url]);
          successCount++;
        }
      } catch (err) {
        console.error("Failed to upload image", file.name);
      }
    }

    if (successCount > 0) {
      toast.success(`Successfully uploaded ${successCount} image(s)!`);
    } else {
      toast.error("Failed to upload images.");
    }
    
    setIsUploading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gallery Management</h1>
          <p className="text-muted-foreground">Upload raw images to the server.</p>
        </div>
        <div className="relative">
          <Input 
            type="file" 
            multiple 
            accept="image/*" 
            onChange={handleUpload} 
            disabled={isUploading}
            className="absolute inset-0 opacity-0 cursor-pointer" 
          />
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
            <Upload size={18} /> {isUploading ? "Uploading..." : "Upload Images"}
          </Button>
        </div>
      </div>

      <Card className="bg-card border-border shadow-none">
        <CardHeader>
          <CardTitle className="text-foreground">Recent Uploads</CardTitle>
        </CardHeader>
        <CardContent>
          {uploadedImages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No images uploaded in this session.</p>
              <p className="text-sm text-zinc-500">Upload images using the button above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {uploadedImages.map((url, i) => (
                <div key={i} className="aspect-square bg-muted rounded-lg overflow-hidden border border-border group relative">
                  <img src={url} alt={`Upload ${i}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity p-2">
                    <span className="text-xs text-foreground text-center break-all">{url}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
