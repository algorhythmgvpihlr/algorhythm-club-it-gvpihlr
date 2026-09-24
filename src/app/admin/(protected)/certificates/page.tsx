import { prisma } from "@/lib/prisma";
import CertificateManager from "./CertificateManager";
import { getCertificateStats } from "@/app/actions/certificate";

export default async function CertificatesPage({
  searchParams,
}: {
  searchParams: Promise<{ event?: string }>;
}) {
  const resolvedParams = await searchParams;
  const selectedEventId = resolvedParams.event;

  // Fetch events for the dropdown
  const events = await prisma.event.findMany({
    orderBy: { startDate: "desc" },
    select: { id: true, title: true, status: true },
  });

  const stats = await getCertificateStats(selectedEventId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Certificates</h1>
        <p className="text-zinc-400 mt-2">
          Manage and issue certificates for AlgoRhythm events.
        </p>
      </div>

      <CertificateManager 
        events={events} 
        selectedEventId={selectedEventId} 
        stats={stats} 
      />
    </div>
  );
}
