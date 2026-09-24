import { getTeamMembers } from "@/app/actions/team";
import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

export default async function TeamPage() {
  const members = await getTeamMembers();

  const grouped = members.reduce((acc, member) => {
    if (!acc[member.category]) acc[member.category] = [];
    acc[member.category].push(member);
    return acc;
  }, {} as Record<string, typeof members>);

  const categories = [
    { key: "FOUNDER", label: "Founder" },
    { key: "BOARD_26_27", label: "Board Members 2026-2027" },
    { key: "BOARD_24_26", label: "Board Members 2024-2026" },
    { key: "VOLUNTEER", label: "Volunteers" },
    { key: "FACULTY", label: "Faculty Coordinators" },
  ];

  return (
    <div className="pt-32 pb-24 container mx-auto px-4 min-h-screen">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Our Team</h1>
        <p className="text-xl text-zinc-400">Meet the dedicated individuals behind AlgoRhythm Club.</p>
      </div>

      {categories.map(({ key, label }) => {
        const categoryMembers = grouped[key];
        if (!categoryMembers?.length) return null;

        return (
          <section key={key} className="mb-20">
            <h2 className="text-2xl font-bold text-white mb-8 border-b border-zinc-800 pb-4">{label}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {categoryMembers.map(member => (
                <Card key={member.id} className="bg-zinc-900 border-zinc-800 overflow-hidden hover:border-zinc-700 transition-colors">
                  <div className="aspect-square bg-zinc-800 relative">
                    {member.photoUrl ? (
                      <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-600">
                        <Users size={64} />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-6 text-center">
                    <h3 className="text-xl font-bold text-white mb-1">{member.name}</h3>
                    <p className="text-cyan-400 font-medium text-sm mb-2">{member.position}</p>
                    {member.designation && <p className="text-zinc-500 text-sm">{member.designation}</p>}
                    {member.branch && <p className="text-zinc-500 text-sm">{member.branch}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
