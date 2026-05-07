"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { casesApi } from "@/lib/apiClient";
import clsx from "clsx";

export default function CaseTable() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    casesApi.listCases()
      .then(data => {
        setCases(data.cases || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load cases:", err);
        setLoading(false);
      });
  }, []);

  const departments = ["All", ...Array.from(new Set(cases.map((c) => c.department || "Unknown")))];
  const priorities = ["All", "High", "Medium", "Low"];
  const statuses = ["All", "uploaded", "processing", "pending_review", "approved", "rejected", "completed"];

  const filtered = useMemo(() => {
    return cases.filter((c) => {
      const matchSearch =
        !search || (c.case_number || "").toLowerCase().includes(search.toLowerCase());
      const matchDept = filterDept === "All" || c.department === filterDept;
      const matchPriority = filterPriority === "All" || c.priority === filterPriority;
      const matchStatus = filterStatus === "All" || c.status === filterStatus;
      return matchSearch && matchDept && matchPriority && matchStatus;
    });
  }, [search, filterDept, filterPriority, filterStatus, cases]);

  const actionBadge = (action: string) => {
    const styles = {
      Immediate: "bg-critical",
      Required: "bg-important",
      None: "bg-green-600",
    }[action] ?? "bg-white/20";
    return (
      <span className={`${styles} text-white text-xs px-3 py-1 rounded-full font-medium`}>
        {action}
      </span>
    );
  };

  const statusBadge = (status: string) => {
    const styles = ({
      Pending: "bg-yellow-600/80",
      "In Progress": "bg-blue-600/80",
      Completed: "bg-green-600/80",
    } as any)[status] ?? "bg-white/20";
    return (
      <span className={`${styles} text-white text-xs px-3 py-1 rounded-full font-medium`}>
        {status}
      </span>
    );
  };

  const priorityBadge = (priority: string) => {
    const color = ({
      High: "text-critical",
      Medium: "text-important",
      Low: "text-green-400",
    } as any)[priority] ?? "text-white/60";
    return <span className={`${color} font-medium text-sm`}>{priority}</span>;
  };

  return (
    <section id="dashboard" className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl sm:text-3xl font-serif font-bold text-center mb-10"
        >
          Case Dashboard
        </motion.h2>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass p-4 mb-6 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center"
        >
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Search by case number…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent/40 transition-colors"
            />
          </div>
          {[
            { value: filterDept, setter: setFilterDept, options: departments, label: "Department" },
            { value: filterPriority, setter: setFilterPriority, options: priorities, label: "Priority" },
            { value: filterStatus, setter: setFilterStatus, options: statuses, label: "Status" },
          ].map((f) => (
            <select
              key={f.label}
              value={f.value}
              onChange={(e) => f.setter(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white/80 focus:outline-none focus:border-accent/40 transition-colors cursor-pointer"
            >
              {f.options.map((opt) => (
                <option key={opt} value={opt} className="bg-neutral-800 text-white">
                  {opt === "All" ? `${f.label}: All` : opt}
                </option>
              ))}
            </select>
          ))}
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass p-2 sm:p-6 overflow-x-auto"
        >
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="text-white/60 text-left border-b border-white/10">
                <th className="pb-3 px-3 font-medium">Case Number</th>
                <th className="pb-3 px-3 font-medium">Department</th>
                <th className="pb-3 px-3 font-medium">Priority</th>
                <th className="pb-3 px-3 font-medium">Status</th>
                <th className="pb-3 px-3 font-medium">Date</th>
                <th className="pb-3 px-3 font-medium">Action Needed</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <motion.tr
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => router.push(`/case/${c.id}`)}
                  className={clsx(
                    "border-b border-white/5 cursor-pointer transition-colors duration-200",
                    "hover:bg-white/10"
                  )}
                >
                  <td className="py-3.5 px-3 font-medium text-white">{c.case_number || c.id.slice(0, 8)}</td>
                  <td className="py-3.5 px-3 text-white/70">{c.department || "Unknown"}</td>
                  <td className="py-3.5 px-3">{priorityBadge(c.priority)}</td>
                  <td className="py-3.5 px-3">{statusBadge(c.status)}</td>
                  <td className="py-3.5 px-3 text-white/60">{new Date(c.upload_date).toLocaleDateString()}</td>
                  <td className="py-3.5 px-3">{actionBadge(c.action_needed)}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {loading ? (
            <p className="text-center text-white/60 py-8 text-sm">Loading cases...</p>
          ) : filtered.length === 0 ? (
            <p className="text-center text-white/40 py-8 text-sm">No cases match your filters.</p>
          ) : null}
        </motion.div>
      </div>
    </section>
  );
}
