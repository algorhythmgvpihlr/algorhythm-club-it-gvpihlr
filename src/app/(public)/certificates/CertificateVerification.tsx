"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, Download, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { verifyCertificate } from "@/app/actions/certificate";

type Event = { id: string; title: string };

export default function CertificateVerification({ events }: { events: Event[] }) {
  const [eventId, setEventId] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId || !rollNumber) return;

    setIsLoading(true);
    setError(false);
    setResult(null);

    try {
      const cert = await verifyCertificate(eventId, rollNumber);
      if (cert) {
        setResult(cert);
      } else {
        setError(true);
      }
    } catch (err) {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-zinc-900 border-zinc-800 text-zinc-100 shadow-2xl shadow-cyan-900/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="text-cyan-400" />
          Lookup Certificate
        </CardTitle>
        <CardDescription className="text-zinc-400">
          Select the event you attended and enter your official roll number.
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleVerify}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="text-zinc-300">Step 1: Select Event</Label>
            <Select value={eventId} onValueChange={(val) => setEventId(val || "")} required>
              <SelectTrigger className="w-full bg-zinc-950 border-zinc-800 focus:ring-cyan-500">
                <SelectValue placeholder="Choose an event..." />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                {events.length === 0 ? (
                  <SelectItem value="none" disabled>No certificates available yet</SelectItem>
                ) : (
                  events.map(event => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-300">Step 2: Enter Roll Number</Label>
            <Input 
              placeholder="e.g., 22IT001" 
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value.toUpperCase())}
              required
              className="bg-zinc-950 border-zinc-800 focus-visible:ring-cyan-500 uppercase placeholder:normal-case"
            />
          </div>

          {result && (
            <div className="p-4 bg-cyan-950/30 border border-cyan-800/50 rounded-lg flex flex-col items-center text-center space-y-3 animate-in fade-in slide-in-from-bottom-2">
              <CheckCircle2 className="text-cyan-400 h-12 w-12" />
              <div>
                <h3 className="font-bold text-lg text-white">Certificate Found!</h3>
                <p className="text-sm text-zinc-300 mt-1">
                  Verified for {result.rollNumber} • {result.eventTitle}
                </p>
              </div>
              <Button 
                type="button"
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold mt-2"
                onClick={() => window.open(`/api/certificates/download?id=${result.id}`, '_blank')}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Certificate
              </Button>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-950/30 border border-red-900/50 rounded-lg flex flex-col items-center text-center space-y-2 animate-in fade-in slide-in-from-bottom-2">
              <XCircle className="text-red-400 h-10 w-10" />
              <div>
                <h3 className="font-bold text-red-200">Certificate Not Found</h3>
                <p className="text-sm text-red-300/80 mt-1">
                  Please check your event and roll number and try again.
                </p>
              </div>
            </div>
          )}

        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white transition-all"
            disabled={isLoading || !eventId || !rollNumber || events.length === 0}
          >
            {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : "Verify Certificate"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
