"use client";

import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { casesApi } from "@/lib/apiClient";
import { useRouter } from "next/navigation";

interface UploadSectionProps {
  onProcessingComplete: () => void;
}

export default function UploadSection({ onProcessingComplete }: UploadSectionProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const router = useRouter();

  const handleFile = useCallback(
    async (selectedFile: File) => {
      const token = localStorage.getItem("v2a_token");
      if (!token) {
        router.push("/login");
        return;
      }

      if (selectedFile.type !== "application/pdf") {
        setError("Please upload a valid PDF file");
        return;
      }
      setError("");
      setFile(selectedFile);
      setIsProcessing(true);
      setProgress(5);

      try {
        // 1. Upload the file
        const uploadRes = await casesApi.uploadPdf(selectedFile);
        setProgress(20);
        
        // 2. Trigger extraction
        const caseId = uploadRes.case_id || uploadRes.id;
        await casesApi.extractCaseAsync(caseId);
        setProgress(45);

        // 3. Poll for status
        let attempts = 0;
        const interval = setInterval(async () => {
          attempts++;
          try {
            const statusRes = await casesApi.getExtractionStatus(caseId);
            if (statusRes.case_status === "completed" || statusRes.case_status === "pending_review") {
              clearInterval(interval);
              setProgress(100);
              setIsComplete(true);
              setTimeout(() => {
                setIsProcessing(false);
                onProcessingComplete();
                router.push(`/case/${caseId}`);
              }, 1000);
            } else if (statusRes.case_status === "rejected") {
              clearInterval(interval);
              setIsProcessing(false);
              setError("Processing failed. Please try again.");
            } else {
              // Increase progress artificially while waiting
              setProgress(p => Math.min(p + 5, 95));
            }
          } catch (e) {
            console.error("Polling error", e);
          }

          if (attempts > 150) { // 5 minutes timeout (150 * 2000ms)
            clearInterval(interval);
            setIsProcessing(false);
            setError("Processing is taking longer than usual. Please check your dashboard in a few minutes.");
          }
        }, 2000);

      } catch (err: any) {
        setIsProcessing(false);
        setError(err.message || "Upload failed");
      }
    },
    [onProcessingComplete, router]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) handleFile(droppedFile);
    },
    [handleFile]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) handleFile(selectedFile);
  };

  return (
    <section id="upload" className="py-20 px-6">
      <div className="max-w-xl mx-auto">
        <AnimatePresence mode="wait">
          {!isProcessing && !isComplete && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-center mb-8">
                Upload Court Judgment
              </h2>

              <label
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`glass cursor-pointer block p-10 text-center transition-all duration-300 hover:scale-[1.02] hover:bg-white/15 ${
                  isDragging ? "bg-white/15 border-accent/50 scale-[1.02]" : ""
                }`}
              >
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleInputChange}
                  className="hidden"
                />
                <Upload
                  size={40}
                  className={`mx-auto mb-4 ${
                    isDragging ? "text-accent" : "text-white/50"
                  } transition-colors`}
                />
                <p className="text-lg font-medium text-white mb-2">
                  {file ? file.name : "Upload Court Judgment PDF"}
                </p>
                <p className="text-sm text-white/50">
                  Drag & drop or click to browse • Supports scanned and digital files
                </p>
              </label>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 mt-4 text-critical text-sm"
                >
                  <AlertCircle size={16} />
                  {error}
                </motion.div>
              )}
            </motion.div>
          )}

          {isProcessing && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="glass p-10 text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="mx-auto mb-6 w-12 h-12 border-2 border-white/20 border-t-accent rounded-full"
              />
              <h3 className="text-xl font-serif font-semibold mb-2">
                AI Processing Judgment…
              </h3>
              <p className="text-sm text-white/60 mb-6">
                Analyzing {file?.name}
              </p>

              {/* Progress bar */}
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-3">
                <motion.div
                  className="h-full bg-gradient-to-r from-accent to-[#F5D76E] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-xs text-white/40">{Math.round(progress)}% complete</p>

              {/* Processing steps */}
              <div className="mt-6 space-y-2 text-left max-w-xs mx-auto">
                {[
                  { label: "Extracting text content", threshold: 20 },
                  { label: "Identifying key directives", threshold: 45 },
                  { label: "Analyzing compliance requirements", threshold: 70 },
                  { label: "Generating action plan", threshold: 90 },
                ].map((step) => (
                  <div
                    key={step.label}
                    className="flex items-center gap-2 text-sm"
                  >
                    <FileText
                      size={14}
                      className={
                        progress >= step.threshold
                          ? "text-accent"
                          : "text-white/20"
                      }
                    />
                    <span
                      className={
                        progress >= step.threshold
                          ? "text-white/80"
                          : "text-white/30"
                      }
                    >
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {isComplete && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="glass p-10 text-center"
            >
              <CheckCircle2 size={48} className="mx-auto mb-4 text-accent" />
              <h3 className="text-xl font-serif font-semibold mb-2">
                Processing Complete
              </h3>
              <p className="text-sm text-white/60">
                Ready for output selection
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
