"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import { WebsiteSettings } from "@prisma/client";

export default function Navbar({
  settings,
}: {
  settings?: WebsiteSettings | null;
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100);

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Team", href: "/team" },
    { name: "Events", href: "/events" },
    { name: "Magazines", href: "/magazines" },
    { name: "Certificates", href: "/certificates" },
    { name: "Contact", href: "/contact" },
  ];

  const gvpihlrLogo = settings?.gvpihlrLogoFileId
    ? `/api/media/${settings.gvpihlrLogoFileId}`
    : "/api/media/1eIjTCmN1tN9p7VAhwoIHm5Tv3kfBDTxl";

  const algorhythmLogo = settings?.algorhythmLogoFileId
    ? `/api/media/${settings.algorhythmLogoFileId}`
    : "/api/media/1MksFuGHsvPK1lKR2VpWwpDLBUFzVYRtA";

  return (
    <>
      {/* =========================================================
          SECTION 1: INSTITUTIONAL HEADER
      ========================================================= */}
      <div className="w-full bg-white text-zinc-900 border-b border-zinc-200">

        <div className="container mx-auto px-4 md:px-8 py-2 md:py-3">

          {/* Desktop / Tablet */}
          <div className="hidden md:flex justify-between items-start w-full relative">

            {/* LEFT SIDE */}
            <div className="flex flex-col items-center w-[160px] lg:w-[190px] shrink-0">

              <span className="text-[11px] lg:text-xs font-bold text-[#1a237e] mb-2 w-full text-left tracking-wide">
                GVP – Estd. 1988
              </span>

              <a
                href="https://gvpihlr.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-1"
              >
                <img
                  src={gvpihlrLogo}
                  alt="GVPIHLR Logo"
                  className="h-16 lg:h-20 w-auto object-contain hover:opacity-90 transition-opacity"
                />
              </a>

            </div>

            {/* CENTER */}
            <div className="flex flex-col justify-center text-center items-center flex-1 px-4 lg:px-8 pt-1">

              <h1 className="text-lg lg:text-2xl font-extrabold tracking-tight text-[#800000] uppercase leading-tight">
                GAYATRI VIDYA PARISHAD
              </h1>

              <h2 className="text-sm lg:text-lg font-bold text-[#800000] uppercase mt-1 leading-tight">
                INSTITUTE OF HIGHER LEARNING AND RESEARCH
              </h2>

              <p className="text-[11px] lg:text-xs font-medium text-zinc-800 mt-2">
                (Deemed to be University under Distinct Category under Section 3 of the UGC Act, 1956)
              </p>

              <p className="text-[11px] lg:text-xs text-zinc-700 mt-1">
                Kommadi, Madhurawada, Visakhapatnam – 530 048, Andhra Pradesh
              </p>

            </div>

            {/* RIGHT SIDE */}
            <div className="flex flex-col items-end w-[160px] lg:w-[190px] shrink-0">

              <span className="text-[11px] lg:text-xs font-bold text-[#1a237e] w-full text-right tracking-wide">
                GVPIHLR – Estd. 2026
              </span>

            </div>

          </div>

          {/* =====================================================
              MOBILE
          ===================================================== */}
          <div className="flex flex-col md:hidden items-center text-center">

            <div className="w-full flex justify-between items-center mb-3">

              <span className="text-[10px] font-bold text-[#1a237e] tracking-wide">
                GVP – Estd. 1988
              </span>

              <span className="text-[10px] font-bold text-[#1a237e] tracking-wide">
                GVPIHLR – Estd. 2026
              </span>

            </div>

            <a
              href="https://gvpihlr.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="block mb-3"
            >
              <img
                src={gvpihlrLogo}
                alt="GVPIHLR Logo"
                className="h-16 w-auto object-contain hover:opacity-90 transition-opacity"
              />
            </a>

            <h1 className="text-sm font-extrabold tracking-tight text-[#800000] uppercase leading-tight">
              GAYATRI VIDYA PARISHAD
            </h1>

            <h2 className="text-[11px] font-bold text-[#800000] uppercase mt-1 leading-tight">
              INSTITUTE OF HIGHER LEARNING AND RESEARCH
            </h2>

            <p className="text-[9px] font-medium text-zinc-800 mt-2 px-2 leading-tight">
              (Deemed to be University under Distinct Category under Section 3 of the UGC Act, 1956)
            </p>

            <p className="text-[9px] text-zinc-700 mt-1 px-2 leading-tight">
              Kommadi, Madhurawada, Visakhapatnam – 530 048, Andhra Pradesh
            </p>

          </div>

        </div>
      </div>

      {/* =========================================================
          SECTION 2: ALGORHYTHM NAVIGATION
      ========================================================= */}
      <header
        className={`sticky top-0 w-full z-50 transition-all duration-300 ${isScrolled
          ? "bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800 shadow-lg py-2 md:py-3"
          : "bg-zinc-950 border-b border-zinc-900 py-3 md:py-4"
          }`}
      >

        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">

          {/* LOGO + CLUB TITLE */}
          <div className="flex items-center gap-3 md:gap-4">

            <Link
              href="/"
              className="flex items-center gap-3 md:gap-4 group"
            >

              <img
                src={algorhythmLogo}
                alt="AlgoRhythm IT Club logo"
                className="h-9 md:h-11 w-auto object-contain"
              />

              <div className="flex flex-col">

                <span className="font-bold text-lg md:text-xl tracking-tight text-white uppercase leading-tight group-hover:text-cyan-400 transition-colors">
                  ALGORHYTHM-IT CLUB
                </span>

                <span className="text-[10px] md:text-xs text-zinc-400 hidden sm:block">
                  Technical Club of IT Department, GVPIHLR
                </span>

              </div>

            </Link>

          </div>

          {/* DESKTOP NAVIGATION */}
          <nav className="hidden xl:flex items-center gap-8">

            <div className="flex gap-6">

              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-sm font-medium text-zinc-300 hover:text-cyan-400 transition-colors"
                >
                  {link.name}
                </Link>
              ))}

            </div>

            <Link href="/admin/login">
              <Button
                variant="outline"
                size="sm"
                className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 h-9"
              >
                Admin
              </Button>
            </Link>

          </nav>

          {/* MOBILE MENU BUTTON */}
          <button
            className="xl:hidden text-zinc-300 hover:text-white transition-colors p-1"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X size={28} />
            ) : (
              <Menu size={28} />
            )}
          </button>

        </div>

        {/* MOBILE MENU */}
        {isMobileMenuOpen && (
          <div className="xl:hidden absolute top-full left-0 w-full bg-zinc-900 border-b border-zinc-800 shadow-2xl overflow-hidden max-h-[80vh] overflow-y-auto">

            <div className="flex flex-col p-4 space-y-2">

              <div className="sm:hidden mb-4 pb-4 border-b border-zinc-800">

                <span className="text-xs text-zinc-400 block px-2">
                  Technical Club of IT Department, GVPIHLR
                </span>

              </div>

              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-zinc-200 font-medium p-3 hover:bg-zinc-800 hover:text-cyan-400 rounded-md transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}

              <div className="pt-4 mt-2 border-t border-zinc-800">

                <Link
                  href="/admin/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button className="w-full bg-zinc-800 text-white hover:bg-zinc-700 h-12 text-base">
                    Admin Login
                  </Button>
                </Link>

              </div>

            </div>
          </div>
        )}

      </header>
    </>
  );
}