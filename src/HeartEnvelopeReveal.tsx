import { AnimatePresence, motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { stopSiteMusic } from "./memory/BackgroundMusic";

const HEART_PATH =
  "M 150 248 C 150 248 32 168 32 108 C 32 52 88 22 150 78 C 212 22 268 52 268 108 C 268 168 150 248 150 248 Z";

const DRAW_MS = 5200;
const ENVELOPE_DELAY_MS = 450;
const SEAL_MS = 1500;

type Phase = "idle" | "drawing" | "envelope" | "sealing" | "sealed";

type Spark = { id: number; x: number; y: number; angle: number };

type Props = {
  onOpenMessages: () => void;
};

function EnvelopeGraphic({ className = "" }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-rose-200/95 via-rose-100/90 to-pink-200/85 shadow-[0_28px_80px_rgba(244,63,94,0.35)] sm:rounded-3xl" />
      <div className="absolute inset-0 overflow-hidden rounded-2xl sm:rounded-3xl">
        <div
          className="absolute left-1/2 top-0 -translate-x-1/2"
          style={{
            width: 0,
            height: 0,
            borderLeft: "min(42vw, 14rem) solid transparent",
            borderRight: "min(42vw, 14rem) solid transparent",
            borderTop: "min(32vw, 10rem) solid rgba(251,207,232,0.96)",
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-rose-300/95 to-rose-200/85" />
      </div>
      <div className="absolute inset-0 rounded-2xl ring-1 ring-white/40 sm:rounded-3xl" />
      <div
        className="envelope-lock-target absolute left-1/2 top-[48%] z-10 h-11 w-11 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-rose-300/70 bg-rose-500/25 shadow-[inset_0_0_16px_rgba(255,255,255,0.45)] sm:h-12 sm:w-12"
        aria-hidden
      />
    </div>
  );
}

export function HeartEnvelopeReveal({ onOpenMessages }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const rafRef = useRef(0);
  const timersRef = useRef<number[]>([]);

  const [inView, setInView] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [pathLen, setPathLen] = useState(0);
  const [laser, setLaser] = useState({ x: 150, y: 78 });
  const [sparks, setSparks] = useState<Spark[]>([]);
  const sparkId = useRef(0);

  const addTimer = (fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  };

  const clearAllTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
  };

  const resetAnimation = useCallback(() => {
    clearAllTimers();
    setPhase("idle");
    setProgress(0);
    setPathLen(0);
    setSparks([]);
    setLaser({ x: 150, y: 78 });
  }, []);

  const startSequence = useCallback(() => {
    resetAnimation();
    addTimer(() => setPhase("drawing"), 120);
  }, [resetAnimation]);

  const measurePath = useCallback(() => {
    const p = pathRef.current;
    if (!p) return;
    const len = p.getTotalLength();
    setPathLen(len);
    const pt = p.getPointAtLength(0);
    setLaser({ x: pt.x, y: pt.y });
  }, []);

  useEffect(() => {
    measurePath();
    window.addEventListener("resize", measurePath);
    return () => window.removeEventListener("resize", measurePath);
  }, [measurePath]);

  /* قياس المسار بمجرد دخول مرحلة الرسم */
  useEffect(() => {
    if (phase !== "drawing") return;
    const id = requestAnimationFrame(() => {
      measurePath();
      requestAnimationFrame(measurePath);
    });
    return () => cancelAnimationFrame(id);
  }, [phase, measurePath]);

  const burstSparks = useCallback((x: number, y: number) => {
    const burst: Spark[] = Array.from({ length: 5 }, (_, n) => ({
      id: sparkId.current++,
      x,
      y,
      angle: (n / 5) * Math.PI * 2 + Math.random() * 0.5,
    }));
    setSparks((prev) => [...prev.slice(-20), ...burst]);
  }, []);

  useEffect(() => {
    if (sparks.length === 0) return;
    const t = window.setTimeout(() => setSparks([]), 400);
    return () => window.clearTimeout(t);
  }, [sparks]);

  /* دخول/خروج السكشن → إظهار أو إخفاء وإعادة التشغيل */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          startSequence();
        } else {
          setInView(false);
          resetAnimation();
        }
      },
      { threshold: 0.2, rootMargin: "-8% 0px -8% 0px" }
    );

    obs.observe(el);
    return () => {
      obs.disconnect();
      clearAllTimers();
    };
  }, [startSequence, resetAnimation]);

  useEffect(() => {
    if (!inView || phase !== "drawing" || pathLen <= 0) return;

    const path = pathRef.current;
    if (!path) return;

    const t0 = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / DRAW_MS);
      const eased = 1 - Math.pow(1 - t, 2.2);
      setProgress(eased);

      const at = path.getPointAtLength(eased * pathLen);
      setLaser({ x: at.x, y: at.y });

      if (Math.random() > 0.82) burstSparks(at.x, at.y);

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = 0;
        setProgress(1);
        addTimer(() => setPhase("envelope"), ENVELOPE_DELAY_MS);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };
  }, [inView, phase, pathLen, burstSparks]);

  useEffect(() => {
    if (!inView || phase !== "envelope") return;
    const id = addTimer(() => setPhase("sealing"), 750);
    return () => window.clearTimeout(id);
  }, [inView, phase]);

  useEffect(() => {
    if (!inView || phase !== "sealing") return;
    const id = addTimer(() => setPhase("sealed"), SEAL_MS);
    return () => window.clearTimeout(id);
  }, [inView, phase]);

  const dashOffset = pathLen > 0 ? pathLen * (1 - progress) : 9999;
  const laserOn = inView && phase === "drawing" && pathLen > 0 && progress < 1;
  const showHeartSvg =
    inView &&
    (phase === "drawing" ||
      phase === "envelope" ||
      phase === "sealing" ||
      phase === "sealed");
  const strokeVisible =
    phase === "drawing" ? progress > 0 : phase === "envelope" || phase === "sealing" || phase === "sealed";
  const showEnvelope = inView && (phase === "envelope" || phase === "sealing" || phase === "sealed");
  const showHeartBtn = inView && (phase === "envelope" || phase === "sealing" || phase === "sealed");
  const sealed = phase === "sealed";
  const heartAtLock = phase === "sealing" || phase === "sealed";

  return (
    <section ref={sectionRef} className="relative">
      <motion.div
        className="mb-5 text-center sm:mb-6"
        animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 12 }}
        transition={{ duration: 0.45 }}
      >
        <h2 className="font-display text-2xl font-bold sm:text-3xl md:text-4xl">متنسيش تفتحي ده  </h2>
        {/* <p className="mt-1.5 text-sm text-white/70 sm:text-base">كلمات من القلب… مكتوبة علشانكِ بس</p> */}
      </motion.div>

      <div className="relative mx-auto aspect-[5/4] w-full max-w-md sm:aspect-[16/10] sm:max-w-lg md:max-w-2xl md:min-h-[min(60vh,440px)]">
        <AnimatePresence mode="wait">
          {inView && (
            <motion.div
              key="messages-stage"
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* ظرف كبير بحجم المنطقة */}
              <AnimatePresence>
                {showEnvelope && (
                  <motion.div
                    className="absolute inset-[6%] z-0 sm:inset-[5%]"
                    initial={{ opacity: 0, scale: 0.82, y: 28 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <EnvelopeGraphic className="h-full w-full" />
                    {phase === "sealing" && (
                      <motion.div
                        className="pointer-events-none absolute left-1/2 top-[48%] z-10 h-11 w-11 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-cyan-300/80 sm:h-12 sm:w-12"
                        initial={{ scale: 1, opacity: 0.9 }}
                        animate={{ scale: 2.5, opacity: 0 }}
                        transition={{ duration: 0.85, ease: "easeOut" }}
                      />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* قلب + ليزر داخل نفس SVG — المسار موجود من أول الرسم */}
              {showHeartSvg && (
                <motion.div
                  className="relative z-10 flex h-[66%] max-w-[54%] items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: showEnvelope ? 0.4 : 1,
                    scale: showEnvelope ? 0.88 : 1,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <svg
                    viewBox="0 0 300 280"
                    className="h-full w-auto overflow-visible"
                    aria-hidden
                  >
                    <defs>
                      <linearGradient id="heartStrokeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#fda4af" />
                        <stop offset="50%" stopColor="#f472b6" />
                        <stop offset="100%" stopColor="#22d3ee" />
                      </linearGradient>
                      <filter id="heartGlow">
                        <feGaussianBlur stdDeviation="2.5" result="blur" />
                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                      <radialGradient id="laserGlow">
                        <stop offset="0%" stopColor="#fff" />
                        <stop offset="40%" stopColor="#22d3ee" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="#f472b6" stopOpacity="0" />
                      </radialGradient>
                    </defs>

                    <path
                      ref={pathRef}
                      d={HEART_PATH}
                      fill={progress > 0.92 ? "rgba(244,63,94,0.2)" : "none"}
                      stroke="url(#heartStrokeGrad)"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray={pathLen || 1}
                      strokeDashoffset={dashOffset}
                      filter="url(#heartGlow)"
                      opacity={strokeVisible ? 1 : 0}
                    />

                    {sparks.map((s) => (
                      <motion.circle
                        key={s.id}
                        r={2}
                        fill="#a5f3fc"
                        cx={s.x}
                        cy={s.y}
                        initial={{ opacity: 1 }}
                        animate={{
                          opacity: 0,
                          cx: s.x + Math.cos(s.angle) * 18,
                          cy: s.y + Math.sin(s.angle) * 18,
                          r: 0,
                        }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                      />
                    ))}

                    {laserOn && (
                      <g transform={`translate(${laser.x}, ${laser.y})`} style={{ pointerEvents: "none" }}>
                        <motion.line
                          x1={0}
                          y1={0}
                          x2={-14}
                          y2={-22}
                          stroke="url(#heartStrokeGrad)"
                          strokeWidth={2}
                          strokeLinecap="round"
                          animate={{ opacity: [0.5, 1, 0.6] }}
                          transition={{ duration: 0.12, repeat: Infinity }}
                        />
                        <motion.circle
                          r={5}
                          fill="url(#laserGlow)"
                          animate={{ r: [4, 6, 4] }}
                          transition={{ duration: 0.1, repeat: Infinity }}
                        />
                        <circle r={12} fill="#22d3ee" opacity={0.2} />
                      </g>
                    )}
                  </svg>
                </motion.div>
              )}

              <AnimatePresence>
                {showHeartBtn && (
                  <motion.button
                    type="button"
                    aria-label={sealed ? "افتحي الرسائل" : "قلب الظرف"}
                    disabled={!sealed}
                    onClick={() => {
                      if (sealed) {
                        stopSiteMusic();
                        onOpenMessages();
                      }
                    }}
                    className={[
                      "absolute z-20 flex items-center justify-center rounded-full border border-pink-200/60 bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-[0_0_40px_rgba(244,63,94,0.55)]",
                      sealed
                        ? "cursor-pointer hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-300"
                        : "pointer-events-none",
                    ].join(" ")}
                    initial={{ left: "50%", top: "42%", width: 52, height: 52, x: "-50%", y: "-50%", opacity: 0, scale: 0.4 }}
                    animate={{
                      left: "50%",
                      top: heartAtLock ? "48%" : "42%",
                      width: sealed ? 48 : 52,
                      height: sealed ? 48 : 52,
                      x: "-50%",
                      y: "-50%",
                      opacity: 1,
                      scale: sealed ? [1, 1.1, 1] : 1,
                      rotate: phase === "sealing" ? [0, -12, 6, 0] : 0,
                    }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{
                      top: { duration: SEAL_MS / 1000, ease: [0.22, 1, 0.36, 1] },
                      rotate: { duration: SEAL_MS / 1000 },
                      scale: sealed ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" } : { duration: 0.45 },
                      opacity: { duration: 0.35 },
                    }}
                  >
                    <Heart className="h-6 w-6 fill-white sm:h-7 sm:w-7" />
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {inView && sealed && (
          <motion.p
            className="mt-2 text-center text-sm text-pink-200/75 sm:text-base"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            اضغطي على القلب… 
          </motion.p>
        )}
      </AnimatePresence>
    </section>
  );
}
