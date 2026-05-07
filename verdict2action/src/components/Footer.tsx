"use client";

import { motion } from "framer-motion";

export default function Footer() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="border-t border-white/10 py-10 px-6"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Verdict 2 Action" className="h-14 w-auto opacity-70" />
          <div>
            <p className="text-sm font-serif font-semibold text-white/70">Verdict 2 Action</p>
            <p className="text-xs text-white/40">
              No missed directives. No missed deadlines.
            </p>
          </div>
        </div>

        <div className="flex gap-6">
          {[
            { label: "About", id: "about" },
            { label: "Dashboard", id: "dashboard" },
            { label: "Analytics", id: "analytics" },
          ].map((link) => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className="text-xs text-white/40 hover:text-accent transition-colors"
            >
              {link.label}
            </button>
          ))}
        </div>

        <p className="text-xs text-white/30">
          © 2024 Verdict 2 Action. Built for governance.
        </p>
      </div>
    </motion.footer>
  );
}
