import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, BookOpen, Clock } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  const [
    teamCount,
    eventCount,
    magazineCount,
    recentEvents,
  ] = await Promise.all([
    prisma.teamMember.count(),
    prisma.event.count(),
    prisma.magazine.count(),
    prisma.event.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Dashboard</h1>
        <p className="text-zinc-400">Overview of AlgoRhythm Club's platform.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Total Team Members</CardTitle>
            <Users className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{teamCount}</div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{eventCount}</div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Total Magazines</CardTitle>
            <BookOpen className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{magazineCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Recent Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentEvents.map(event => (
                <div key={event.id} className="flex items-center justify-between border-b border-zinc-800 pb-4 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-zinc-100">{event.title}</p>
                    <p className="text-sm text-zinc-400">{new Date(event.startDate).toLocaleDateString()}</p>
                  </div>
                  <div className="text-sm font-medium px-2 py-1 bg-zinc-800 rounded-md text-zinc-300">
                    {event.status}
                  </div>
                </div>
              ))}
              {recentEvents.length === 0 && (
                <p className="text-zinc-500 text-sm">No events found.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 bg-zinc-900 border-zinc-800 flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/admin/events" className="flex items-center gap-2 p-3 bg-zinc-800 rounded-md hover:bg-zinc-700 transition text-zinc-200">
              <Calendar size={18} className="text-cyan-500" />
              Manage Events
            </Link>
            <Link href="/admin/team" className="flex items-center gap-2 p-3 bg-zinc-800 rounded-md hover:bg-zinc-700 transition text-zinc-200">
              <Users size={18} className="text-violet-500" />
              Manage Team
            </Link>
            <Link href="/admin/magazines" className="flex items-center gap-2 p-3 bg-zinc-800 rounded-md hover:bg-zinc-700 transition text-zinc-200">
              <BookOpen size={18} className="text-green-500" />
              Manage Magazines
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
