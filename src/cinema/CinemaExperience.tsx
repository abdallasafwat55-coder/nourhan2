import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { CinemaFlicker } from "./CinemaFlicker";
import { CinemaSlideShow } from "./CinemaSlideShow";
import type { CinemaConfig } from "../loadCinemaConfig";
import type { CinemaStage } from "./cinemaTypes";

type Props = {
  open: boolean;
  onClose: () => void;
  config: CinemaConfig;
};

export function CinemaExperience({ open, onClose, config }: Props) {
  const [stage, setStage] = useState<CinemaStage>("intro");
  const [hasVideo, setHasVideo] = useState(false);
  const [bgUrl, setBgUrl] = useState(config.background);
  const pullAudio = useRef<HTMLAudioElement | null>(null);
  const projectorAudio = useRef<HTMLAudioElement | null>(null);
  const ambienceAudio = useRef<HTMLAudioElement | null>(null);
  const movieVideoRef = useRef<HTMLVideoElement | null>(null);

  const safePlay = useCallback((a: HTMLAudioElement | null) => {
    void a?.play().catch(() => {});
  }, []);

  useEffect(() => {
    if (!open) return;
    setStage("intro");
    let cancelled = false;

    setBgUrl(config.background);

    fetch(config.background, { method: "HEAD" })
      .then((r) => {
        if (!cancelled && !r.ok) setBgUrl(config.backgroundFallback);
      })
      .catch(() => {
        if (!cancelled) setBgUrl(config.backgroundFallback);
      });

    fetch(config.video, { method: "HEAD" })
      .then((r) => {
        if (!cancelled) setHasVideo(r.ok);
      })
      .catch(() => {
        if (!cancelled) setHasVideo(false);
      });

    pullAudio.current = new Audio("/audio/pull-screen.mp3");
    projectorAudio.current = new Audio("/audio/projector-on.mp3");
    ambienceAudio.current = new Audio("/audio/cinema-ambience.mp3");
    if (ambienceAudio.current) ambienceAudio.current.loop = true;

    const t1 = window.setTimeout(() => setStage("enter"), 1000);
    const t2 = window.setTimeout(() => {
      setStage("pull");
      safePlay(pullAudio.current);
    }, 3500);
    const t3 = window.setTimeout(() => setStage("sit"), 6500);
    const t4 = window.setTimeout(() => setStage("lightsOff"), 8500);
    const t5 = window.setTimeout(() => {
      setStage("projector");
      safePlay(projectorAudio.current);
      safePlay(ambienceAudio.current);
    }, 10500);
    const t6 = window.setTimeout(() => setStage("movie"), 12500);

    return () => {
      cancelled = true;
      [t1, t2, t3, t4, t5, t6].forEach(window.clearTimeout);
      [pullAudio, projectorAudio, ambienceAudio].forEach((r) => {
        const el = r.current;
        if (el) {
          el.pause();
          el.currentTime = 0;
        }
      });
      const v = movieVideoRef.current;
      if (v) {
        v.pause();
        v.removeAttribute("src");
        v.load();
      }
    };
  }, [open, safePlay, config.background, config.backgroundFallback, config.video]);

  useEffect(() => {
    const video = movieVideoRef.current;
    if (!video) return;

    if (stage === "movie" && hasVideo) {
      video.preload = "auto";
      void video.play().catch(() => {});
      return;
    }

    video.pause();
    video.currentTime = 0;
  }, [stage, hasVideo]);

  const screenOpen =
    stage === "pull" ||
    stage === "sit" ||
    stage === "lightsOff" ||
    stage === "projector" ||
    stage === "movie";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="cinema-root"
          className="fixed inset-0 z-[100] overflow-hidden bg-black text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
      <button
        type="button"
        onClick={onClose}
        className="absolute left-3 top-3 z-[120] rounded-full border border-white/20 bg-black/50 px-3 py-1.5 text-xs backdrop-blur-md hover:bg-white/10 sm:left-6 sm:top-6 sm:px-4 sm:py-2 sm:text-sm"
      >
        تخطي المشهد
      </button>

      <motion.div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${bgUrl}')` }}
        animate={{
          scale: 1,
          filter:
            stage === "lightsOff" || stage === "projector" || stage === "movie"
              ? "brightness(0.32) saturate(1.1)"
              : "brightness(0.95)",
        }}
        transition={{ duration: 2.4 }}
      />

      <motion.div
        className="absolute inset-0 bg-black"
        animate={{
          opacity:
            stage === "lightsOff"
              ? 0.5
              : stage === "projector"
                ? 0.62
                : stage === "movie"
                  ? 0.7
                  : 0.12,
        }}
        transition={{ duration: 1.8 }}
      />

      <motion.div
        className="absolute left-0 top-0 z-30 h-full w-1/2 origin-left bg-gradient-to-r from-[#1a0a18] via-[#3f0d24] to-transparent"
        animate={{
          x: stage === "projector" || stage === "movie" ? "-100%" : "0%",
        }}
        transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.div
        className="absolute right-0 top-0 z-30 h-full w-1/2 origin-right bg-gradient-to-l from-[#1a0a18] via-[#3f0d24] to-transparent"
        animate={{
          x: stage === "projector" || stage === "movie" ? "100%" : "0%",
        }}
        transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
      />

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <motion.div
          className="relative z-20 aspect-video w-[min(92vw,1100px)] max-h-[70vh] overflow-hidden rounded-[28px] border border-white/15 bg-black shadow-[0_0_100px_rgba(120,200,255,0.12)]"
          style={{
            perspective: "1200px",
          }}
          initial={{ x: 0, y: 0, scaleY: 0.06, scaleX: 0.92, rotateX: 14 }}
          animate={{
            scaleY: screenOpen ? 1 : 0.06,
            scaleX: screenOpen ? 1 : 0.92,
            rotateX: stage === "pull" ? [12, 6, 2, 0] : 0,
            y: stage === "pull" ? [0, 6, 0] : 0,
          }}
          transition={{
            duration: 2.4,
            type: "spring",
            stiffness: 64,
            damping: 16,
          }}
        >
          {(stage === "pull" || stage === "enter") && (
            <>
              <motion.div
                className="absolute left-[16%] top-0 z-50 w-1.5 rounded-b bg-amber-200/90"
                style={{ height: "clamp(80px, 18vh, 160px)" }}
                animate={{ scaleY: [1, 1.06, 1] }}
                transition={{ duration: 0.45, repeat: Infinity }}
              />
              <motion.div
                className="absolute right-[16%] top-0 z-50 w-1.5 rounded-b bg-amber-200/90"
                style={{ height: "clamp(80px, 18vh, 160px)" }}
                animate={{ scaleY: [1, 1.05, 1] }}
                transition={{ duration: 0.48, repeat: Infinity, delay: 0.08 }}
              />
            </>
          )}

          {stage === "projector" && (
            <motion.div
              className="absolute inset-0 z-40 bg-white"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 1.35 }}
            />
          )}

          {hasVideo && (stage === "projector" || stage === "movie") && (
            <motion.div
              className="absolute inset-0 z-10 flex items-center justify-center bg-black"
              initial={{ opacity: 0 }}
              animate={{ opacity: stage === "movie" ? 1 : 0 }}
              transition={{ duration: 1.2 }}
            >
              <video
                ref={movieVideoRef}
                className="h-full w-full object-contain"
                src={config.video}
                poster={config.poster}
                preload={stage === "movie" ? "auto" : "metadata"}
                muted={config.muted}
                playsInline
                loop={config.loop}
                controls={false}
              />
            </motion.div>
          )}

          {stage === "movie" && !hasVideo && (
            <div className="absolute inset-0 z-[11]">
              <CinemaSlideShow images={config.fallbackSlides} intervalMs={2600} />
            </div>
          )}

          {stage !== "movie" && (
            <div className="absolute inset-0 z-0 bg-gradient-to-b from-slate-900 via-slate-950 to-black" />
          )}
        </motion.div>
      </div>

      {stage === "projector" && (
        <motion.div
          className="pointer-events-none absolute right-[10%] top-[20%] z-[25] h-[280px] w-[min(70vw,640px)] rotate-[-8deg] bg-gradient-to-l from-cyan-100/25 to-transparent blur-3xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.15, 0.32, 0.2] }}
          transition={{ duration: 0.45, repeat: Infinity }}
        />
      )}

      {stage === "projector" && <CinemaFlicker />}

      <AnimatePresence>
        {stage === "intro" && (
          <motion.div
            key="intro-overlay"
            className="absolute inset-0 z-[110] flex items-center justify-center bg-black/55 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.h1
            className="max-w-[92vw] text-center text-2xl font-extrabold tracking-wide sm:text-6xl md:text-7xl"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.6 }}
            >
              {config.introTitle}
            </motion.h1>
          </motion.div>
        )}
      </AnimatePresence>

      {stage === "movie" && (
        <button
          type="button"
          onClick={onClose}
          className="absolute bottom-4 left-1/2 z-[120] -translate-x-1/2 rounded-full border border-cyan-300/40 bg-cyan-950/80 px-5 py-2 text-xs font-semibold text-cyan-100 shadow-lg backdrop-blur hover:bg-cyan-900/90 sm:bottom-8 sm:px-8 sm:py-3 sm:text-sm"
        >
          متابعة الموقع
        </button>
      )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
