"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { dashboardApi } from "@/lib/apiClient";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const iconMap: Record<string, React.ReactNode> = {
  FileText: <FileText size={20} />,
  AlertTriangle: <AlertTriangle size={20} />,
  CheckCircle: <CheckCircle size={20} />,
  Clock: <Clock size={20} />,
};

export default function Analytics() {
  const [stats, setStats] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    dashboardApi.getAnalytics().then(data => {
      setStats([
        { label: "Total Cases", value: data.total_cases, change: "+12% from last month", icon: "FileText" },
        { label: "Urgent Actions", value: data.urgent_cases, change: "Requires immediate attention", icon: "AlertTriangle" },
        { label: "Compliance Rate", value: `${data.compliance_rate}%`, change: "+2.5% improvement", icon: "CheckCircle" },
        { label: "Avg. Review Time", value: `${data.avg_review_time_hours}h`, change: "-4h from last week", icon: "Clock" },
      ]);
      setChartData(data.weekly_trend || []);
    }).catch(err => console.error(err));
  }, []);

  return (
    <section id="analytics" className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl sm:text-3xl font-serif font-bold text-center mb-10"
        >
          Analytics Overview
        </motion.h2>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {stats.length > 0 ? stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass p-5 hover:bg-white/12 transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-white/60">{stat.label}</span>
                <span className="text-accent/70">{iconMap[stat.icon]}</span>
              </div>
              <p className="text-2xl font-semibold text-white mb-1">{stat.value}</p>
              <p className="text-xs text-white/40">{stat.change}</p>
            </motion.div>
          )) : <p className="text-white/50 text-center col-span-full">Loading analytics...</p>}
        </div>

        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass p-6"
        >
          <h3 className="text-sm font-semibold text-white/80 mb-6">
            Cases Processed — Last 7 Days
          </h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="accentGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D4AF37" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#D4AF37" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.06)"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    background: "rgba(0,0,0,0.8)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: "8px",
                    color: "white",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="cases"
                  stroke="#D4AF37"
                  strokeWidth={2}
                  fill="url(#accentGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
