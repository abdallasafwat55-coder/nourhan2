import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import {
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { ArrowRight, Heart, Sparkles, X } from "lucide-react";
import type { LoveAuthor } from "./loadLoveEnvelopes";
import type { LoveEnvelope, LovePaperItem } from "./lovePapers";
import {
  getReleaseSlot,
  PAPER_HOLD_MS,
  SCATTER_LIFT_Y,
} from "./lovePapers";
import { stopSiteMusic } from "./memory/BackgroundMusic";

type Props = {
  open: boolean;
  onClose: () => void;
  envelopes: readonly LoveEnvelope[];
  author?: LoveAuthor;
};

const OPEN_AFTER_SELECT_MS = 850;

const theme = {
  wax: "#c62828",
  waxDark: "#8e1a1a",
  paper: "#fffaf3",
  paperEdge: "#e8dcc8",
  ink: "#2c1810",
  gold: "#d4a853",
  cyan: "#67e8f9",
};

function useScatterScale() {
  return useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener("resize", onStoreChange);
      return () => window.removeEventListener("resize", onStoreChange);
    },
    () => (window.innerWidth < 640 ? 0.72 : window.innerWidth < 1024 ? 0.88 : 1),
    () => 1
  );
}

function ModalBackdrop() {
  return (
    <>
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 120% 80% at 50% 0%, #4a1c32 0%, #1a0d14 38%, #061126 72%, #020817 100%)",
        }}
        aria-hidden
      />
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(103,232,249,0.12) 0%, transparent 42%), radial-gradient(circle at 80% 20%, rgba(212,168,83,0.14) 0%, transparent 38%)",
        }}
        aria-hidden
      />
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
        aria-hidden
      />
    </>
  );
}

function FloatingHearts() {
  const hearts = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        id: i,
        left: `${8 + ((i * 19) % 84)}%`,
        top: `${6 + ((i * 27) % 88)}%`,
        size: 12 + (i % 4) * 5,
        delay: (i % 5) * 0.45,
        duration: 3.8 + (i % 3) * 0.5,
      })),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {hearts.map((h) => (
        <motion.span
          key={h.id}
          className="absolute text-rose-200/50"
          style={{ left: h.left, top: h.top, fontSize: h.size }}
          animate={{ y: [0, -14, 0], opacity: [0.2, 0.55, 0.2] }}
          transition={{
            duration: h.duration,
            delay: h.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          ♥
        </motion.span>
      ))}
    </div>
  );
}

function PaperDecor() {
  return (
    <motion.div
      className="mb-3 flex items-center justify-center gap-3"
      style={{ color: theme.wax }}
      aria-hidden
    >
      <span className="h-px w-8 bg-gradient-to-r from-transparent to-rose-300/80" />
      <Heart className="h-3.5 w-3.5 fill-current" />
      <span className="h-px w-8 bg-gradient-to-l from-transparent to-rose-300/80" />
    </motion.div>
  );
}

const THROW_ANIMATION = {
  duration: 0.95,
  times: [0, 0.42, 1] as [number, number, number],
  ease: [0.22, 1.1, 0.42, 1] as [number, number, number, number],
};

