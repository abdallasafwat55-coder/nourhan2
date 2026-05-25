import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

type Props = {
  images: string[];
  intervalMs?: number;
};

export function CinemaSlideShow({ images, intervalMs = 2800 }: Props) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length === 0) return;
    const id = window.setInterval(() => {
      setIndex((p) => (p + 1) % images.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [images.length, intervalMs]);

  if (images.length === 0) return null;

  return (
    <div className="absolute inset-0 bg-black">
      <AnimatePresence mode="wait">
        <motion.img
          key={images[index]}
          src={images[index]}
          alt=""
          className="h-full w-full object-cover"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.85 }}
        />
      </AnimatePresence>
    </div>
  );
}
