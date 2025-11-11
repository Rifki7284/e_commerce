"use client";

import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`
        relative flex items-center w-[70px] h-[38px] rounded-full
        overflow-hidden transition-colors duration-500
        ${isDark
          ? "bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500"
          : "bg-linear-to-r from-yellow-400 to-orange-500"}
      `}
    >
      {/* Glow background */}
      <motion.div
        className="absolute inset-0 blur-md opacity-40"
        animate={{
          background: isDark
            ? "linear-gradient(90deg, #6366f1, #a855f7, #ec4899)"
            : "linear-gradient(90deg, #facc15, #fb923c)",
        }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />

      {/* Thumb */}
      <motion.div
        className={`
          z-10 w-[30px] h-[30px] rounded-full flex items-center justify-center shadow-md
          ${isDark ? "bg-gray-900 text-yellow-300" : "bg-white text-orange-500"}
        `}
        animate={{
          x: isDark ? 34 : 6, // offset halus biar tidak terlalu ujung
          rotate: isDark ? 360 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 250,
          damping: 20,
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.div
              key="moon"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Moon className="w-4 h-4" />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Sun className="w-4 h-4" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.button>
  );
}
