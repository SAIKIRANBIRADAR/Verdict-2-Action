"use client";

import { motion } from "framer-motion";
import {
  FileSearch,
  BookOpen,
  Brain,
  Languages,
  UserCheck,
  BarChart3,
  LayoutDashboard,
  BellRing,
} from "lucide-react";

const features = [
  {
    icon: <FileSearch size={24} />,
    title: "Smart Highlight View",
    desc: "AI-powered highlighting of critical directives in court judgments",
  },
  {
    icon: <BookOpen size={24} />,
    title: "Executive Brief Generator",
    desc: "Simplified 2–3 page summaries with key actions and deadlines",
  },
  {
    icon: <Brain size={24} />,
    title: "AI Action Plan Engine",
    desc: "Automated compliance or appeal suggestions with reasoning",
  },
  {
    icon: <Languages size={24} />,
    title: "Translation Support",
    desc: "Generate briefs in English, Hindi, and Kannada",
  },
  {
    icon: <UserCheck size={24} />,
    title: "Human Verification Layer",
    desc: "Editable structured output for official review and approval",
  },
  {
    icon: <BarChart3 size={24} />,
    title: "Compliance Tracker",
    desc: "Monitor deadlines and compliance status across all cases",
  },
  {
    icon: <LayoutDashboard size={24} />,
    title: "Department Dashboard",
    desc: "Centralized case management for government departments",
  },
  {
    icon: <BellRing size={24} />,
    title: "Notifications & Alerts",
    desc: "Real-time alerts for upcoming deadlines and required actions",
  },
];

export default function About() {
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section id="about" className="py-20 px-6">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Problem / Solution / Why */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "The Challenge",
              points: [
                "Government departments struggle to process lengthy court judgments",
                "Critical directives buried in complex legal text",
                "Delays in decision-making and compliance",
                "Risk of missing deadlines and contempt proceedings",
              ],
            },
            {
              title: "Our Solution",
              points: [
                "AI-powered system reads and understands court judgments",
                "Extracts key information automatically",
                "Converts legal text into structured action plans",
                "Helps officials make faster, accurate decisions",
              ],
            },
            {
              title: "Why Verdict 2 Action",
              points: [
                "Improve efficiency in governance",
                "Reduce manual effort and human error",
                "Ensure no directive is missed",
                "Enable smarter, faster decision-making",
              ],
            },
          ].map((section, i) => (
            <motion.div
              key={section.title}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass p-6"
            >
              <h3 className="text-lg font-serif font-semibold text-accent mb-4">
                {section.title}
              </h3>
              <ul className="space-y-2.5">
                {section.points.map((point) => (
                  <li
                    key={point}
                    className="text-sm text-white/70 leading-relaxed flex items-start gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-accent/60 mt-1.5 flex-shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Feature Grid */}
        <div>
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl font-serif font-bold text-center mb-10"
          >
            Platform Features
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="glass p-5 hover:bg-white/12 transition-all duration-300 hover:scale-[1.02] group"
              >
                <div className="text-accent/70 mb-3 group-hover:text-accent transition-colors">
                  {f.icon}
                </div>
                <h4 className="text-sm font-semibold mb-1">{f.title}</h4>
                <p className="text-xs text-white/50 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
