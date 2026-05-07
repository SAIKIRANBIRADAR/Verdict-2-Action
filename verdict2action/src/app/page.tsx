"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import UploadSection from "@/components/UploadSection";
import OutputSelector from "@/components/OutputSelector";
import CaseTable from "@/components/CaseTable";
import Analytics from "@/components/Analytics";
import About from "@/components/About";
import Footer from "@/components/Footer";

type Step = "upload" | "output";

export default function Home() {
  const [step, setStep] = useState<Step>("upload");
  const router = useRouter();

  return (
    <>
      <Navbar />
      <Hero />

      <AnimatePresence mode="wait">
        {step === "upload" && (
          <motion.div
            key="upload"
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <UploadSection onProcessingComplete={() => setStep("output")} />
          </motion.div>
        )}

        {step === "output" && (
          <motion.div
            key="output"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <OutputSelector />
          </motion.div>
        )}
      </AnimatePresence>

      <CaseTable />
      <Analytics />
      <About />
      <Footer />
    </>
  );
}
