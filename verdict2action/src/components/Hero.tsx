"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Shield, ArrowRight } from "lucide-react";

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], [0, 80]);

  const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15 } },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center overflow-hidden pt-[90px]"
    >
      {/* Subtle radial glow behind text */}
      <div className="absolute left-0 top-1/3 w-[600px] h-[600px] rounded-full bg-accent/[0.06] blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center py-12">
        {/* Left: Text Content */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="text-center lg:text-left"
        >
          <motion.h1
            variants={fadeUp}
            className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold leading-tight mb-6"
          >
            From Legal Text to{" "}
            <span className="bg-gradient-to-r from-accent to-[#F5D76E] bg-clip-text text-transparent">
              Action Plans
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-base sm:text-lg text-white/70 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed"
          >
            Transform complex court judgments into{" "}
            <span className="text-white/90 font-medium">AI-powered insights</span>,{" "}
            <span className="text-white/90 font-medium">verified decisions</span>, and{" "}
            <span className="text-white/90 font-medium">deadline tracking</span>{" "}
            — built for government departments that cannot afford to miss a directive.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-6"
          >
            <button
              onClick={() => scrollTo("upload")}
              className="group relative px-8 py-3.5 bg-primary rounded-lg font-medium text-white text-sm tracking-wide overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(212,175,55,0.2)]"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Upload Judgment
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            <button
              onClick={() => scrollTo("dashboard")}
              className="px-8 py-3.5 glass rounded-lg font-medium text-white text-sm tracking-wide hover:bg-white/15 transition-all duration-300 hover:scale-105"
            >
              View Dashboard
            </button>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="flex items-center gap-2 justify-center lg:justify-start text-white/50 text-xs tracking-wider"
          >
            <Shield size={14} className="text-accent/70" />
            <span>Trusted for government decision support</span>
          </motion.div>
        </motion.div>

        {/* Right: Justice Lady Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative flex justify-center lg:justify-end"
        >
          {/* Halo glow behind image */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-accent/[0.12] blur-[100px] pointer-events-none" />

          <motion.div
            style={{ y: imageY }}
            className="relative"
          >
            <motion.img
              src="/justice-lady.png"
              alt="Lady Justice — Symbol of fair and balanced judgment"
              className="relative z-10 w-[336px] sm:w-[408px] lg:w-[504px] h-auto drop-shadow-2xl"
              animate={{
                y: [0, -14, 0, -6, 0],
                x: [0, 5, 0, -5, 0],
                scale: [1, 1.015, 1, 1.01, 1],
                rotate: [0, 0.8, 0, -0.8, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
                times: [0, 0.25, 0.5, 0.75, 1],
              }}
              whileHover={{ rotate: 2, scale: 1.04, transition: { duration: 0.4 } }}
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