function LovePaperCard({
  paper,
  scatter,
  revealed,
  scatterScale,
  stackOrder,
}: {
  paper: LovePaperItem;
  scatter: ReturnType<typeof getReleaseSlot>;
  revealed: boolean;
  scatterScale: number;
  stackOrder: number;
}) {
  const x = scatter.x * scatterScale;
  const y = (scatter.y + SCATTER_LIFT_Y) * scatterScale;
  const scale = scatter.scale * (scatterScale < 1 ? 0.92 : 1);
  const hidden = { x: 0, y: 0, scale: 0.08, rotate: 0, opacity: 0 };

  return (
    <motion.div
      className="absolute left-1/2 top-1/2 w-[min(68vw,252px)] max-w-[252px]"
      style={{ zIndex: scatter.zIndex + stackOrder * 4 }}
      initial={hidden}
      animate={
        revealed
          ? {
              x: [0, x * 0.35, x],
              y: [0, y * 0.15 - 28 * scatterScale, y],
              scale: [0.06, scale * 1.06, scale],
              rotate: [0, scatter.rotate + 12, scatter.rotate],
              opacity: [0, 1, 1],
            }
          : hidden
      }
      transition={revealed ? THROW_ANIMATION : { duration: 0.2 }}
    >
      <div
        className="overflow-hidden rounded-2xl px-4 py-4 shadow-[0_20px_50px_rgba(0,0,0,0.35)] ring-1"
        style={{
          background: `linear-gradient(165deg, ${theme.paper} 0%, #f5ebe0 55%, ${theme.paperEdge} 100%)`,
          borderColor: "rgba(212,168,83,0.35)",
          color: theme.ink,
        }}
      >
        <PaperDecor />
        {paper.type === "text" && (
          <>
            {paper.title && (
              <p
                className="mb-2 text-center font-['Playfair_Display',serif] text-xs font-semibold uppercase tracking-[0.2em]"
                style={{ color: theme.wax }}
              >
                {paper.title}
              </p>
            )}
            <p className="text-center font-['Dancing_Script',cursive] text-[1.4rem] leading-relaxed">
              {paper.body}
            </p>
          </>
        )}
        {paper.type === "image" && (
          <>
            <motion.div className="overflow-hidden rounded-xl ring-1 ring-black/10">
              <img
                src={paper.src}
                alt={paper.caption ?? ""}
                className="max-h-[210px] w-full object-cover"
              />
            </motion.div>
            {paper.caption && (
              <p className="mt-3 text-center font-['Dancing_Script',cursive] text-xl">
                {paper.caption}
              </p>
            )}
          </>
        )}
        {paper.type === "video" && (
          <>
            <motion.div className="overflow-hidden rounded-xl bg-black ring-1 ring-black/20">
              <video
                src={paper.src}
                poster={paper.poster}
                className="max-h-[210px] w-full object-cover"
                controls
                playsInline
                preload="metadata"
              />
            </motion.div>
            {paper.caption && (
              <p className="mt-3 text-center font-['Dancing_Script',cursive] text-xl">
                {paper.caption}
              </p>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}

/** صورة + اسم الكاتب — ختم على الظرف (زي القلب) */
function EnvelopeAuthorSeal({
  name,
  image,
  compact,
}: {
  name: string;
  image: string;
  compact: boolean;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  const photoPx = compact ? 38 : 54;
  const heartSize = compact ? 14 : 20;

  return (
    <div
      className="absolute left-1/2 z-30 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
      style={{ top: compact ? "54%" : "52%" }}
      dir="ltr"
      aria-label={name}
    >
      <div
        className="flex flex-col items-center rounded-2xl border border-amber-600/35 px-2 pb-2 pt-1.5 shadow-[0_8px_28px_rgba(0,0,0,0.28)] sm:px-2.5 sm:pb-2.5"
        style={{
          background: "linear-gradient(165deg, #fffdf9 0%, #f3e8d6 55%, #e8dcc8 100%)",
          boxShadow:
            "0 8px 28px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.95), inset 0 -2px 6px rgba(180,140,80,0.15)",
        }}
      >
        <div
          className="relative rounded-full p-[3px]"
          style={{
            background: `radial-gradient(circle at 30% 25%, #e53935, ${theme.waxDark})`,
            boxShadow: "0 3px 10px rgba(0,0,0,0.25)",
          }}
        >
          {!imgFailed ? (
            <img
              src={image}
              alt=""
              onError={() => setImgFailed(true)}
              width={photoPx}
              height={photoPx}
              className="rounded-full object-cover object-center ring-2 ring-[#fffaf3]"
              style={{ width: photoPx, height: photoPx }}
            />
          ) : (
            <div
              className="flex items-center justify-center rounded-full bg-rose-200 font-bold text-rose-950 ring-2 ring-[#fffaf3]"
              style={{ width: photoPx, height: photoPx, fontSize: compact ? 14 : 18 }}
              aria-hidden
            >
              {initial}
            </div>
          )}
          <span
            className="absolute -bottom-0.5 -right-0.5 flex items-center justify-center rounded-full shadow-md"
            style={{
              width: heartSize + 8,
              height: heartSize + 8,
              background: `radial-gradient(circle at 35% 30%, #e53935, ${theme.waxDark})`,
            }}
            aria-hidden
          >
            <Heart size={heartSize} className="text-white" fill="currentColor" />
          </span>
        </div>
        <span
          className={
            compact
              ? "mt-1.5 max-w-[5.5rem] truncate font-sans text-[clamp(0.55rem,2.6vw,0.68rem)] font-bold uppercase tracking-[0.14em] text-[#3d2817]"
              : "mt-2 max-w-[7rem] truncate font-sans text-[clamp(0.62rem,2.2vw,0.78rem)] font-bold uppercase tracking-[0.18em] text-[#3d2817] sm:max-w-[8rem]"
          }
        >
          {name}
        </span>
      </div>
    </div>
  );
}

function envelopeSeal(
  envelope: LoveEnvelope,
  author: LoveAuthor
): { name: string; image: string } {
  return {
    name: envelope.name ?? author.name,
    image: envelope.image ?? author.image,
  };
}

function EnvelopeShell({
  envelope,
  author,
  compact,
  opened,
  onSelect,
}: {
  envelope: LoveEnvelope;
  author: LoveAuthor;
  compact: boolean;
  opened: boolean;
  onSelect?: () => void;
}) {
  const seal = envelopeSeal(envelope, author);
  const width = compact ? "min(42vw, 200px)" : "min(88vw, 340px)";
  const minH = compact ? "min(168px, 44vw)" : opened ? "200px" : "260px";

  const Shell = onSelect ? motion.button : motion.div;

  return (
    <Shell
      type={onSelect ? "button" : undefined}
      layoutId={`envelope-${envelope.id}`}
      onClick={onSelect}
      className={`group relative block text-left outline-none ${
        onSelect
          ? "cursor-pointer rounded-lg focus-visible:ring-2 focus-visible:ring-cyan-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
          : "cursor-default"
      }`}
      style={{ perspective: "1200px", width }}
      whileHover={onSelect ? { y: -4 } : undefined}
      whileTap={onSelect ? { scale: 0.98 } : undefined}
    >
      {!compact && (
        <motion.span
          className="pointer-events-none absolute -right-1 -top-6 z-50 text-rose-300/90"
          animate={{ scale: [1, 1.12, 1] }}
          transition={{ duration: 2.2, repeat: Infinity }}
        >
          <Sparkles className="h-7 w-7" />
        </motion.span>
      )}

      <motion.div
        className={`relative w-full transition-shadow duration-300 ${
          onSelect
            ? "group-hover:shadow-[0_20px_50px_rgba(103,232,249,0.2)]"
            : ""
        }`}
        style={{ minHeight: minH, transformStyle: "preserve-3d" }}
      >
        <motion.div
          className="relative overflow-visible rounded-xl shadow-[0_16px_48px_rgba(0,0,0,0.32)]"
          style={{
            minHeight: minH,
            background: "linear-gradient(180deg, #faf6ee 0%, #f0e8da 100%)",
            border: "1px solid rgba(212,168,83,0.45)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)",
          }}
        >
          <motion.div
            className="pointer-events-none absolute left-0 right-0 top-0 z-20 h-[52%] origin-top rounded-t-xl"
            style={{
              background: "linear-gradient(180deg, #f5efe4 0%, #ebe3d4 100%)",
              clipPath: "polygon(0 0, 100% 0, 50% 100%)",
              borderBottom: "1px solid rgba(0,0,0,0.06)",
            }}
            animate={
              opened
                ? { rotateX: -168, y: -12, opacity: 0.45 }
                : { rotateX: 0, y: 0, opacity: 1 }
            }
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          />

          <motion.div
            className="pointer-events-none absolute inset-x-3 top-[48%] z-[5] h-px bg-gradient-to-r from-transparent via-amber-700/20 to-transparent"
            aria-hidden
          />

          {opened && !compact && (
            <motion.div
              className="relative z-10 flex min-h-[120px] flex-col items-center justify-center px-4 py-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <p className="font-['Dancing_Script',cursive] text-2xl" style={{ color: theme.wax }}>
                ♥ مفتوحة
              </p>
            </motion.div>
          )}
        </motion.div>

        {!opened && (
          <EnvelopeAuthorSeal
            name={seal.name}
            image={seal.image}
            compact={compact}
          />
        )}
      </motion.div>

      {compact && envelope.title && (
        <p className="mt-2 max-w-full px-1 text-center font-sans text-[clamp(0.62rem,2.8vw,0.75rem)] font-semibold leading-snug text-cyan-100/90">
          {envelope.title}
        </p>
      )}
    </Shell>
  );
}

function getPickerExit(index: number) {
  const side = index % 2 === 0 ? -1 : 1;
  return {
    opacity: 0,
    scale: 0.4,
    x: side * 320,
    y: 90,
    rotate: side * 14,
    filter: "blur(8px)",
  };
}

function GlassButton({
  children,
  onClick,
  className = "",
}: {
  children: ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-md transition hover:border-cyan-300/40 hover:bg-white/15 ${className}`}
    >
      {children}
    </button>
  );
}

export function LoveEnvelopeModal({
  open,
  onClose,
  envelopes,
  author = { name: "Abdal", image: "/images/g5.jpg" },
}: Props) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [pickingId, setPickingId] = useState<number | null>(null);
  const [opened, setOpened] = useState(false);
  const [releasedCount, setReleasedCount] = useState(0);
  const scatterScale = useScatterScale();

  const selectedEnvelope = envelopes.find((e) => e.id === selectedId) ?? null;
  const papers = selectedEnvelope?.papers ?? [];

  useEffect(() => {
    if (!open) {
      setSelectedId(null);
      setPickingId(null);
      setOpened(false);
      setReleasedCount(0);
    }
  }, [open]);

  useEffect(() => {
    if (selectedId === null) {
      setOpened(false);
      setReleasedCount(0);
      return;
    }

    const timer = window.setTimeout(() => setOpened(true), OPEN_AFTER_SELECT_MS);
    return () => window.clearTimeout(timer);
  }, [selectedId]);

  useEffect(() => {
    if (!opened || releasedCount >= papers.length) return;

    const delay = releasedCount === 0 ? 500 : PAPER_HOLD_MS;
    const timer = window.setTimeout(() => setReleasedCount((n) => n + 1), delay);
    return () => window.clearTimeout(timer);
  }, [opened, releasedCount, papers.length]);

  const handleSelect = (id: number) => {
    if (selectedId !== null || pickingId !== null) return;
    setPickingId(id);
    setOpened(false);
    setReleasedCount(0);
    stopSiteMusic();

    window.setTimeout(() => {
      setSelectedId(id);
      setPickingId(null);
    }, 580);
  };

  const progress =
    papers.length > 0 ? Math.min(releasedCount / papers.length, 1) : 0;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="love-envelope"
          className="fixed inset-0 z-[90] overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <ModalBackdrop />
          <FloatingHearts />

          <div className="absolute right-4 top-4 z-[80] flex gap-2">
            {selectedId !== null && (
              <GlassButton
                onClick={() => {
                  setSelectedId(null);
                  setPickingId(null);
                  setOpened(false);
                  setReleasedCount(0);
                }}
              >
                <span className="flex items-center gap-1.5">
                  <ArrowRight className="h-4 w-4 rotate-180" />
                  كل الظروف
                </span>
              </GlassButton>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition hover:border-rose-300/50 hover:bg-white/15"
              aria-label="إغلاق"
            >
              <X size={20} />
            </button>
          </div>

          {selectedEnvelope && opened && papers.length > 0 && (
            <motion.div
              className="absolute bottom-[max(1rem,env(safe-area-inset-bottom))] left-6 right-6 z-[80] mx-auto max-w-md"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <motion.div className="mb-2 flex justify-between text-xs text-white/70">
                <span>الأوراق</span>
                <span>
                  {releasedCount} / {papers.length}
                </span>
              </motion.div>
              <motion.div className="h-1.5 overflow-hidden rounded-full bg-white/15">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${theme.wax}, ${theme.gold})`,
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress * 100}%` }}
                  transition={{ duration: 0.4 }}
                />
              </motion.div>
            </motion.div>
          )}

          <div
            className={`relative mx-auto flex h-full w-full max-w-5xl items-center justify-center px-3 pb-20 sm:px-4 ${
              selectedEnvelope ? "pt-20 sm:pt-24" : "pt-12 sm:pt-16"
            }`}
          >
            {selectedEnvelope && (
              <div
                className={`absolute inset-0 z-[55] flex items-center justify-center ${
                  opened ? "pointer-events-auto" : "pointer-events-none"
                }`}
              >
                {papers.map((paper, i) => (
                  <LovePaperCard
                    key={paper.id}
                    paper={paper}
                    scatter={getReleaseSlot(i)}
                    revealed={opened && i < releasedCount}
                    scatterScale={scatterScale}
                    stackOrder={i}
                  />
                ))}
              </div>
            )}

            <LayoutGroup>
              <div className="relative z-40 flex w-full items-center justify-center">
                <AnimatePresence mode="wait">
                  {selectedEnvelope ? (
                    <motion.div
                      key={`selected-${selectedEnvelope.id}`}
                      className="relative shrink-0"
                      initial={{ opacity: 0, scale: 0.88, y: 24 }}
                      animate={{
                        opacity: 1,
                        y: opened ? 190 : 0,
                        scale: opened ? 0.8 : 1,
                      }}
                      exit={{ opacity: 0, scale: 0.92, y: 16 }}
                      transition={{ type: "spring", stiffness: 200, damping: 22 }}
                    >
                      <EnvelopeShell
                        envelope={selectedEnvelope}
                        author={author}
                        compact={false}
                        opened={opened}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="picker"
                      className="w-full max-w-4xl px-2 sm:px-4"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
                      transition={{ duration: 0.45 }}
                    >
                      <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 md:gap-7 lg:gap-8">
                        <AnimatePresence>
                          {envelopes.map((envelope, index) => {
                            if (pickingId === envelope.id) return null;

                            return (
                              <motion.div
                                key={envelope.id}
                                layout
                                initial={{ opacity: 0, y: 24, scale: 0.94 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={getPickerExit(index)}
                                transition={{
                                  duration: 0.55,
                                  delay: index * 0.05,
                                  ease: [0.32, 0, 0.67, 0],
                                }}
                                className={`flex justify-center pt-1 sm:pt-2 ${
                                  envelopes.length === 5 && index === 4
                                    ? "col-span-2 justify-self-center md:col-span-1 md:col-start-2"
                                    : ""
                                }`}
                              >
                                <EnvelopeShell
                                  envelope={envelope}
                                  author={author}
                                  compact
                                  opened={false}
                                  onSelect={() => handleSelect(envelope.id)}
                                />
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </LayoutGroup>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
