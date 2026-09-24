import { getEvents, deleteEvent } from "@/app/actions/event";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, FileBadge } from "lucide-react";
import Link from "next/link";
import { EventForm } from "./EventForm";

export default async function AdminEventsPage() {
  const events = await getEvents();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Event Management</h1>
          <p className="text-muted-foreground">Manage all club events and hackathons.</p>
        </div>
        <EventForm />
      </div>

      <Card className="bg-card border-border shadow-none">
        <CardHeader>
          <CardTitle className="text-foreground">All Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted">
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Title</TableHead>
                  <TableHead className="text-muted-foreground">Date</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground">Registration</TableHead>
                  <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.length === 0 ? (
                  <TableRow className="border-border hover:bg-muted/50">
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No events found.
                    </TableCell>
                  </TableRow>
                ) : (
                  events.map((event) => (
                    <TableRow key={event.id} className="border-border hover:bg-muted/50">
                      <TableCell className="font-medium text-foreground">{event.title}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(event.startDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <span className="inline-flex items-center rounded-full bg-muted border border-border px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                          {event.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          event.registrationStatus === "OPEN" ? "bg-tech-teal/20 text-tech-teal border border-tech-teal/30" : "bg-muted border border-border text-muted-foreground"
                        }`}>
                          {event.registrationStatus.replace("_", " ")}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/certificates?event=${event.id}`}>
                            <Button variant="outline" size="sm" className="h-8 border-zinc-700 bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700">
                              <FileBadge size={14} className="mr-1.5" />
                              Certs
                            </Button>
                          </Link>
                          <EventForm event={event} />
                          <form action={async () => {
                            "use server";
                            await deleteEvent(event.id);
                          }}>
                            <Button variant="ghost" size="icon" type="submit" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                              <Trash2 size={16} />
                            </Button>
                          </form>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
