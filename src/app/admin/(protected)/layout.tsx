import { ReactNode } from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  BookOpen, 
  Image as ImageIcon, 
  Settings,
  FileBadge,
} from "lucide-react";
import { LogoutButton } from "./components/LogoutButton";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/admin/login");
  }

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { href: "/admin/team", label: "Team", icon: <Users size={20} /> },
    { href: "/admin/events", label: "Events", icon: <Calendar size={20} /> },
    { href: "/admin/certificates", label: "Certificates", icon: <FileBadge size={20} /> },
    { href: "/admin/magazines", label: "Magazines", icon: <BookOpen size={20} /> },
    { href: "/admin/gallery", label: "Gallery", icon: <ImageIcon size={20} /> },
    { href: "/admin/settings", label: "Settings", icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 dark">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col h-full hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-zinc-800">
          <Link href="/admin" className="font-bold text-xl text-white flex items-center gap-2">
            <span className="text-cyan-400">Algo</span>Rhythm
          </Link>
        </div>
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-zinc-800">
          <div className="mb-4 px-2">
            <p className="text-sm font-medium text-white">{session.user.name}</p>
            <p className="text-xs text-zinc-400">{session.user.role}</p>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header (minimal) */}
        <header className="h-16 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-4 md:hidden">
          <Link href="/admin" className="font-bold text-lg text-white">
            <span className="text-cyan-400">Algo</span>Rhythm Admin
          </Link>
          <LogoutButton mobile />
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
