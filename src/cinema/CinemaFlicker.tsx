import { motion } from "framer-motion";

export function CinemaFlicker() {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none z-[60] mix-blend-overlay bg-white"
      animate={{ opacity: [0.02, 0.06, 0.02, 0.05, 0.015] }}
      transition={{ duration: 0.35, repeat: Infinity }}
    />
  );
}
