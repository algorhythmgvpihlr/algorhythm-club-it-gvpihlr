"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Upload, Trash2, FileText, Loader2, AlertCircle } from "lucide-react";
import { uploadCertificatesZip, getEventCertificates, deleteCertificate } from "@/app/actions/certificate";

type Event = { id: string; title: string; status: string };
type Stats = { total: number; lastUploaded: Date | null };
type Certificate = { id: string; rollNumber: string; fileName: string; createdAt: Date };

export default function CertificateManager({ 
  events, 
  selectedEventId,
  stats
}: { 
  events: Event[], 
  selectedEventId?: string,
  stats: Stats
}) {
  const router = useRouter();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [uploadResults, setUploadResults] = useState<any>(null);

  useEffect(() => {
    if (selectedEventId) {
      loadCertificates();
      setUploadResults(null);
    } else {
      setCertificates([]);
    }
  }, [selectedEventId]);

  const loadCertificates = async () => {
    if (!selectedEventId) return;
    setIsLoading(true);
    try {
      const data = await getEventCertificates(selectedEventId);
      setCertificates(data);
    } catch (err) {
      toast.error("Failed to load certificates");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventChange = (value: string | null) => {
    if (value) router.push(`/admin/certificates?event=${value}`);
  };

  const handleZipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedEventId) return;

    if (!file.name.endsWith(".zip")) {
      toast.error("Please upload a ZIP file");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const results = await uploadCertificatesZip(selectedEventId, formData);
      setUploadResults(results);
      if (results.successful > 0) {
        toast.success(`Successfully uploaded ${results.successful} certificates`);
        loadCertificates();
      } else {
        toast.error("No valid certificates were uploaded");
      }
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this certificate?")) return;
    
    try {
      await deleteCertificate(id);
      toast.success("Certificate deleted");
      loadCertificates();
    } catch (err: any) {
      toast.error("Failed to delete certificate");
    }
  };

  const filteredCerts = certificates.filter(c => 
    c.rollNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Event Selector & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-zinc-900 border-zinc-800 text-zinc-100 col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Select Event</CardTitle>
            <CardDescription className="text-zinc-400">Choose an event to manage its certificates</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedEventId} onValueChange={handleEventChange}>
              <SelectTrigger className="w-full bg-zinc-950 border-zinc-800">
                <SelectValue placeholder="Select an event..." />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                {events.map(event => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 text-zinc-100">
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-cyan-400">{stats.total}</div>
            <p className="text-sm text-zinc-400">Total Certificates</p>
            {stats.lastUploaded && (
              <p className="text-xs text-zinc-500 mt-2">
                Last upload: {new Date(stats.lastUploaded).toLocaleDateString()}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedEventId && (
        <>
          {/* Upload Area */}
          <Card className="bg-zinc-900 border-zinc-800 text-zinc-100">
            <CardHeader>
              <CardTitle>Upload Certificates</CardTitle>
              <CardDescription className="text-zinc-400">
                Upload a ZIP file containing PDF certificates. File names must be the participant's roll number (e.g., 22IT001.pdf).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Input 
                  type="file" 
                  accept=".zip" 
                  onChange={handleZipUpload}
                  disabled={uploading}
                  className="bg-zinc-950 border-zinc-800"
                />
                <Button disabled={uploading} className="bg-cyan-600 hover:bg-cyan-700 text-white shrink-0">
                  {uploading ? <Loader2 className="animate-spin mr-2" size={16} /> : <Upload className="mr-2" size={16} />}
                  Upload ZIP
                </Button>
              </div>

              {uploadResults && (
                <div className="mt-4 p-4 rounded-md bg-zinc-950 border border-zinc-800">
                  <h4 className="font-semibold mb-2">Upload Results:</h4>
                  <ul className="text-sm space-y-1 text-zinc-300">
                    <li>Total Files Found: {uploadResults.total}</li>
                    <li className="text-green-400">Successfully Imported: {uploadResults.successful}</li>
                    {uploadResults.duplicates > 0 && <li className="text-yellow-400">Duplicates Skipped: {uploadResults.duplicates}</li>}
                    {uploadResults.invalid > 0 && <li className="text-red-400">Invalid Format: {uploadResults.invalid}</li>}
                    {uploadResults.failed > 0 && <li className="text-red-500">Failed to Process: {uploadResults.failed}</li>}
                  </ul>
                  
                  {uploadResults.messages.length > 0 && (
                    <div className="mt-3 max-h-32 overflow-y-auto text-xs text-zinc-400 border-t border-zinc-800 pt-2">
                      {uploadResults.messages.map((msg: string, i: number) => (
                        <div key={i} className="flex gap-2"><AlertCircle size={12} className="shrink-0 mt-0.5" /> {msg}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Certificates Table */}
          <Card className="bg-zinc-900 border-zinc-800 text-zinc-100">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Manage Certificates</CardTitle>
                <CardDescription className="text-zinc-400">View and delete individual certificates</CardDescription>
              </div>
              <div className="w-64">
                <Input 
                  placeholder="Search roll number..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-zinc-950 border-zinc-800"
                />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-8 flex justify-center"><Loader2 className="animate-spin text-cyan-400" /></div>
              ) : filteredCerts.length === 0 ? (
                <div className="text-center py-8 text-zinc-500">No certificates found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-zinc-400 uppercase bg-zinc-950/50">
                      <tr>
                        <th className="px-4 py-3 font-medium">Roll Number</th>
                        <th className="px-4 py-3 font-medium">Filename</th>
                        <th className="px-4 py-3 font-medium">Uploaded At</th>
                        <th className="px-4 py-3 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {filteredCerts.map((cert) => (
                        <tr key={cert.id} className="hover:bg-zinc-800/50 transition-colors">
                          <td className="px-4 py-3 font-medium text-white">{cert.rollNumber}</td>
                          <td className="px-4 py-3 text-zinc-400 flex items-center gap-2">
                            <FileText size={14} className="text-cyan-400" />
                            {cert.fileName}
                          </td>
                          <td className="px-4 py-3 text-zinc-400">
                            {new Date(cert.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <a 
                                href={`/api/certificates/download?id=${cert.id}`} 
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-300 disabled:pointer-events-none disabled:opacity-50 border border-zinc-800 bg-transparent shadow-sm hover:bg-zinc-800 hover:text-zinc-50 h-8 px-3"
                              >
                                View
                              </a>
                              <Button 
                                variant="destructive" 
                                size="sm" 
                                onClick={() => handleDelete(cert.id)}
                                className="bg-red-900/50 text-red-400 hover:bg-red-900/80"
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
