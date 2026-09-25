"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Upload, Trash2, FileText, Loader2, AlertCircle, Database } from "lucide-react";
import { getEventCertificates, deleteCertificate, uploadCertificates } from "@/app/actions/certificate";

type Event = { id: string; title: string; status: string };
type Stats = { total: number; lastUploaded: Date | null };
type Certificate = { id: string; rollNumber: string | null; studentName: string | null; fileName: string; mimeType: string; createdAt: Date };

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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadResults, setUploadResults] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [manualRollNumber, setManualRollNumber] = useState("");
  const [manualStudentName, setManualStudentName] = useState("");

  useEffect(() => {
    if (selectedEventId) {
      loadCertificates();
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(Array.from(e.target.files));
      setUploadResults(null);
    }
  };

  const handleImport = async () => {
    if (selectedFiles.length === 0 || !selectedEventId) return;

    setUploading(true);
    setUploadResults(null);
    
    try {
      const formData = new FormData();
      selectedFiles.forEach(file => formData.append("files", file));
      if (manualRollNumber.trim()) formData.append("rollNumber", manualRollNumber.trim());
      if (manualStudentName.trim()) formData.append("studentName", manualStudentName.trim());
      
      toast.info("Uploading and processing files. This may take a few moments...");
      
      const result = await uploadCertificates(selectedEventId, formData);
      
      if (result) {
        setUploadResults(result);
        
        if (result.successful > 0) {
          toast.success(`Processed ${result.successful} certificates successfully!`);
        } else if (result.total === 0) {
          toast.info("No valid certificates found.");
        } else {
          toast.error("Failed to process any certificates.");
        }
        
        loadCertificates();
      }
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
      setSelectedFiles([]);
      setManualRollNumber("");
      setManualStudentName("");
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
    (c.rollNumber?.toLowerCase() || "").includes(search.toLowerCase()) || 
    (c.studentName?.toLowerCase() || "").includes(search.toLowerCase())
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
                Upload multiple certificates (PDF, JPG, PNG, WEBP) or a ZIP file containing them. Information will be inferred from filenames when possible.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Roll Number (Optional, overrides filename)</label>
                  <Input 
                    placeholder="e.g., 22IT001" 
                    value={manualRollNumber}
                    onChange={e => setManualRollNumber(e.target.value)}
                    disabled={uploading}
                    className="bg-zinc-950 border-zinc-800 uppercase"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Student Name (Optional, overrides filename)</label>
                  <Input 
                    placeholder="e.g., John Doe" 
                    value={manualStudentName}
                    onChange={e => setManualStudentName(e.target.value)}
                    disabled={uploading}
                    className="bg-zinc-950 border-zinc-800"
                  />
                </div>
              </div>
              
              <div className="flex flex-col gap-4">
                {selectedFiles.length === 0 ? (
                  <div>
                    <input
                      type="file"
                      id="cert-upload"
                      accept=".pdf,.jpg,.jpeg,.png,.webp,.zip"
                      multiple
                      className="hidden"
                      onChange={handleFileChange}
                      disabled={uploading}
                    />
                    <label 
                      htmlFor="cert-upload"
                      className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-300 disabled:pointer-events-none disabled:opacity-50 bg-cyan-600 text-white hover:bg-cyan-700 h-9 px-4 py-2 w-full sm:w-auto"
                    >
                      <Database className="mr-2" size={16} />
                      Choose Files
                    </label>
                  </div>
                ) : (
                  <div className="p-4 rounded-md bg-zinc-950 border border-zinc-800 space-y-4">
                    <div>
                      <h4 className="font-medium text-zinc-200">Selected Files ({selectedFiles.length}):</h4>
                      {selectedFiles.length === 1 ? (
                        <>
                          <p className="text-zinc-400 text-sm">{selectedFiles[0].name}</p>
                          <p className="text-zinc-500 text-xs mt-1">
                            Size: {(selectedFiles[0].size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </>
                      ) : (
                        <p className="text-zinc-400 text-sm">
                          {selectedFiles.length} files selected (Total size: {(selectedFiles.reduce((acc, f) => acc + f.size, 0) / (1024 * 1024)).toFixed(2)} MB)
                        </p>
                      )}
                    </div>
                    
                    <div className="flex gap-3">
                      <Button 
                        variant="outline" 
                        onClick={() => setSelectedFiles([])}
                        disabled={uploading}
                        className="border-zinc-700 text-zinc-300"
                      >
                        Change Files
                      </Button>
                      <Button 
                        onClick={handleImport}
                        disabled={uploading}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white"
                      >
                        {uploading ? <Loader2 className="animate-spin mr-2" size={16} /> : <Upload className="mr-2" size={16} />}
                        Import Certificates
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {uploadResults && (
                <div className="mt-6 p-4 rounded-md bg-zinc-950 border border-zinc-800">
                  <h4 className="font-semibold mb-4 text-cyan-400">Processing Results</h4>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 text-center">
                    <div className="bg-zinc-900 rounded p-2 border border-zinc-800">
                      <div className="text-2xl font-bold text-zinc-200">{uploadResults.total}</div>
                      <div className="text-xs text-zinc-400">Files Found</div>
                    </div>
                    <div className="bg-zinc-900 rounded p-2 border border-zinc-800">
                      <div className="text-2xl font-bold text-zinc-200">{uploadResults.successful + uploadResults.duplicates + uploadResults.invalid + uploadResults.failed}</div>
                      <div className="text-xs text-zinc-400">Processed</div>
                    </div>
                    <div className="bg-zinc-900 rounded p-2 border border-zinc-800">
                      <div className="text-2xl font-bold text-green-400">{uploadResults.successful}</div>
                      <div className="text-xs text-zinc-400">Successful</div>
                    </div>
                    <div className="bg-zinc-900 rounded p-2 border border-zinc-800">
                      <div className="text-2xl font-bold text-red-400">{uploadResults.duplicates + uploadResults.invalid + uploadResults.failed}</div>
                      <div className="text-xs text-zinc-400">Skipped</div>
                    </div>
                  </div>

                  {uploadResults.messages && uploadResults.messages.length > 0 && (
                    <div className="mt-4">
                      <h5 className="text-sm font-medium text-zinc-300 mb-2">Skipped Files & Reasons</h5>
                      <div className="overflow-x-auto border border-zinc-800 rounded-md">
                        <table className="w-full text-sm text-left">
                          <thead className="text-xs text-zinc-400 uppercase bg-zinc-900">
                            <tr>
                              <th className="px-3 py-2 font-medium">Filename</th>
                              <th className="px-3 py-2 font-medium">Reason</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-800 bg-zinc-950">
                            {uploadResults.messages.map((msg: string, i: number) => {
                              const parts = msg.split(': ');
                              const filename = parts[0];
                              const reason = parts.slice(1).join(': ');
                              return (
                                <tr key={i}>
                                  <td className="px-3 py-2 text-zinc-300 font-mono text-xs">{filename}</td>
                                  <td className="px-3 py-2 text-red-400">{reason || msg}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
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
                        <th className="px-4 py-3 font-medium">Student Name</th>
                        <th className="px-4 py-3 font-medium">Roll Number</th>
                        <th className="px-4 py-3 font-medium">Filename</th>
                        <th className="px-4 py-3 font-medium">File Type</th>
                        <th className="px-4 py-3 font-medium">Uploaded At</th>
                        <th className="px-4 py-3 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {filteredCerts.map((cert) => (
                        <tr key={cert.id} className="hover:bg-zinc-800/50 transition-colors">
                          <td className="px-4 py-3 text-white">{cert.studentName || <span className="text-zinc-500 italic">Not provided</span>}</td>
                          <td className="px-4 py-3 font-medium text-white">{cert.rollNumber || <span className="text-zinc-500 italic">Not provided</span>}</td>
                          <td className="px-4 py-3 text-zinc-400 flex items-center gap-2">
                            <FileText size={14} className="text-cyan-400" />
                            {cert.fileName}
                          </td>
                          <td className="px-4 py-3 text-zinc-400 text-xs">
                            {cert.mimeType?.includes("pdf") ? "PDF" : "Image"}
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
