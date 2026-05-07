"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ThumbsUp,
  Pencil,
  XCircle,
  Scale,
} from "lucide-react";
import clsx from "clsx";
import { casesApi, actionPlanApi } from "@/lib/apiClient";
import NotificationBell from "@/components/NotificationBell";

export default function CaseDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  
  const [caseData, setCaseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("v2a_token");
    if (!token) {
      router.push("/login");
      return;
    }

    casesApi.getCaseDetail(id)
      .then(data => {
        setCaseData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id, router]);

  const handleVerify = async (decision: "approve" | "reject") => {
    try {
      await actionPlanApi.verifyCase(id, decision);
      // Refresh case data
      const updated = await casesApi.getCaseDetail(id);
      setCaseData(updated);
    } catch (e: any) {
      alert("Verification failed: " + e.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/60">Loading case details...</div>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass p-8 text-center">
          <p className="text-white/60 mb-4">{error || "Case not found."}</p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2 bg-primary rounded-lg text-sm"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const riskLevel = caseData.action_plan?.risk_score || caseData.priority || "Medium";

  const riskColor = ({
    High: "text-critical",
    Medium: "text-important",
    Low: "text-green-400",
  } as any)[riskLevel] || "text-important";

  const riskBg = ({
    High: "bg-critical/20 border-critical/30",
    Medium: "bg-important/20 border-important/30",
    Low: "bg-green-600/20 border-green-600/30",
  } as any)[riskLevel] || "bg-important/20 border-important/30";

  return (
    <div className="min-h-screen pb-12">
      {/* Top Bar */}
      <div className="sticky top-0 z-40 bg-black/40 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 md:px-12 h-[60px] flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-sm text-white/70 hover:text-accent transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>
          <NotificationBell />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-8">
        {/* Case Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="glass p-6 mb-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-serif font-bold">{caseData.title || "Untitled Case"}</h1>
              <p className="text-sm text-white/50 mt-1">{caseData.case_number || "Draft"} • {caseData.court || "Unknown Court"}</p>
            </div>
            <span
              className={clsx(
                "text-xs px-3 py-1 rounded-full font-medium self-start",
                caseData.status === "completed" && "bg-green-600/80",
                caseData.status === "processing" && "bg-blue-600/80",
                caseData.status === "pending_review" && "bg-yellow-600/80",
                caseData.status === "uploaded" && "bg-white/20 text-white"
              )}
            >
              {caseData.status}
            </span>
          </div>
          <p className="text-sm text-white/60">
            <span className="text-white/40">Parties:</span> {caseData.parties || "Not extracted"}
          </p>
          <p className="text-sm text-white/60 mt-1">
            <span className="text-white/40">Date:</span> {new Date(caseData.upload_date).toLocaleDateString()} •{" "}
            <span className="text-white/40">Department:</span> {caseData.department || "Unassigned"}
          </p>
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Judgment Reader */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
            className="glass p-6"
          >
            <h3 className="text-sm font-semibold text-accent mb-4 tracking-wide uppercase">
              AI Judgment Reader
            </h3>
            <div className="space-y-3">
              {[
                { label: "Case", value: caseData.case_number || "N/A" },
                { label: "Court", value: caseData.court || "N/A" },
                { label: "Department", value: caseData.department || "N/A" },
                { label: "Priority", value: caseData.priority },
              ].map((item) => (
                <div key={item.label} className="flex justify-between text-sm">
                  <span className="text-white/40">{item.label}</span>
                  <span className="text-white/90 font-medium">{item.value}</span>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-semibold mb-3 text-white/80">Key Directives</h4>
              <ul className="space-y-2">
                {(caseData.extracted_data?.directives || []).map((d: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 flex-shrink-0" />
                    {d}
                  </li>
                ))}
                {(!caseData.extracted_data?.directives || caseData.extracted_data.directives.length === 0) && (
                  <li className="text-sm text-white/40">No directives extracted.</li>
                )}
              </ul>
            </div>
          </motion.div>

          {/* Highlighted PDF Viewer */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.15 }}
            className="glass p-6"
          >
            <h3 className="text-sm font-semibold text-accent mb-4 tracking-wide uppercase">
              AI Highlighted Judgment
            </h3>
            <div className="bg-black/20 rounded-lg p-4 max-h-[340px] overflow-y-auto space-y-3 text-sm leading-relaxed">
              {(caseData.extracted_data?.highlights || []).map((seg: any, i: number) => {
                const bg = ({
                  high: "bg-critical/20 border-l-2 border-critical pl-3",
                  medium: "bg-important/20 border-l-2 border-important pl-3",
                  low: "bg-yellow-500/15 border-l-2 border-yellow-500 pl-3",
                } as any)[seg.severity?.toLowerCase() || "low"] || "";
                return (
                  <p key={i} className={clsx("py-1.5 rounded text-white/80", bg)}>
                    {seg.text}
                  </p>
                );
              })}
              {(!caseData.extracted_data?.highlights || caseData.extracted_data.highlights.length === 0) && (
                 <p className="text-white/40 italic">No highlights available yet. Processing may be incomplete.</p>
              )}
            </div>
            <div className="flex gap-4 mt-4 text-xs text-white/40">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-critical" /> High
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-important" /> Medium
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-yellow-500" /> Low
              </span>
            </div>
          </motion.div>

          {/* AI Action Plan */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.25 }}
            className="glass p-6"
          >
            <h3 className="text-sm font-semibold text-accent mb-4 tracking-wide uppercase">
              AI Action Plan
            </h3>
            {caseData.action_plan ? (
              <>
                <div className="space-y-3 text-sm mb-6">
                  {[
                    { label: "Action Type", value: caseData.action_plan.recommendation_type || "N/A" },
                    { label: "Department", value: caseData.action_plan.responsible_department || "N/A" },
                    { label: "Deadline", value: caseData.action_plan.deadline || "N/A" },
                    { label: "Priority", value: caseData.action_plan.risk_score || "N/A" },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between">
                      <span className="text-white/40">{item.label}</span>
                      <span className="text-white/90 font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-white/5 rounded-lg p-4 mb-6">
                  <p className="text-xs text-white/40 mb-1">Reasoning</p>
                  <p className="text-sm text-white/70 leading-relaxed">{caseData.action_plan.reasoning || "No reasoning provided."}</p>
                </div>
                {caseData.verification_status !== "approved" && (
                  <div className="flex gap-3">
                    <button onClick={() => handleVerify("approve")} className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-green-600/80 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors">
                      <ThumbsUp size={14} /> Approve
                    </button>
                    <button onClick={() => handleVerify("reject")} className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-critical/60 rounded-lg text-sm font-medium hover:bg-critical/80 transition-colors">
                      <XCircle size={14} /> Reject
                    </button>
                  </div>
                )}
                {caseData.verification_status === "approved" && (
                  <div className="bg-green-600/20 text-green-400 p-3 rounded-lg text-center font-medium flex items-center justify-center gap-2">
                    <CheckCircle2 size={16} /> Verified & Approved
                  </div>
                )}
              </>
            ) : (
              <p className="text-white/40 text-sm">Action plan is still being generated or is unavailable.</p>
            )}
          </motion.div>

          {/* Appeal Risk Score */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
            className="glass p-6"
          >
            <h3 className="text-sm font-semibold text-accent mb-4 tracking-wide uppercase">
              Appeal Risk Score
            </h3>
            {caseData.action_plan ? (
              <div className={clsx("rounded-lg border p-4 mb-4", riskBg)}>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={18} className={riskColor} />
                  <span className={clsx("text-lg font-semibold", riskColor)}>
                    {riskLevel} Risk
                  </span>
                </div>
                <p className="text-sm text-white/60 leading-relaxed">
                  {caseData.action_plan.risk_reasoning || "No detailed risk assessment available."}
                </p>
              </div>
            ) : (
               <p className="text-white/40 text-sm">Risk score pending analysis.</p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
