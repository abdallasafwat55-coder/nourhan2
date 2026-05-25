import { AnimatePresence, motion, useSpring, useTransform, type MotionValue } from "framer-motion";
import { useEffect, useMemo, useRef } from "react";
import { MEMORIES, memoryPoster, type MemoryCard } from "./memories";

type Props = {
  active: MemoryCard;
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
};

function Particle({ delay, size, left, top }: { delay: number; size: number; left: string; top: string }) {
  return (
    <motion.span
      className="memory-particle absolute rounded-full bg-white"
      style={{ left, top, width: size, height: size }}
      animate={{
        y: [0, -28, 0],
        opacity: [0.12, 0.5, 0.12],
        scale: [1, 1.3, 1],
      }}
      transition={{
        duration: 4 + delay * 0.4,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
    />
  );
}

export function AmbientScene({ active, mouseX, mouseY }: Props) {
  const bgVideoRef = useRef<HTMLVideoElement>(null);
  const springX = useSpring(mouseX, { stiffness: 40, damping: 28 });
  const springY = useSpring(mouseY, { stiffness: 40, damping: 28 });
  const lightX = useTransform(springX, [-0.5, 0.5], ["35%", "65%"]);
  const lightY = useTransform(springY, [-0.5, 0.5], ["25%", "55%"]);

  const particles = useMemo(
    () =>
      Array.from({ length: 32 }, (_, i) => ({
        id: i,
        delay: (i % 12) * 0.35,
        size: 1 + (i % 2),
        left: `${(i * 17.3) % 100}%`,
        top: `${(i * 23.7) % 100}%`,
      })),
    []
  );

  useEffect(() => {
    MEMORIES.forEach((m) => {
      if (m.type === "image") {
        const img = new Image();
        img.src = m.src;
      } else {
        const v = document.createElement("video");
        v.preload = "metadata";
        v.muted = true;
        v.src = m.src;
      }
    });
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty("--memory-accent", active.accent);
    document.documentElement.style.setProperty("--memory-glow", active.glow);
  }, [active.accent, active.glow]);

  useEffect(() => {
    const v = bgVideoRef.current;
    if (!v || active.type !== "video") return;
    v.currentTime = 0;
    void v.play().catch(() => {});
  }, [active.id, active.type, active.src]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0">
        <AnimatePresence mode="sync">
          <motion.div
            key={active.id}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 0.98 }}
            exit={{ opacity: 0, scale: 1 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            {active.type === "video" ? (
              <video
                ref={bgVideoRef}
                src={active.src}
                poster={memoryPoster(active)}
                className="memory-bg-hero absolute inset-0 h-full w-full object-cover"
                muted
                playsInline
                autoPlay
                preload="auto"
                loop={false}
              />
            ) : (
              <img
                src={active.src}
                alt=""
                className="memory-bg-hero absolute inset-0 h-full w-full object-cover"
                loading="eager"
                decoding="async"
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="memory-bg-side-shadow absolute inset-0 z-[1]" aria-hidden />

      <motion.div
        className="absolute z-[2] h-[40vh] w-[40vh] rounded-full blur-[80px]"
        style={{
          left: lightX,
          top: lightY,
          x: "-50%",
          y: "-50%",
          background: "radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%)",
        }}
        animate={{ opacity: [0.25, 0.45, 0.25] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      {particles.map((p) => (
        <Particle key={p.id} {...p} />
      ))}

      <div className="memory-film-grain absolute inset-0 z-[3] opacity-[0.02]" />
    </div>
  );
}
