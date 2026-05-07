"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, BookOpen, Eye, Download, Languages } from "lucide-react";

export default function OutputSelector() {
  const [outputType, setOutputType] = useState<"highlight" | "brief">("brief");
  const [highlightBrief, setHighlightBrief] = useState(true);
  const [language, setLanguage] = useState<"english" | "hindi" | "kannada">("english");
  const [showResult, setShowResult] = useState(false);

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (showResult) {
    return (
      <section className="py-16 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-3xl mx-auto glass p-8 text-center"
        >
          <Eye size={40} className="mx-auto mb-4 text-accent" />
          <h3 className="text-xl font-serif font-semibold mb-2">Output Generated Successfully</h3>
          <p className="text-sm text-white/60 mb-4">
            {outputType === "highlight"
              ? "Your highlighted PDF is ready for review."
              : `Executive Brief generated in ${language.charAt(0).toUpperCase() + language.slice(1)}${highlightBrief ? " with highlights" : ""}.`}
          </p>
          <div className="flex gap-4 justify-center">
            <button className="px-6 py-2.5 bg-primary rounded-lg text-sm font-medium hover:scale-105 transition-transform flex items-center gap-2">
              <Eye size={16} /> View Output
            </button>
            <button className="px-6 py-2.5 glass rounded-lg text-sm font-medium hover:bg-white/15 transition-all flex items-center gap-2">
              <Download size={16} /> Download PDF
            </button>
          </div>
          <button
            onClick={() => setShowResult(false)}
            className="mt-4 text-xs text-white/40 hover:text-white/70 transition-colors"
          >
            ← Back to options
          </button>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="py-16 px-6">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        className="max-w-3xl mx-auto"
      >
        <motion.h2
          variants={fadeUp}
          className="text-2xl sm:text-3xl font-serif font-bold text-center mb-10"
        >
          How would you like your output?
        </motion.h2>

        {/* Output Type Cards */}
        <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {/* Highlight Card */}
          <button
            onClick={() => setOutputType("highlight")}
            className={`glass p-6 text-left transition-all duration-300 hover:scale-[1.02] ${
              outputType === "highlight"
                ? "border-accent/60 bg-white/15 shadow-[0_0_20px_rgba(212,175,55,0.1)]"
                : "hover:bg-white/12"
            }`}
          >
            <FileText size={28} className={outputType === "highlight" ? "text-accent" : "text-white/50"} />
            <h3 className="text-lg font-semibold mt-3 mb-2">Highlight Existing PDF</h3>
            <p className="text-sm text-white/60 leading-relaxed">
              View the original judgment with AI-highlighted directives and key sections
            </p>
          </button>

          {/* Executive Brief Card */}
          <button
            onClick={() => setOutputType("brief")}
            className={`glass p-6 text-left transition-all duration-300 hover:scale-[1.02] ${
              outputType === "brief"
                ? "border-accent/60 bg-white/15 shadow-[0_0_20px_rgba(212,175,55,0.1)]"
                : "hover:bg-white/12"
            }`}
          >
            <BookOpen size={28} className={outputType === "brief" ? "text-accent" : "text-white/50"} />
            <h3 className="text-lg font-semibold mt-3 mb-2">Generate Executive Brief</h3>
            <p className="text-sm text-white/60 leading-relaxed">
              Get a simplified 2–3 page summary with key actions, deadlines, and insights
            </p>
          </button>
        </motion.div>

        {/* Highlight Toggle (only for Executive Brief) */}
        {outputType === "brief" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="glass p-5 mb-6 flex items-center justify-between"
          >
            <span className="text-sm text-white/80">
              Highlight important sections in the generated brief
            </span>
            <button
              onClick={() => setHighlightBrief(!highlightBrief)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                highlightBrief ? "bg-accent" : "bg-white/20"
              }`}
            >
              <motion.div
                className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow"
                animate={{ left: highlightBrief ? "26px" : "2px" }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
          </motion.div>
        )}

        {/* Language Selection */}
        <motion.div variants={fadeUp} className="glass p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Languages size={18} className="text-accent" />
            <h3 className="text-sm font-semibold tracking-wide">Choose output language</h3>
          </div>

          <div className="flex flex-wrap gap-3">
            {(["english", "hindi", "kannada"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => outputType === "brief" && setLanguage(lang)}
                disabled={outputType === "highlight"}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  outputType === "highlight"
                    ? "opacity-40 cursor-not-allowed bg-white/5"
                    : language === lang
                    ? "bg-accent text-primary"
                    : "glass hover:bg-white/15"
                }`}
              >
                {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </button>
            ))}
          </div>

          {outputType === "highlight" && (
            <p className="text-xs text-white/40 mt-3">
              Translation is available only for generated briefs
            </p>
          )}
        </motion.div>

        {/* Action Buttons */}
        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => setShowResult(true)}
            className="px-8 py-3.5 bg-primary rounded-lg font-medium text-sm tracking-wide hover:scale-105 transition-all duration-300 hover:shadow-[0_0_25px_rgba(212,175,55,0.15)] flex items-center justify-center gap-2"
          >
            <Eye size={16} /> View Output
          </button>
          <button className="px-8 py-3.5 glass rounded-lg font-medium text-sm tracking-wide hover:bg-white/15 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2">
            <Download size={16} /> Download PDF
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
}
