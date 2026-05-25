import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  type PanInfo,
} from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { IMAGE_DISPLAY_MS, MEMORIES } from "./memories";
import { MemoryMedia } from "./MemoryMedia";

const CARD_COUNT = MEMORIES.length;
const ANGLE_STEP = 360 / CARD_COUNT;
const RADIUS = 600;
const CARD_W = 204;
const CARD_H = 276;

function cardOffset(index: number, active: number) {
  let diff = index - active;
  if (diff > CARD_COUNT / 2) diff -= CARD_COUNT;
  if (diff < -CARD_COUNT / 2) diff += CARD_COUNT;
  return diff;
}

type Props = {
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  onHeartClick?: () => void;
};

export function MemoryCarousel({
  activeIndex: active,
  onActiveIndexChange,
  onHeartClick,
}: Props) {
  const [dragging, setDragging] = useState(false);
  const [videoLocked, setVideoLocked] = useState(false);
  const [radius] = useState(RADIUS);
  const dragX = useMotionValue(0);
  const rotation = useMotionValue(0);
  const rotationSpring = useSpring(rotation, { stiffness: 45, damping: 20, mass: 1.1 });
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const centerVideoRef = useRef<HTMLVideoElement>(null);

  const clearAdvanceTimer = useCallback(() => {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
  }, []);

  const go = useCallback(
    (dir: 1 | -1) => {
      onActiveIndexChange((active + dir + CARD_COUNT) % CARD_COUNT);
    },
    [active, onActiveIndexChange]
  );

  const goNext = useCallback(() => go(1), [go]);

  const goUnlessVideo = useCallback(
    (dir: 1 | -1) => {
      if (videoLocked) return;
      go(dir);
    },
    [go, videoLocked]
  );


  useEffect(() => {
    rotation.set(-active * ANGLE_STEP);
  }, [active, rotation]);

  const activeMemory = MEMORIES[active];

  useEffect(() => {
    clearAdvanceTimer();
    setVideoLocked(activeMemory.type === "video");

    if (dragging || videoLocked) return;
    if (activeMemory.type === "image") {
      advanceTimerRef.current = setTimeout(() => goNext(), IMAGE_DISPLAY_MS);
    }
    return clearAdvanceTimer;
  }, [active, activeMemory.type, dragging, videoLocked, goNext, clearAdvanceTimer]);

  useEffect(() => {
    const v = centerVideoRef.current;
    if (!v || activeMemory.type !== "video") return;

    v.currentTime = 0;
    if (!dragging) void v.play().catch(() => {});
  }, [active, activeMemory.type, activeMemory.src, dragging]);

  useEffect(() => {
    const v = centerVideoRef.current;
    if (!v || activeMemory.type !== "video") return;
    if (!dragging && !v.ended) void v.play().catch(() => {});
  }, [dragging, activeMemory.type]);

  const handleVideoEnded = useCallback(() => {
    setVideoLocked(false);
    if (!dragging) goNext();
  }, [dragging, goNext]);

  const handleVideoPlay = useCallback(() => {
    setVideoLocked(true);
  }, []);

  const handleVideoError = useCallback(() => {
    setVideoLocked(false);
    if (!dragging) goNext();
  }, [dragging, goNext]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    setDragging(false);
    if (videoLocked) {
      dragX.set(0);
      return;
    }
    const threshold = 50;
    if (info.offset.x > threshold || info.velocity.x > 350) goUnlessVideo(-1);
    else if (info.offset.x < -threshold || info.velocity.x < -350) goUnlessVideo(1);
    dragX.set(0);
  };

  return (
    <div
      className="relative mx-auto mt-3 w-full max-w-[min(100%,72rem)] px-1 sm:mt-5 sm:px-2 md:mt-6"
      dir="ltr"
    >
      <div className="memory-carousel-row relative w-full px-14 sm:px-24 md:px-32 lg:px-40">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="الذكرى السابقة"
          className="memory-nav-btn memory-nav-btn-prev absolute left-0 top-[min(27vh,266px)] z-50 -translate-y-1/2"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <button
          type="button"
          onClick={() => go(1)}
          aria-label="الذكرى التالية"
          className="memory-nav-btn memory-nav-btn-next absolute right-0 top-[min(27vh,266px)] z-50 -translate-y-1/2"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        <div className="memory-carousel-stage relative mx-auto w-full">
        <motion.div
          className="memory-carousel-viewport relative mx-auto cursor-grab active:cursor-grabbing"
          style={{ height: "min(54vh, 532px)", maxHeight: 532, x: dragX }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.06}
          onDragStart={() => setDragging(true)}
          onDragEnd={handleDragEnd}
        >
          <div className="memory-carousel-perspective absolute inset-0 flex items-center justify-center">
            <motion.div
              className="memory-carousel-ring"
              style={{
                rotateY: rotationSpring,
                width: CARD_W,
                height: CARD_H,
              }}
            >
              {MEMORIES.map((memory, i) => {
                const offset = cardOffset(i, active);
                const abs = Math.abs(offset);
                const isCenter = offset === 0;
                const angle = i * ANGLE_STEP;

                return (
                  <div
                    key={memory.id}
                    className="memory-card-slot"
                    style={{
                      transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                    }}
                  >
                    <motion.div
                      className="memory-card-inner"
                      animate={{
                        scale: isCenter ? 1.12 : Math.max(0.55, 1 - abs * 0.16),
                        opacity: isCenter ? 1 : Math.max(0.3, 1 - abs * 0.28),
                      }}
                      transition={{
                        duration: 0.9,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      style={{
                        filter: isCenter ? "blur(0px)" : `blur(${Math.min(5, abs * 2.5)}px)`,
                        zIndex: isCenter ? 50 : 20 - abs,
                      }}
                    >
                      <motion.article
                        className={`memory-card relative overflow-hidden rounded-2xl sm:rounded-3xl ${
                          isCenter ? "memory-card-active" : ""
                        }`}
                        style={{
                          width: CARD_W,
                          height: CARD_H,
                          boxShadow: isCenter ? `0 0 60px ${memory.glow}` : "none",
                        }}
                      >
                        <div className="relative h-full overflow-hidden">
                          <MemoryMedia
                            memory={memory}
                            isCenter={isCenter}
                            videoRef={centerVideoRef}
                            onVideoEnded={isCenter ? handleVideoEnded : undefined}
                            onVideoPlay={isCenter ? handleVideoPlay : undefined}
                            onVideoError={isCenter ? handleVideoError : undefined}
                          />
                          <div
                            className="absolute inset-0"
                            style={{
                              background: isCenter
                                ? "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 50%)"
                                : "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.2) 100%)",
                            }}
                          />
                          {isCenter && (
                            <motion.div
                              className="absolute inset-0 pointer-events-none"
                              style={{
                                background: `radial-gradient(circle at 50% 30%, ${memory.glow}55, transparent 65%)`,
                              }}
                              animate={{ opacity: [0.35, 0.7, 0.35] }}
                              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                            />
                          )}
                        </div>

                        <AnimatePresence mode="wait">
                          {isCenter && (
                            <motion.div
                              key={`quote-${memory.id}`}
                              className="absolute inset-x-0 bottom-0 p-4 text-center"
                              dir="rtl"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 12 }}
                              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                            >
                              <p className="font-serif text-sm leading-relaxed text-white sm:text-[15px]">
                                {memory.quote}
                              </p>
                              <p className="mt-2 text-xs" style={{ color: memory.accent }}>
                                {memory.date}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.article>
                    </motion.div>
                  </div>
                );
              })}
            </motion.div>
          </div>
        </motion.div>
        </div>
      </div>

      <div className="relative z-20 mt-2 flex flex-col items-center gap-4 sm:mt-4" dir="rtl">
        <motion.button
          type="button"
          className="memory-heart-btn group"
          aria-label="قلب الذكريات"
          onClick={(e) => {
            e.stopPropagation();
            onHeartClick?.();
          }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          animate={{
            boxShadow: [
              `0 0 40px ${activeMemory.glow}`,
              `0 0 70px ${activeMemory.glow}`,
              `0 0 40px ${activeMemory.glow}`,
            ],
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.span
            className="text-3xl"
            animate={{ scale: [1, 1.12, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          >
            ♥
          </motion.span>
        </motion.button>

        <motion.p
          key={activeMemory.id}
          className="max-w-md px-6 text-center font-serif text-lg text-white/80 sm:text-xl"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          اضغطي على القلب…
        </motion.p>

        <div className="flex gap-1.5">
          {MEMORIES.map((m, i) => (
            <button
              key={m.id}
              type="button"
              aria-label={`انتقل إلى ${i + 1}`}
              onClick={() => {
                if (videoLocked) return;
                onActiveIndexChange(i);
              }}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === active ? "w-8 bg-neonpink" : "w-1.5 bg-white/25 hover:bg-white/45"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
