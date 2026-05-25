import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import type { CinemaStage } from "./cinemaTypes";

type Props = {
  stage: CinemaStage;
  delay: number;
  baseRight: number;
  enterX: number;
  sitY: number;
  size?: number;
  variant?: 0 | 1 | 2;
  pngSrc?: string;
};

const sitting = (s: CinemaStage) =>
  s === "sit" || s === "lightsOff" || s === "projector" || s === "movie";

export function BlueCritter({
  stage,
  delay,
  baseRight,
  enterX,
  sitY,
  size = 188,
  variant = 0,
  pngSrc,
}: Props) {
  const reduce = useReducedMotion();
  const sit = sitting(stage);
  const pull = stage === "pull";
  const enter = stage === "enter";
  const movie = stage === "movie";

  const springRoot = reduce
    ? { duration: 0.35, delay: stage === "intro" ? 0 : delay }
    : {
        type: "spring" as const,
        stiffness: enter ? 40 : 46,
        damping: 14,
        mass: 0.9,
        delay: stage === "intro" ? 0 : delay,
      };

  const idleRepeat = reduce ? 0 : Infinity;

  if (pngSrc) {
    return (
      <motion.div
        className="absolute bottom-0 z-40"
        style={{ right: `${baseRight}px`, width: `${size}px` }}
        initial={{ x: 340, y: 0 }}
        animate={{
          x: stage === "intro" ? 340 : enter ? enterX : enterX - (pull ? 92 : 82),
          y: sit ? sitY : 0,
          rotate: pull ? -4.5 : 0,
        }}
        transition={springRoot}
      >
        <motion.img
          src={pngSrc}
          alt=""
          draggable={false}
          className="pointer-events-none w-full select-none object-contain drop-shadow-[0_10px_24px_rgba(0,0,0,0.5)]"
          animate={{
            y: sit ? [0, -2.5, 0] : [0, -5, 0],
            scaleY: sit ? 0.94 : 1,
          }}
          transition={{
            duration: reduce ? 0 : sit ? 2.6 : 1.5,
            repeat: idleRepeat,
            ease: "easeInOut",
          }}
        />
        {sit && <GroundShadow reduce={reduce} />}
      </motion.div>
    );
  }

  const gid = `v${variant}-d${String(delay).replace(".", "_")}`;

  return (
    <motion.div
      className="absolute bottom-0 z-40"
      style={{ right: `${baseRight}px`, width: `${size}px` }}
      initial={{ x: 340, y: 0 }}
      animate={{
        x: stage === "intro" ? 340 : enter ? enterX : enterX - (pull ? 92 : 82),
        y: sit ? sitY : 0,
        rotate: pull ? -5 : sit ? -1.2 : 0,
      }}
      transition={springRoot}
    >
      <motion.svg
        viewBox="0 0 160 280"
        className="pointer-events-none w-full select-none overflow-visible"
        style={{ filter: "drop-shadow(0 14px 22px rgba(0,0,0,0.45))" }}
        animate={{
          y: sit ? [0, -2.2, 0] : [0, -4.5, 0],
        }}
        transition={{
          duration: reduce ? 0 : sit ? 2.8 : 1.55,
          repeat: idleRepeat,
          ease: "easeInOut",
        }}
      >
        <defs>
          <radialGradient id={`body-${gid}`} cx="38%" cy="32%" r="68%">
            <stop offset="0%" stopColor="#7ddcfb" />
            <stop offset="55%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0369a1" />
          </radialGradient>
          <linearGradient id={`hat-${gid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#bae6fd" />
            <stop offset="100%" stopColor="#0ea5e9" />
          </linearGradient>
          <radialGradient id={`cheek-${gid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fecdd3" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#fecdd3" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`glow-${gid}`} cx="70%" cy="50%" r="55%">
            <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </radialGradient>
        </defs>

        <motion.ellipse
          cx="80"
          cy="268"
          rx="46"
          ry="10"
          fill="rgba(0,0,0,0.38)"
          animate={{
            rx: sit ? [46, 52, 46] : [44, 48, 44],
            opacity: sit ? [0.45, 0.55, 0.45] : [0.35, 0.42, 0.35],
          }}
          transition={{ duration: reduce ? 0 : 2.2, repeat: idleRepeat }}
        />

        <motion.g
          animate={{
            rotate: sit ? 12 : 0,
            y: sit ? 18 : 0,
            x: sit ? -6 : 0,
          }}
          transition={{ type: "spring", stiffness: 55, damping: 16, delay: delay * 0.3 }}
        >
          <path
            d="M52 210 L48 252 L62 254 L66 212 Z"
            fill="#0ea5e9"
            stroke="#0c4a6e"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <ellipse cx="58" cy="256" rx="14" ry="7" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.5" />
        </motion.g>

        <motion.g
          animate={{
            rotate: sit ? -10 : 0,
            y: sit ? 20 : 0,
            x: sit ? 8 : 0,
          }}
          transition={{ type: "spring", stiffness: 52, damping: 16, delay: delay * 0.35 }}
        >
          <path
            d="M108 210 L112 252 L98 254 L94 212 Z"
            fill="#0ea5e9"
            stroke="#0c4a6e"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <ellipse cx="102" cy="256" rx="14" ry="7" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.5" />
        </motion.g>

        <motion.g
          style={{ transformOrigin: "80px 150px" }}
          animate={{
            scaleY: sit ? [1, 1.03, 1] : pull ? [1, 1.02, 1] : [1, 1.015, 1],
            scaleX: sit ? [1, 0.98, 1] : [1, 1.01, 1],
          }}
          transition={{
            duration: reduce ? 0 : sit ? 2.6 : pull ? 0.9 : 1.4,
            repeat: idleRepeat,
            ease: "easeInOut",
          }}
        >
          <ellipse
            cx="80"
            cy="148"
            rx="52"
            ry="58"
            fill={`url(#body-${gid})`}
            stroke="#0c4a6e"
            strokeWidth="2.5"
          />

          <motion.g
            style={{ transformOrigin: "38px 132px" }}
            animate={{
              rotate: pull ? [-6, -28, -12] : sit ? [-4, -2, -4] : [-2, 0, -2],
              x: pull ? [0, 4, 0] : 0,
            }}
            transition={{
              duration: reduce ? 0 : pull ? 0.75 : 2.5,
              repeat: pull || sit ? idleRepeat : 0,
              ease: "easeInOut",
            }}
          >
            <ellipse cx="28" cy="138" rx="16" ry="14" fill="#38bdf8" stroke="#0c4a6e" strokeWidth="2" />
            <circle cx="22" cy="142" r="9" fill="#7dd3fc" stroke="#0c4a6e" strokeWidth="1.5" />
          </motion.g>

          <motion.g
            style={{ transformOrigin: "118px 128px" }}
            animate={{
              rotate: pull ? [-18, -52, -28] : sit ? [-22, -18, -22] : [-8, -4, -8],
              x: pull ? [0, 14, 4] : movie ? [2, 6, 2] : 0,
              y: pull ? [0, -4, 0] : 0,
            }}
            transition={{
              duration: reduce ? 0 : pull ? 0.65 : movie ? 3.2 : 2.4,
              repeat: pull || sit || movie ? idleRepeat : 0,
              ease: "easeInOut",
            }}
          >
            <ellipse cx="128" cy="132" rx="18" ry="15" fill="#38bdf8" stroke="#0c4a6e" strokeWidth="2" />
            <circle cx="136" cy="136" r="10" fill="#7dd3fc" stroke="#0c4a6e" strokeWidth="1.5" />
          </motion.g>
        </motion.g>

        <motion.g
          style={{ transformOrigin: "80px 100px" }}
          animate={{
            rotate: sit ? (movie ? [-4, -2, -4] : [-6, -4, -6]) : pull ? [-4, -9, -5] : [0, 2, 0],
            y: sit ? 6 : pull ? [0, 2, 0] : 0,
          }}
          transition={{
            duration: reduce ? 0 : sit ? 3 : pull ? 0.8 : 2.2,
            repeat: sit || pull ? idleRepeat : 0,
            ease: "easeInOut",
          }}
        >
          <rect x="64" y="108" width="32" height="22" rx="10" fill="#38bdf8" stroke="#0c4a6e" strokeWidth="2" />

          <ellipse cx="80" cy="86" rx="46" ry="44" fill={`url(#body-${gid})`} stroke="#0c4a6e" strokeWidth="2.5" />

          <ellipse cx="52" cy="94" rx="14" ry="10" fill={`url(#cheek-${gid})`} />
          <ellipse cx="108" cy="94" rx="14" ry="10" fill={`url(#cheek-${gid})`} />

          <motion.g
            animate={{ x: movie ? [0, 1.5, 0] : 0 }}
            transition={{ duration: reduce ? 0 : 2.8, repeat: idleRepeat }}
          >
            <motion.g
              style={{ transformOrigin: "80px 82px" }}
              animate={{
                scaleY: reduce ? 1 : [1, 1, 1, 1, 0.12, 1, 1, 1, 1, 1],
              }}
              transition={{
                duration: reduce ? 0 : 5.2,
                repeat: idleRepeat,
                times: [0, 0.12, 0.2, 0.35, 0.38, 0.42, 0.55, 0.7, 0.85, 1],
                ease: "easeInOut",
              }}
            >
              <ellipse cx="62" cy="82" rx="14" ry="16" fill="#f8fafc" stroke="#0f172a" strokeWidth="2.2" />
              <ellipse cx="98" cy="82" rx="14" ry="16" fill="#f8fafc" stroke="#0f172a" strokeWidth="2.2" />

              <motion.g
                animate={{
                  x: movie ? [0, 3, 0] : pull ? [0, 1, 0] : 0,
                  y: movie ? [0, -0.5, 0] : 0,
                }}
                transition={{ duration: reduce ? 0 : 2.2, repeat: idleRepeat }}
              >
                <ellipse cx="64" cy="84" rx="6" ry="8" fill="#0f172a" />
                <ellipse cx="100" cy="84" rx="6" ry="8" fill="#0f172a" />
                <ellipse cx="66" cy="80" rx="2.2" ry="2.5" fill="white" opacity="0.95" />
                <ellipse cx="102" cy="80" rx="2.2" ry="2.5" fill="white" opacity="0.95" />
              </motion.g>
            </motion.g>
          </motion.g>

          <ellipse cx="80" cy="98" rx="10" ry="8" fill="#0ea5e9" stroke="#0c4a6e" strokeWidth="1.5" />
          <ellipse cx="82" cy="96" rx="3" ry="2.5" fill="#e0f2fe" opacity="0.9" />

          <motion.path
            d="M64 112 Q80 120 96 112"
            fill="none"
            stroke="#0c4a6e"
            strokeWidth="2.5"
            strokeLinecap="round"
            animate={
              sit
                ? { d: ["M64 112 Q80 118 96 112", "M64 112 Q80 122 96 112", "M64 112 Q80 118 96 112"] }
                : pull
                  ? { d: ["M64 112 Q80 116 96 112", "M64 112 Q80 124 96 112", "M64 112 Q80 116 96 112"] }
                  : { d: "M64 112 Q80 120 96 112" }
            }
            transition={{
              duration: reduce ? 0 : sit ? 2.4 : 0.55,
              repeat: sit ? idleRepeat : pull ? 5 : 0,
              ease: "easeInOut",
            }}
          />
        </motion.g>

        <motion.g
          style={{ transformOrigin: "80px 52px" }}
          animate={{
            rotate: sit ? [variant * 2 - 2, variant * 2, variant * 2 - 2] : pull ? [-4, -10, -6] : [0, 1.5, 0],
            y: sit ? 4 : 0,
          }}
          transition={{
            duration: reduce ? 0 : sit ? 3.5 : pull ? 0.85 : 2.5,
            repeat: sit || pull ? idleRepeat : 0,
            ease: "easeInOut",
          }}
        >
          {renderHat(variant, `hat-${gid}`)}
        </motion.g>

        {movie && (
          <motion.rect
            x="36"
            y="54"
            width="88"
            height="70"
            fill={`url(#glow-${gid})`}
            style={{ mixBlendMode: "soft-light" as const }}
            animate={{ opacity: [0, 0.2, 0.1, 0.18, 0.09] }}
            transition={{ duration: reduce ? 0 : 1.8, repeat: idleRepeat }}
          />
        )}
      </motion.svg>

      {sit && <GroundShadow reduce={reduce} />}
    </motion.div>
  );
}

function GroundShadow({ reduce }: { reduce: boolean | null }) {
  return (
    <motion.div
      className="pointer-events-none absolute bottom-0 left-1/2 h-5 w-[78%] -translate-x-1/2 rounded-full bg-black/50 blur-md"
      animate={{ scaleX: reduce ? 1 : [1, 1.08, 1], opacity: [0.5, 0.65, 0.5] }}
      transition={{ duration: reduce ? 0 : 2.1, repeat: reduce ? 0 : Infinity, ease: "easeInOut" }}
    />
  );
}

function renderHat(v: 0 | 1 | 2, fillId: string): ReactNode {
  const stroke = "#0c4a6e";
  const g = `url(#${fillId})`;
  if (v === 0) {
    return (
      <>
        <path
          d="M38 72 C32 28 128 20 122 72 L118 78 L42 78 Z"
          fill={g}
          stroke={stroke}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path
          d="M50 52 Q80 38 110 52"
          fill="none"
          stroke="#e0f2fe"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.65"
        />
        <circle cx="118" cy="40" r="7" fill="#f0f9ff" stroke={stroke} strokeWidth="1.5" />
      </>
    );
  }
  if (v === 1) {
    return (
      <>
        <path
          d="M34 78 C34 48 126 48 126 78 C126 92 34 92 34 78 Z"
          fill={g}
          stroke={stroke}
          strokeWidth="2.5"
        />
        <ellipse cx="88" cy="58" rx="36" ry="14" fill="#7dd3fc" opacity="0.5" />
      </>
    );
  }
  return (
    <>
      <ellipse cx="80" cy="58" rx="52" ry="28" fill={g} stroke={stroke} strokeWidth="2.5" />
      <ellipse cx="52" cy="54" rx="8" ry="6" fill="#f8fafc" opacity="0.85" />
      <ellipse cx="96" cy="50" rx="6" ry="5" fill="#f8fafc" opacity="0.75" />
      <ellipse cx="72" cy="62" rx="5" ry="4" fill="#f8fafc" opacity="0.6" />
    </>
  );
}
