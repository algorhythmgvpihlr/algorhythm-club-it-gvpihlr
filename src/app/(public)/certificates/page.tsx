import { prisma } from "@/lib/prisma";
import CertificateVerification from "./CertificateVerification";

export const metadata = {
  title: "Verify Certificate | AlgoRhythm Club",
  description: "Verify and download your AlgoRhythm Club event certificate.",
};

export default async function CertificatesPage() {
  // Only fetch events that actually have certificates
  const events = await prisma.event.findMany({
    where: {
      certificates: {
        some: {} // Has at least one certificate
      }
    },
    orderBy: { startDate: "desc" },
    select: { id: true, title: true }
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pt-32 pb-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Certificate <span className="text-cyan-400">Verification</span>
          </h1>
          <p className="text-lg text-zinc-400">
            Verify and download your AlgoRhythm Club event certificate securely.
          </p>
        </div>

        <div className="max-w-xl mx-auto">
          <CertificateVerification events={events} />
        </div>
      </div>
    </div>
  );
}
