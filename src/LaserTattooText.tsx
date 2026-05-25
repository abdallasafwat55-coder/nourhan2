import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

const LAYOUT_LINES = ["Happy", " 24 ", "Birthday!"] as const;
const BIRTHDAY_LASER_TEXT = LAYOUT_LINES.join(" ");

function splitGraphemes(text: string): string[] {
  const Segmenter = (
    Intl as typeof Intl & {
      Segmenter?: new (
        locale: string,
        options: { granularity: "grapheme" }
      ) => { segment: (input: string) => Iterable<{ segment: string }> };
    }
  ).Segmenter;

  if (Segmenter) {
    const segmenter = new Segmenter("ar", { granularity: "grapheme" });
    return [...segmenter.segment(text)].map((s) => s.segment);
  }
  return [...text];
}

type FlatChar = { ch: string; line: number };

function buildFlatChars(lines: readonly string[]): FlatChar[] {
  const flat: FlatChar[] = [];
  lines.forEach((line, lineIndex) => {
    splitGraphemes(line).forEach((ch) => flat.push({ ch, line: lineIndex }));
  });
  return flat;
}

type Props = {
  text?: string;
  active: boolean;
  className?: string;
  charDelayMs?: number;
  startDelayMs?: number;
  onComplete?: () => void;
};

export { BIRTHDAY_LASER_TEXT };

function charClassName(ch: string, line: number): string {
  const isSpace = ch === " ";
  const isDigit = /\d/.test(ch);
  const isArabic = /[\u0600-\u06FF]/.test(ch);

  if (line === 1) {
    if (isDigit) {
      return "text-[72px] font-black leading-none tracking-[-6px] sm:text-[120px] md:text-[180px]";
    }
    if (isArabic) {
      return "font-['Amiri',serif] text-[26px] font-bold leading-none sm:text-[38px] md:text-[48px]";
    }
    if (isSpace) return "w-[0.25em]";
    return "";
  }

  if (line === 0) {
    return "text-[46px] font-black italic leading-none tracking-[-2px] sm:text-[70px] md:text-[90px] font-['Great_Vibes',cursive]";
  }

  return "text-[44px] font-black italic leading-none tracking-[-2px] sm:text-[70px] md:text-[110px] font-['Great_Vibes',cursive]";
}

function charStyle(ch: string, line: number, revealed: boolean) {
  if (!revealed) return undefined;

  const isDigit = /\d/.test(ch);
  const isArabic = /[\u0600-\u06FF]/.test(ch);

  if (line === 1 && isDigit) {
    return {
      WebkitTextStroke: "4px #ff5c93",
      textShadow:
        "0 0 10px rgba(255,255,255,0.8), 0 0 30px rgba(255,105,180,0.55), 0 10px 35px rgba(255,20,147,0.45)",
    };
  }

  if (line === 2) {
    return {
      WebkitTextStroke: "2px #ff5c93",
      textShadow:
        "0 0 10px rgba(255,255,255,0.6), 0 0 20px rgba(255,105,180,0.5), 0 8px 25px rgba(255,20,147,0.45)",
    };
  }

  if (isArabic) {
    return {
      WebkitTextStroke: "1px #fda4af",
      textShadow:
        "0 0 10px rgba(255,255,255,0.65), 0 0 22px rgba(34,211,238,0.35), 0 6px 18px rgba(255,105,180,0.4)",
    };
  }

  return {
    WebkitTextStroke: line === 0 ? "1px #ffb6c9" : "2px #ff5c93",
    textShadow:
      "0 0 10px rgba(255,255,255,0.65), 0 0 22px rgba(34,211,238,0.35), 0 6px 18px rgba(255,105,180,0.4)",
  };
}

