import { useState } from "react";
import { motion } from "framer-motion";

import { runBill } from "@/bill/runtime";
import { useParcBarStore } from "@/state/useParcBarStore";
import { useWindowStore } from "@/state/windowStore";

export const ParcBar = () => {
  const [query, setQuery] = useState("");
  const { apps } = useParcBarStore();
  const { openWindow } = useWindowStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    // BILL²: full OS intelligence pipeline
    await runBill(query);

    setQuery("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 
                 w-[92%] max-w-3xl 
                 bg-black/40 backdrop-blur-xl 
                 border border-white/10 rounded-2xl 
                 px-6 py-3 shadow-xl 
                 flex flex-col gap-3"
    >
      {/* App Icons Row */}
      <div className="flex justify-center gap-6">
        {apps.map((app) => (
          <button
            key={app.id}
            onClick={() => openWindow(app.id)}
            className="flex flex-col items-center hover:scale-110 transition"
          >
            <img src={app.icon} className="w-8 h-8 opacity-90" />
            <span className="text-white/70 text-[10px] mt-1">{app.name}</span>
          </button>
        ))}
      </div>

      {/* Spotlight Search */}
      <form onSubmit={handleSubmit} className="w-full">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask BILL • Try 'open classroom' or 'grid layout'"
          className="w-full px-4 py-2 rounded-xl 
                     bg-white/10 text-white placeholder-white/40 
                     focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
      </form>

      {/* Quick Actions */}
      <div className="flex justify-center gap-4 mt-1">
        <button
          onClick={() => runBill("arrange grid")}
          className="px-3 py-1 text-xs bg-white/10 text-white rounded-lg hover:bg-white/20"
        >
          Grid
        </button>

        <button
          onClick={() => runBill("arrange cascade")}
          className="px-3 py-1 text-xs bg-white/10 text-white rounded-lg hover:bg-white/20"
        >
          Cascade
        </button>

        <button
          onClick={() => runBill("open sports")}
          className="px-3 py-1 text-xs bg-white/10 text-white rounded-lg hover:bg-white/20"
        >
          SportsBar
        </button>
      </div>
    </motion.div>
  );
};
