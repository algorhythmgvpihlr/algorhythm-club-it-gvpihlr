"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "./ui/button";

export default function Navbar() {
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

  return (
    <>
      {/* SECTION 1: Institutional Header (Non-sticky) */}
      <div className="w-full bg-white text-zinc-900 border-b border-zinc-200">
        <div className="container mx-auto px-4 md:px-6 py-4 md:py-6">
          
          {/* Desktop/Tablet Layout */}
          <div className="hidden md:flex flex-col">
            <div className="flex justify-between items-center text-sm font-semibold text-zinc-600 mb-2">
              <span>GVP – Estd. 1988</span>
              <span>GVPIHLR – Estd. 2026</span>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="shrink-0">
                <a href="https://gvpihlr.in/" target="_blank" rel="noopener noreferrer" aria-label="Visit Gayatri Vidya Parishad Institute of Higher Learning and Research website" title="Visit GVPIHLR website" className="block">
                  <Image 
                    src="/images/gvpihlr-logo.jpg" 
                    alt="Gayatri Vidya Parishad Institute of Higher Learning and Research logo" 
                    width={100} 
                    height={100}
                    className="object-contain w-20 h-20 md:w-28 md:h-28"
                    priority
                  />
                </a>
              </div>
              
              <div className="flex flex-col justify-center text-center mx-auto items-center">
                <h1 className="text-xl md:text-3xl font-bold tracking-tight text-red-700 uppercase">
                  GAYATRI VIDYA PARISHAD
                </h1>
                <h2 className="text-lg md:text-xl font-bold text-zinc-800 uppercase mt-1">
                  INSTITUTE OF HIGHER LEARNING AND RESEARCH
                </h2>
                <p className="text-xs md:text-sm font-medium text-zinc-600 mt-2">
                  (Deemed to be University under Distinct Category under Section 3 of the UGC Act, 1956)
                </p>
                <p className="text-xs md:text-sm text-zinc-500 mt-1">
                  Kommadi, Madhurawada, Visakhapatnam – 530 048, Andhra Pradesh
                </p>
              </div>
              
              {/* Invisible spacer to balance the flex layout opposite the logo */}
              <div className="shrink-0 w-20 md:w-28 hidden lg:block"></div>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="flex flex-col md:hidden text-center">
            <div className="flex justify-between items-center text-xs font-semibold text-zinc-600 mb-4">
              <span>GVP – Estd. 1988</span>
              <span>GVPIHLR – Estd. 2026</span>
            </div>
            
            <div className="flex justify-center mb-3">
              <a href="https://gvpihlr.in/" target="_blank" rel="noopener noreferrer" aria-label="Visit Gayatri Vidya Parishad Institute of Higher Learning and Research website" title="Visit GVPIHLR website" className="block">
                <Image 
                  src="/images/gvpihlr-logo.jpg" 
                  alt="Gayatri Vidya Parishad Institute of Higher Learning and Research logo" 
                  width={80} 
                  height={80}
                  className="object-contain"
                  priority
                />
              </a>
            </div>
            
            <h1 className="text-lg font-bold tracking-tight text-red-700 uppercase leading-tight">
              GAYATRI VIDYA PARISHAD
            </h1>
            <h2 className="text-sm font-bold text-zinc-800 uppercase mt-1 leading-tight">
              INSTITUTE OF HIGHER LEARNING AND RESEARCH
            </h2>
            <p className="text-[10px] font-medium text-zinc-600 mt-2 px-2 leading-tight">
              (Deemed to be University under Distinct Category under Section 3 of the UGC Act, 1956)
            </p>
            <p className="text-[10px] text-zinc-500 mt-1 px-2 leading-tight">
              Kommadi, Madhurawada, Visakhapatnam – 530 048, Andhra Pradesh
            </p>
          </div>
          
        </div>
      </div>

      {/* SECTION 2: AlgoRhythm Club Header (Sticky, Dark Theme) */}
      <header 
        className={`sticky top-0 w-full z-50 transition-all duration-300 ${
          isScrolled 
            ? "bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800 shadow-lg py-2 md:py-3" 
            : "bg-zinc-950 border-b border-zinc-900 py-3 md:py-4"
        }`}
      >
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
          
          {/* Logo & Club Title */}
          <Link href="/" className="flex items-center gap-3 md:gap-4 group">
            <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-lg overflow-hidden shrink-0 border border-zinc-800 group-hover:border-cyan-500/50 transition-colors">
              <Image 
                src="/images/club-logo.jpg" 
                alt="AlgoRhythm IT Club logo"
                fill
                className="object-contain bg-zinc-950"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg md:text-xl tracking-tight text-white uppercase leading-tight group-hover:text-cyan-400 transition-colors">
                ALGORHYTHM-IT CLUB
              </span>
              <span className="text-[10px] md:text-xs text-zinc-400 hidden sm:block">
                Technical Club of IT Department, GVPIHLR
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden xl:flex items-center gap-8">
            <div className="flex gap-6">
              {navLinks.map(link => (
                <Link key={link.name} href={link.href} className="text-sm font-medium text-zinc-300 hover:text-cyan-400 transition-colors">
                  {link.name}
                </Link>
              ))}
            </div>
            <Link href="/admin/login">
              <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 h-9">
                Admin
              </Button>
            </Link>
          </nav>

          {/* Mobile Toggle */}
          <button 
            className="xl:hidden text-zinc-300 hover:text-white transition-colors p-1"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="xl:hidden absolute top-full left-0 w-full bg-zinc-900 border-b border-zinc-800 shadow-2xl overflow-hidden max-h-[80vh] overflow-y-auto">
            <div className="flex flex-col p-4 space-y-2">
              <div className="sm:hidden mb-4 pb-4 border-b border-zinc-800">
                <span className="text-xs text-zinc-400 block px-2">
                  Technical Club of IT Department, GVPIHLR
                </span>
              </div>
              {navLinks.map(link => (
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
                <Link href="/admin/login" onClick={() => setIsMobileMenuOpen(false)}>
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
