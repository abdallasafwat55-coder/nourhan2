import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import LaserTattooText from "./LaserTattooText";

const PHOTO_SRC = "Screenshot (654).png";
const MAX_ESCAPES = 4;
const ESCAPE_IMAGES = [
  "images/cinma/ab.png",
  "images/cinma/an.png",
  "images/cinma/ab.png",
  "images/cinma/aa.png",
] as const;

const BIRTHDAY_CLUSTER_ASSETS = [
  PHOTO_SRC,
  "/images/balloons/balloon1.png",
] as const;

const PHOTO_FLY_DURATION_S = 11;
const PHOTO_SETTLE_Y = 64;

type Phase = "slide" | "finishing";

type Props = {
  onComplete: () => void;
  onEnterCinema: () => void;
};

export default function Opening({ onComplete, onEnterCinema }: Props) {
  const [phase, setPhase] = useState<Phase>("slide");
  const [playBtnVisible, setPlayBtnVisible] = useState(false);
  const [playBtnPos, setPlayBtnPos] = useState({ leftPct: 50, topPct: 50 });
  const [showEscapeClip, setShowEscapeClip] = useState(false);
  const [clipSide, setClipSide] = useState<"left" | "right">("right");
  const [escapeImageSrc, setEscapeImageSrc] = useState<string>(ESCAPE_IMAGES[0]);
  const [escapeCount, setEscapeCount] = useState(0);
  const [clipKey, setClipKey] = useState(0);
  const [entranceBounceDone, setEntranceBounceDone] = useState(false);
  const escapeCountRef = useRef(0);
  const fleeLockRef = useRef(false);
  const clipHideTimer = useRef<number | null>(null);
  const canPlaySound = escapeCount >= MAX_ESCAPES;
  const birthdayScreenVisible = phase === "slide";
  const [birthdayAssetsLoaded, setBirthdayAssetsLoaded] = useState(false);
  const [textAnimationStarted, setTextAnimationStarted] = useState(false);
  const [photoFlyActive, setPhotoFlyActive] = useState(false);
  const [photoSequenceDone, setPhotoSequenceDone] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);
  const [laserDone, setLaserDone] = useState(false);
  const photoClusterFlying = birthdayScreenVisible && photoFlyActive;

  const stars = useMemo(
    () =>
      Array.from({ length: 18 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        duration: 2 + Math.random() * 2,
        delay: Math.random() * 2,
      })),
    []
  );

  useEffect(() => {
    let cancelled = false;

    const loadImage = (src: string) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = src;
      });

    void Promise.all(BIRTHDAY_CLUSTER_ASSETS.map(loadImage)).then(() => {
      if (!cancelled) setBirthdayAssetsLoaded(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // Start text animation first (Happy 24 Birthday!)
  useEffect(() => {
    if (!birthdayScreenVisible || !birthdayAssetsLoaded) {
      setTextAnimationStarted(false);
      setLaserDone(false);
      setPhotoFlyActive(false);
      setPhotoSequenceDone(false);
      setPlayBtnVisible(false);
      setEntranceBounceDone(false);
      return;
    }

    // Start text animation immediately
    setTextAnimationStarted(true);
  }, [birthdayScreenVisible, birthdayAssetsLoaded]);

  // Start photo fly after text animation completes
  useEffect(() => {
    if (!laserDone) return;

    const startFly = window.setTimeout(
      () => setPhotoFlyActive(true),
      500 // Small delay after text completes
    );
    return () => window.clearTimeout(startFly);
  }, [laserDone]);

  useEffect(() => {
    if (!photoFlyActive) {
      setPhotoSequenceDone(false);
      setConfettiActive(false);
      return;
    }

    const readyTimer = window.setTimeout(
      () => setPhotoSequenceDone(true),
      (PHOTO_FLY_DURATION_S - 0.35 + 0.9) * 1000
    );
    return () => window.clearTimeout(readyTimer);
  }, [photoFlyActive]);

  // Trigger confetti after photo settles
  useEffect(() => {
    if (!photoSequenceDone) return;

    const confettiTimer = window.setTimeout(
      () => setConfettiActive(true),
      300
    );
    return () => window.clearTimeout(confettiTimer);
  }, [photoSequenceDone]);

  const skip = useCallback(() => onComplete(), [onComplete]);

  // Show Play button after photo sequence completes
  useEffect(() => {
    if (!photoSequenceDone) return;

    const showTimer = window.setTimeout(() => {
      setPlayBtnVisible(true);
      setEntranceBounceDone(false);
    }, 400);

    return () => window.clearTimeout(showTimer);
  }, [photoSequenceDone]);

  useEffect(() => {
    if (!playBtnVisible || entranceBounceDone) return;
    const t = window.setTimeout(() => setEntranceBounceDone(true), 1300);
    return () => window.clearTimeout(t);
  }, [playBtnVisible, entranceBounceDone]);

  useEffect(() => {
    return () => {
      if (clipHideTimer.current) window.clearTimeout(clipHideTimer.current);
    };
  }, []);

  const fleePlayButton = useCallback(() => {
    if (escapeCountRef.current >= MAX_ESCAPES) return;
    if (fleeLockRef.current) return;
    fleeLockRef.current = true;
    window.setTimeout(() => {
      fleeLockRef.current = false;
    }, 450);

    const clipIndex = escapeCountRef.current;
    escapeCountRef.current += 1;
    setEscapeCount(escapeCountRef.current);
    setEscapeImageSrc(ESCAPE_IMAGES[clipIndex] ?? ESCAPE_IMAGES[0]);
    setClipKey((k) => k + 1);
    setPlayBtnPos({
      leftPct: 8 + Math.random() * 84,
      topPct: 12 + Math.random() * 72,
    });
    setClipSide(Math.random() > 0.5 ? "left" : "right");
    setShowEscapeClip(true);

    if (clipHideTimer.current) window.clearTimeout(clipHideTimer.current);
    clipHideTimer.current = window.setTimeout(() => {
      setShowEscapeClip(false);
    }, 5200);
  }, []);

  const handlePlaySoundHover = useCallback(() => {
    if (escapeCountRef.current < MAX_ESCAPES) fleePlayButton();
  }, [fleePlayButton]);

  const handlePlaySoundClick = useCallback(() => {
    if (escapeCountRef.current < MAX_ESCAPES) {
      fleePlayButton();
      return;
    }
    setPhase("finishing");
    window.setTimeout(() => onEnterCinema(), 650);
  }, [fleePlayButton, onEnterCinema]);

  const playButtonLabel =
    escapeCount >= MAX_ESCAPES
      ? "🎵  خلاص اتفضلي يفندم"
      : escapeCount === 3
        ? "🎵 آخر فرصة!"
        : escapeCount === 2
          ? "🎵 يفلااحه !"
          : escapeCount === 1
            ? "🎵 بتعملي ايه حضرتك!"
            : "🎵 اظغطي علي ده!";

  const content = (
    <motion.div
      className="fixed inset-0 z-[99999] overflow-hidden font-['Nunito_Sans',system-ui,sans-serif]"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <button
        type="button"
        onClick={skip}
        className="absolute left-3 top-3 z-[999] rounded-full border border-white/30 bg-black/30 px-3 py-1.5 text-[11px] text-white backdrop-blur-md sm:left-4 sm:top-4 sm:px-4 sm:py-2 sm:text-xs"
      >
        تخطي
      </button>

      <motion.div
        className="absolute inset-0 overflow-hidden bg-[radial-gradient(circle_at_top,#ff8fb1_0%,#ffb3c7_30%,#ffd7e2_60%,#fff1f5_100%)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === "slide" ? 1 : 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="absolute left-0 top-0 flex w-full justify-between px-4 pt-4 sm:px-10 sm:pt-6">
          {[0, 1].map((side) => (
            <motion.div key={side} className="flex gap-1">
              {Array.from({ length: 8 }).map((_, i) => (
                <span
                  key={i}
                  className="h-4 w-4 bg-pink-400 sm:h-6 sm:w-6"
                  style={{ clipPath: "polygon(50% 100%, 0 0, 100% 0)" }}
                />
              ))}
            </motion.div>
          ))}
        </div>

        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute left-[-10%] top-[-10%] h-[420px] w-[420px] rounded-full bg-pink-400/25 blur-3xl" />
          <motion.div className="absolute bottom-[-15%] right-[-10%] h-[450px] w-[450px] rounded-full bg-rose-300/20 blur-3xl" />

          {Array.from({ length: 25 }).map((_, i) => (
            <motion.span
              key={i}
              className="absolute rounded-full bg-white/40"
              style={{
                width: `${Math.random() * 6 + 2}px`,
                height: `${Math.random() * 6 + 2}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 1, 0.2],
                scale: [1, 1.4, 1],
              }}
              transition={{
                duration: 4 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 3,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        <div className="relative z-10 flex h-full flex-col items-center justify-center gap-6 px-3 pt-12 sm:px-6 md:flex-row md:justify-between md:px-20 md:pt-0">
          <div className="text-center md:text-left">
            <AnimatePresence>
              {textAnimationStarted && (
                <motion.div
                  initial={{ opacity: 0, y: 24, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                  className="relative text-center md:text-left"
                >
                  <LaserTattooText
                    active
                    startDelayMs={350}
                    charDelayMs={180}
                    onComplete={() => setLaserDone(true)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.div className="relative mt-2 min-h-[300px] pt-2 sm:mt-4 sm:min-h-[440px] sm:pt-6 md:mt-2 md:min-h-[500px] md:pt-10">
            <motion.div
              className="relative mx-auto flex w-full max-w-[340px] flex-col items-center"
              initial={{ opacity: 0, y: "115vh", visibility: "hidden" }}
              animate={
                photoClusterFlying
                  ? {
                      opacity: 1,
                      y: PHOTO_SETTLE_Y,
                      visibility: "visible",
                      x: [0, 8, -6, 4, -2, 0],
                      rotate: [0, -2, 1.6, -1, 0.4, 0],
                    }
                  : {
                      opacity: 0,
                      y: "115vh",
                      visibility: "hidden",
                      x: 0,
                      rotate: 0,
                    }
              }
              transition={{
                y: {
                  duration: PHOTO_FLY_DURATION_S,
                  ease: [0.08, 0.82, 0.18, 1],
                },
                x: {
                  duration: PHOTO_FLY_DURATION_S,
                  ease: "easeInOut",
                  times: [0, 0.25, 0.5, 0.75, 0.92, 1],
                },
                rotate: {
                  duration: PHOTO_FLY_DURATION_S,
                  ease: "easeInOut",
                  times: [0, 0.25, 0.5, 0.75, 0.92, 1],
                },
                opacity: { duration: 0.5 },
              }}
            >
              <img
                src="images/ballon/pngtree-balloon-image-png-image_20122494.png"
                alt="balloon"
                className="absolute -left-6 top-6 z-20 h-16 object-contain sm:-left-12 sm:top-8 sm:h-24"
              />
              <img
                src="images/ballon/pngtree-balloon-image-png-image_20122494.png"
                alt="balloon"
                className="absolute -right-6 top-6 z-20 h-16 object-contain sm:-right-12 sm:top-8 sm:h-24"
              />

              <motion.div className="relative z-10 h-40 w-40 overflow-hidden rounded-full border-4 border-rose-300 shadow-[0_0_55px_rgba(244,114,182,0.45)] sm:h-64 sm:w-64 sm:border-8">
                <motion.img
                  src={PHOTO_SRC}
                  alt="Birthday"
                  className="h-full w-full object-cover"
                  initial={{ x: 0, y: 0 }}
                  animate={{
                    x: [0, Math.random() * 20 - 10, Math.random() * 20 - 10, 0],
                    y: [0, Math.random() * 20 - 10, Math.random() * 20 - 10, 0],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </motion.div>

              <motion.div
                className="relative z-10 mt-4 rounded-full bg-rose-400 px-5 py-1.5 text-center text-sm font-semibold text-white shadow-lg sm:mt-5 sm:px-8 sm:py-2 sm:text-base"
                initial={{ opacity: 0, y: 16 }}
                animate={
                  photoClusterFlying
                    ? { opacity: 1, y: 0 }
                    : { opacity: 0, y: 16 }
                }
                transition={{
                  delay: PHOTO_FLY_DURATION_S - 0.35,
                  duration: 0.9,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                Nourhan Lotfy
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        <div className="absolute left-[8%] top-[38%] hidden text-4xl sm:block">😊</div>
        <div className="absolute right-[14%] bottom-[28%] hidden text-3xl sm:block">🎈</div>
        <div className="absolute left-[22%] bottom-[18%] hidden text-3xl sm:block">🎉</div>

        {stars.map((star) => (
          <motion.div
            key={star.id}
            className="absolute text-black/50"
            style={{ left: `${star.left}%`, top: `${star.top}%` }}
            animate={{
              y: [0, -8, 0],
              rotate: [0, 10, -10, 0],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: star.duration,
              delay: star.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            ✦
          </motion.div>
        ))}
      </motion.div>

      {/* Confetti cannons from left and right - dense explosion */}
      {confettiActive && (
        <div className="fixed inset-0 z-[99998] pointer-events-none overflow-hidden">
          {/* Left cannon - dense */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2">
            {Array.from({ length: 50 }).map((_, i) => (
              <motion.div
                key={`left-${i}`}
                className="absolute rounded-full"
                style={{
                  width: `${4 + Math.random() * 6}px`,
                  height: `${4 + Math.random() * 6}px`,
                  background: ['#ff69b4', '#ff1493', '#ff6ec7', '#ffd700', '#ff4500', '#ff8c00', '#ff1493', '#ff69b4'][
                    Math.floor(Math.random() * 8)
                  ],
                }}
                initial={{ x: -10, y: (Math.random() - 0.5) * 60, opacity: 1, scale: 1 }}
                animate={{
                  x: 100 + Math.random() * 350,
                  y: (Math.random() - 0.5) * 500 - 100,
                  opacity: 0,
                  scale: 0,
                  rotate: Math.random() * 1080,
                }}
                transition={{
                  duration: 2 + Math.random() * 1.5,
                  ease: [0.25, 0.46, 0.45, 0.94],
                  delay: Math.random() * 0.5,
                }}
              />
            ))}
          </div>
          {/* Right cannon - dense */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2">
            {Array.from({ length: 50 }).map((_, i) => (
              <motion.div
                key={`right-${i}`}
                className="absolute rounded-full"
                style={{
                  width: `${4 + Math.random() * 6}px`,
                  height: `${4 + Math.random() * 6}px`,
                  background: ['#ff69b4', '#ff1493', '#ff6ec7', '#ffd700', '#ff4500', '#ff8c00', '#ff1493', '#ff69b4'][
                    Math.floor(Math.random() * 8)
                  ],
                }}
                initial={{ x: 10, y: (Math.random() - 0.5) * 60, opacity: 1, scale: 1 }}
                animate={{
                  x: -(100 + Math.random() * 350),
                  y: (Math.random() - 0.5) * 500 - 100,
                  opacity: 0,
                  scale: 0,
                  rotate: Math.random() * 1080,
                }}
                transition={{
                  duration: 2 + Math.random() * 1.5,
                  ease: [0.25, 0.46, 0.45, 0.94],
                  delay: Math.random() * 0.5,
                }}
              />
            ))}
          </div>
          {/* Top confetti rain */}
          <div className="absolute inset-x-0 top-0">
            {Array.from({ length: 40 }).map((_, i) => (
              <motion.div
                key={`top-${i}`}
                className="absolute rounded-full"
                style={{
                  width: `${3 + Math.random() * 5}px`,
                  height: `${3 + Math.random() * 5}px`,
                  background: ['#ff69b4', '#ff1493', '#ff6ec7', '#ffd700', '#ff4500', '#ff8c00'][
                    Math.floor(Math.random() * 6)
                  ],
                  left: `${Math.random() * 100}%`,
                }}
                initial={{ y: -10, opacity: 1, scale: 1, x: 0 }}
                animate={{
                  y: window.innerHeight + 50,
                  x: (Math.random() - 0.5) * 200,
                  opacity: 0,
                  scale: 0,
                  rotate: Math.random() * 720,
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  ease: [0.25, 0.46, 0.45, 0.94],
                  delay: Math.random() * 0.8,
                }}
              />
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {playBtnVisible && (
          <motion.div
            key="play-sound-cluster"
            className="fixed z-[99999] max-w-[92vw]"
            style={{ x: "-50%", y: "-50%" }}
            initial={{ left: "50%", top: "100%", opacity: 0, scale: 0.4 }}
            animate={{
              left: `${playBtnPos.leftPct}%`,
              top: `${playBtnPos.topPct}%`,
              opacity: 1,
              scale:
                escapeCount > 0 || entranceBounceDone ? 1 : [0.4, 1.08, 1],
            }}
            transition={{
              left: { type: "spring", stiffness: 420, damping: 26 },
              top: { type: "spring", stiffness: 420, damping: 26 },
              scale:
                escapeCount > 0 || entranceBounceDone
                  ? { duration: 0.25 }
                  : { duration: 1.2, ease: [0.22, 1, 0.36, 1] },
              opacity: { duration: 0.5 },
            }}
          >
            <AnimatePresence>
              {showEscapeClip && (
                <motion.div
                  key={`escape-img-${clipKey}`}
                  className="absolute top-1/2 z-0 hidden sm:block"
                  style={{
                    [clipSide === "left" ? "right" : "left"]: clipSide === "left" ? "100%" : "100%",
                    [clipSide === "left" ? "marginRight" : "marginLeft"]: "16px",
                  }}
                  initial={{
                    opacity: 0,
                    x: clipSide === "left" ? 72 : -72,
                    scale: 0.82,
                    rotate: clipSide === "left" ? 6 : -6,
                  }}
                  animate={{ opacity: 1, x: 0, scale: 1, rotate: 0 }}
                  exit={{
                    opacity: 0,
                    x: clipSide === "left" ? 48 : -48,
                    scale: 0.9,
                  }}
                  transition={{ type: "spring", stiffness: 280, damping: 22 }}
                >
                  <motion.div
                    className="relative w-[min(35vw,200px)] h-[min(35vw,200px)]"
                    animate={{
                      x: [0, 15, -10, 12, -8, 0],
                      y: [0, -12, 8, -15, 10, 0],
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <div className="absolute inset-0 rounded-full overflow-hidden border-4 border-rose-300 shadow-[0_0_40px_rgba(244,114,182,0.5)]">
                      <img
                        key={escapeImageSrc}
                        src={escapeImageSrc}
                        alt="Escape"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="button"
              onPointerEnter={handlePlaySoundHover}
              onClick={handlePlaySoundClick}
              whileHover={
                canPlaySound
                  ? {
                      scale: 1.08,
                      boxShadow: "0 0 35px rgba(255,255,255,0.45)",
                    }
                  : undefined
              }
              whileTap={{ scale: 0.95 }}
              className="relative z-10 rounded-full bg-gradient-to-r from-rose-400 via-pink-400 to-fuchsia-500 px-6 py-3 text-base font-bold text-white shadow-[0_0_60px_rgba(244,114,182,0.55)] backdrop-blur-xl sm:px-10 sm:py-5 sm:text-xl"
            >
              {playButtonLabel}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="pointer-events-none absolute inset-0 bg-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === "finishing" ? 1 : 0 }}
        transition={{ duration: 0.9 }}
      />
    </motion.div>
  );

  return createPortal(content, document.body);
}