export default function LaserTattooText({
  active,
  className = "",
  charDelayMs = 140,
  startDelayMs = 700,
  onComplete,
}: Props) {
  const flatChars = useMemo(() => buildFlatChars(LAYOUT_LINES), []);
  const lineChars = useMemo(
    () => LAYOUT_LINES.map((line) => splitGraphemes(line)),
    []
  );
  const lineStartIndex = useMemo(() => {
    const starts: number[] = [];
    let n = 0;
    lineChars.forEach((chars, i) => {
      starts[i] = n;
      n += chars.length;
    });
    return starts;
  }, [lineChars]);

  const [written, setWritten] = useState(0);
  const [burningIndex, setBurningIndex] = useState<number | null>(null);
  const [sparks, setSparks] = useState<
    { id: number; x: number; y: number; angle: number }[]
  >([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const sparkId = useRef(0);
  const completedRef = useRef(false);

  const laserX = useMotionValue(0);
  const laserY = useMotionValue(0);
  const springX = useSpring(laserX, { stiffness: 420, damping: 28 });
  const springY = useSpring(laserY, { stiffness: 420, damping: 28 });

  const placeLaserOnChar = (index: number) => {
    const el = charRefs.current[index];
    const container = containerRef.current;
    if (!el || !container) return;

    const cr = container.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    laserX.set(er.left + er.width * 0.55 - cr.left);
    laserY.set(er.top + er.height * 0.42 - cr.top);
  };

  useLayoutEffect(() => {
    if (!active || written <= 0) return;
    placeLaserOnChar(Math.min(written - 1, flatChars.length - 1));
  }, [active, written, flatChars.length]);

  useEffect(() => {
    if (!active) {
      setWritten(0);
      setBurningIndex(null);
      setSparks([]);
      completedRef.current = false;
      return;
    }

    let cancelled = false;
    let intervalId = 0;
    let startTimer = 0;

    startTimer = window.setTimeout(() => {
      if (cancelled) return;
      let i = 0;
      placeLaserOnChar(0);
      setBurningIndex(0);

      intervalId = window.setInterval(() => {
        if (cancelled) return;

        setBurningIndex(i);
        placeLaserOnChar(i);

        const container = containerRef.current;
        const el = charRefs.current[i];
        if (container && el) {
          const cr = container.getBoundingClientRect();
          const er = el.getBoundingClientRect();
          const cx = er.left + er.width * 0.5 - cr.left;
          const cy = er.top + er.height * 0.5 - cr.top;
          const burst = Array.from({ length: 6 }, (_, n) => ({
            id: sparkId.current++,
            x: cx,
            y: cy,
            angle: (n / 6) * Math.PI * 2 + Math.random() * 0.4,
          }));
          setSparks((prev) => [...prev.slice(-24), ...burst]);
        }

        i += 1;
        setWritten(i);

        if (i >= flatChars.length) {
          window.clearInterval(intervalId);
          setBurningIndex(null);
          if (!completedRef.current) {
            completedRef.current = true;
            onComplete?.();
          }
        }
      }, charDelayMs);
    }, startDelayMs);

    return () => {
      cancelled = true;
      window.clearTimeout(startTimer);
      window.clearInterval(intervalId);
    };
  }, [active, flatChars.length, charDelayMs, startDelayMs, onComplete]);

  useEffect(() => {
    if (sparks.length === 0) return;
    const t = window.setTimeout(() => setSparks([]), 420);
    return () => window.clearTimeout(t);
  }, [sparks]);

  const laserVisible = active && written < flatChars.length;

  const renderChar = (globalIndex: number, ch: string, line: number) => {
    const revealed = globalIndex < written;
    const burning = burningIndex === globalIndex;
    const isSpace = ch === " ";

    return (
      <span
        key={`${globalIndex}-${ch}`}
        ref={(el) => {
          charRefs.current[globalIndex] = el;
        }}
        className={[
          "relative inline-block transition-[filter,opacity,text-shadow] duration-300",
          charClassName(ch, line),
          line === 1 && /\d/.test(ch) ? "text-pink-200" : "",
          line !== 1 || !/\d/.test(ch) ? "text-pink-50" : "",
          revealed ? "opacity-100" : "text-white/15 opacity-40",
          burning ? "laser-char-burn" : "",
        ].join(" ")}
        style={charStyle(ch, line, revealed)}
      >
        {isSpace ? "\u00A0" : ch}
      </span>
    );
  };

  return (
    <motion.div
      ref={containerRef}
      className={`relative flex select-none flex-col items-center text-center md:items-start md:text-left ${className}`}
      aria-label={BIRTHDAY_LASER_TEXT}
      dir="ltr"
    >
      {/* Happy */}
      <motion.div
        className="leading-none text-white drop-shadow-[0_6px_15px_rgba(255,255,255,0.45)]"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        {lineChars[0].map((ch, ci) =>
          renderChar(lineStartIndex[0] + ci, ch, 0)
        )}
      </motion.div>

      {/* والـ 20 والـ */}
      <motion.div
        className="relative -mt-5 flex items-baseline justify-center leading-none md:justify-start"
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        {lineChars[1].map((ch, ci) =>
          renderChar(lineStartIndex[1] + ci, ch, 1)
        )}
      </motion.div>

      {/* Birthday! */}
      <motion.div
        className="-mt-8 leading-none text-pink-100 drop-shadow-[0_12px_25px_rgba(255,105,180,0.45)]"
        animate={{ y: [0, 3, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        {lineChars[2].map((ch, ci) =>
          renderChar(lineStartIndex[2] + ci, ch, 2)
        )}
      </motion.div>

      {laserVisible && (
        <motion.div
          className="pointer-events-none absolute z-30"
          style={{
            left: springX,
            top: springY,
            x: "-50%",
            y: "-50%",
          }}
        >
          <motion.div
            className="absolute left-1/2 top-1/2 h-24 w-[2px] -translate-x-1/2 origin-bottom bg-gradient-to-t from-transparent via-cyan-200/90 to-white"
            style={{ rotate: -38 }}
            animate={{ opacity: [0.5, 1, 0.65], scaleY: [0.85, 1.05, 0.9] }}
            transition={{ duration: 0.12, repeat: Infinity }}
          />
          <motion.div
            className="h-3 w-3 rounded-full bg-white shadow-[0_0_18px_#fff,0_0_35px_#22d3ee,0_0_55px_#f472b6]"
            animate={{ scale: [1, 1.35, 1] }}
            transition={{ duration: 0.1, repeat: Infinity }}
          />
          <motion.div
            className="absolute -inset-4 rounded-full bg-cyan-400/25 blur-md"
            animate={{ opacity: [0.35, 0.75, 0.4] }}
            transition={{ duration: 0.15, repeat: Infinity }}
          />
        </motion.div>
      )}

      {sparks.map((s) => (
        <motion.span
          key={s.id}
          className="pointer-events-none absolute z-20 block h-1 w-1 rounded-full bg-cyan-100"
          style={{ left: s.x, top: s.y }}
          initial={{ opacity: 1, scale: 1 }}
          animate={{
            opacity: 0,
            scale: 0,
            x: Math.cos(s.angle) * 22,
            y: Math.sin(s.angle) * 22,
          }}
          transition={{ duration: 0.38, ease: "easeOut" }}
        />
      ))}

    </motion.div>
  );
}
