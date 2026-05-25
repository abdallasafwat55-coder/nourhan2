import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type FloatingHeart = {
  id: number;
  left: number;
  bottom: number;
  size: number;
  drift: number;
  duration: number;
  delay: number;
  color: string;
  settled: boolean;
  settleX: number;
  settleY: number;
  pulseDelay: number;
  pulseDuration: number;
};

type Props = {
  burst: number;
  glow?: string;
};

const HEARTS_PER_BURST = 10;
const HEARTS_INCREMENT = 8;

/* عدد القلوب اللي بتطلع تلقائي كل مرة */
const AUTO_HEARTS_COUNT = 4;
/* الفاصل الزمني بين كل دفعة تلقائية (بالمللي ثانية) */
const AUTO_INTERVAL_MS = 2200;

const HEART_COLORS = [
  "rgba(255, 120, 200, 0.85)",
  "rgba(255, 77, 166, 0.75)",
  "rgba(244, 114, 182, 0.8)",
  "rgba(236, 72, 153, 0.7)",
  "rgba(232, 121, 249, 0.65)",
  "rgba(168, 85, 247, 0.6)",
  "rgba(255, 182, 218, 0.75)",
];

function pickColor(glow: string) {
  return Math.random() > 0.4
    ? HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)]
    : glow;
}

function makeHearts(
  count: number,
  glow: string,
  idRef: React.MutableRefObject<number>
): FloatingHeart[] {
  return Array.from({ length: count }, () => {
    idRef.current += 1;
    return {
      id: idRef.current,
      left: 3 + Math.random() * 94,
      bottom: -2 + Math.random() * 30,
      size: 12 + Math.random() * 24,
      drift: (Math.random() - 0.5) * 100,
      duration: 3 + Math.random() * 3,
      delay: Math.random() * 0.6,
      color: pickColor(glow),
      settled: false,
      settleX: (Math.random() - 0.5) * 70,
      settleY: -(100 + Math.random() * 400),
      pulseDelay: Math.random() * 3,
      pulseDuration: 2.5 + Math.random() * 2.5,
    };
  });
}

export function FloatingHeartsBurst({
  burst,
  glow = "rgba(255, 120, 200, 0.85)",
}: Props) {
  const [hearts, setHearts] = useState<FloatingHeart[]>([]);
  const idRef = useRef(0);

  /* ──── قلوب تلقائية مستمرة في الخلفية ──── */
  useEffect(() => {
    // دفعة أولية فوراً
    setHearts((prev) => [...prev, ...makeHearts(6, glow, idRef)]);

    const interval = setInterval(() => {
      setHearts((prev) => {
        const batch = makeHearts(AUTO_HEARTS_COUNT, glow, idRef);
        const next = [...prev, ...batch];
        return next.length > 350 ? next.slice(-350) : next;
      });
    }, AUTO_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [glow]);

  /* ──── burst إضافي لما تضغط على زرار القلب ──── */
  useEffect(() => {
    if (burst < 1) return;

    const count = HEARTS_PER_BURST + (burst - 1) * HEARTS_INCREMENT;
    const batch = makeHearts(count, glow, idRef);

    setHearts((prev) => {
      const next = [...prev, ...batch];
      return next.length > 350 ? next.slice(-350) : next;
    });
  }, [burst, glow]);

  const settleHeart = (id: number) => {
    setHearts((prev) =>
      prev.map((h) => (h.id === id ? { ...h, settled: true } : h))
    );
  };

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[5] overflow-hidden"
      aria-hidden
    >
      <AnimatePresence>
        {hearts.map((h) =>
          h.settled ? (
            /* ──── قلب مستقر: بيفضل موجود مع نبض خفيف ──── */
            <motion.span
              key={h.id}
              className="absolute will-change-transform"
              style={{
                left: `${h.left}%`,
                bottom: `${h.bottom}%`,
                fontSize: h.size,
                color: h.color,
                textShadow: `0 0 14px ${h.color}, 0 0 28px ${h.color}44`,
                x: h.settleX,
                y: h.settleY,
              }}
              initial={{ opacity: 0.65, scale: 0.85 }}
              animate={{
                opacity: [0.25, 0.6, 0.25],
                scale: [0.85, 1.05, 0.85],
                y: [h.settleY, h.settleY - 10, h.settleY],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: h.pulseDuration,
                repeat: Infinity,
                delay: h.pulseDelay,
                ease: "easeInOut",
              }}
            >
              ♥
            </motion.span>
          ) : (
            /* ──── قلب بيطلع لفوق وبعدين يستقر ──── */
            <motion.span
              key={h.id}
              className="absolute will-change-transform"
              style={{
                left: `${h.left}%`,
                bottom: `${h.bottom}%`,
                fontSize: h.size,
                color: h.color,
                textShadow: `0 0 18px ${h.color}`,
              }}
              initial={{ opacity: 0, y: 0, x: 0, scale: 0.4 }}
              animate={{
                opacity: [0, 0.9, 0.8, 0.55],
                y: [0, h.settleY * 0.3, h.settleY * 0.7, h.settleY],
                x: [0, h.drift * 0.35, h.drift * 0.7, h.settleX],
                scale: [0.4, 1.05, 1, 0.85],
              }}
              transition={{
                duration: h.duration,
                delay: h.delay,
                ease: [0.22, 0.55, 0.25, 1],
              }}
              onAnimationComplete={() => settleHeart(h.id)}
            >
              ♥
            </motion.span>
          )
        )}
      </AnimatePresence>
    </div>
  );
}
