"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell } from "lucide-react";
import { dashboardApi } from "@/lib/apiClient";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    dashboardApi.getNotifications().then(data => {
      setNotifications(data.notifications || []);
      setUnread(data.unread_count || 0);
    }).catch(err => console.error("Failed to load notifications:", err));

    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const borderColor = (type: string) => {
    if (type === "urgent") return "border-l-critical";
    if (type === "important") return "border-l-important";
    return "border-l-green-500";
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 hover:bg-white/10 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <Bell size={22} className="text-white/80" />
        {unread > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-critical rounded-full text-[10px] font-bold flex items-center justify-center"
          >
            {unread}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 glass-strong p-4 shadow-xl z-50"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold">Notifications</h4>
              <button className="text-xs text-accent hover:underline">
                Mark all as read
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {notifications.length > 0 ? notifications.map((n, i) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`p-3 bg-white/5 rounded-lg border-l-2 ${borderColor(n.type)} hover:bg-white/10 transition-colors cursor-pointer`}
                >
                  <p className="text-sm font-medium leading-snug">{n.title}</p>
                  <p className="text-xs text-white/50 mt-0.5 leading-relaxed">{n.message}</p>
                  <p className="text-[10px] text-white/30 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                </motion.div>
              )) : <p className="text-white/50 text-sm text-center py-4">No notifications.</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
