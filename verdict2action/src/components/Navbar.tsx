"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    // Check auth status
    setIsLoggedIn(!!localStorage.getItem("v2a_token"));
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleAuth = () => {
    if (isLoggedIn) {
      localStorage.removeItem("v2a_token");
      localStorage.removeItem("v2a_user");
      setIsLoggedIn(false);
      window.location.href = "/";
    } else {
      router.push("/login");
    }
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-black/40 backdrop-blur-md border-b border-white/10 shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between h-[90px]">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <img
            src="/logo.png"
            alt="Verdict 2 Action Logo"
            className="h-[70px] w-auto"
          />
          <span className="hidden sm:inline font-serif text-lg font-semibold text-white group-hover:text-accent transition-colors duration-200">
            Verdict 2 Action
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { label: "Upload", id: "upload" },
            { label: "Dashboard", id: "dashboard" },
            { label: "Analytics", id: "analytics" },
            { label: "About", id: "about" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className="text-sm text-white/80 hover:text-accent transition-colors duration-200 tracking-wide"
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={handleAuth}
            className={`text-sm px-4 py-2 rounded-lg font-medium transition-colors duration-200 ml-2 ${
              isLoggedIn 
                ? "text-white/60 hover:bg-white/10" 
                : "bg-primary text-white hover:bg-primary-hover"
            }`}
          >
            {isLoggedIn ? "Logout" : "Login"}
          </button>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-white/80 hover:text-accent transition-colors"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden bg-black/60 backdrop-blur-lg border-t border-white/10 px-6 py-4 space-y-3"
        >
          {[
            { label: "Upload", id: "upload" },
            { label: "Dashboard", id: "dashboard" },
            { label: "Analytics", id: "analytics" },
            { label: "About", id: "about" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className="block w-full text-left text-white/80 hover:text-accent transition-colors py-2 text-sm"
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => {
              setMobileOpen(false);
              handleAuth();
            }}
            className="block w-full text-left text-accent hover:text-white transition-colors py-2 text-sm font-medium"
          >
            {isLoggedIn ? "Logout" : "Login"}
          </button>
        </motion.div>
      )}
    </motion.nav>
  );
}
