import Link from "next/link";
import { WebsiteSettings } from "@prisma/client";

export default function Footer({ settings }: { settings: WebsiteSettings }) {
  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Team", href: "/team" },
    { name: "Events", href: "/events" },
    { name: "Magazines", href: "/magazines" },
    { name: "Certificates", href: "/certificates" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <footer className="bg-zinc-950 border-t border-zinc-900 pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          
          <div className="space-y-4">
            <div className="flex flex-col space-y-1 mb-6">
              <span className="text-sm font-semibold text-zinc-400">
                Gayatri Vidya Parishad<br/>
                Institute of Higher Learning and Research
              </span>
              <span className="text-xs text-zinc-500">GVPIHLR</span>
            </div>
            
            <Link href="/" className="inline-block group">
              <div className="flex flex-col">
                <span className="font-bold text-xl tracking-tight text-white uppercase group-hover:text-cyan-400 transition-colors">
                  ALGORHYTHM-IT CLUB
                </span>
                <span className="text-xs text-zinc-400">
                  Technical Club of IT Department, GVPIHLR
                </span>
              </div>
            </Link>
            
            <p className="text-zinc-500 max-w-sm text-sm mt-4">
              {settings.description}
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map(link => (
                <li key={link.name}>
                  <Link href={link.href} className="text-zinc-400 hover:text-cyan-400 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Connect</h3>
            <ul className="space-y-2">
              {settings.whatsappUrl && (
                <li>
                  <a href={settings.whatsappUrl} target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-green-400 transition-colors">
                    WhatsApp Community
                  </a>
                </li>
              )}
              {settings.instagramUrl && (
                <li>
                  <a href={settings.instagramUrl} target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-pink-400 transition-colors">
                    Instagram
                  </a>
                </li>
              )}
              {settings.linkedinUrl && (
                <li>
                  <a href={settings.linkedinUrl} target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-blue-400 transition-colors">
                    LinkedIn
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-zinc-900 pt-8 text-center text-zinc-600 text-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <p>{settings.footerText}</p>
          <p className="text-xs text-zinc-700">GVPIHLR IT Department</p>
        </div>
      </div>
    </footer>
  );
}
