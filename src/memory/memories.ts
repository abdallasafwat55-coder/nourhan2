export type MemoryMediaType = "image" | "video";

export type MemoryCard = {
  id: string;
  /** مسار الصورة أو الفيديو */
  src: string;
  type: MemoryMediaType;
  /** صورة غلاف للفيديو (اختياري) */
  poster?: string;
  quote: string;
  date: string;
  accent: string;
  glow: string;
};

const VIDEO_EXT = /\.(mp4|webm|ogg|mov)(\?.*)?$/i;

export function inferMediaType(src: string): MemoryMediaType {
  return VIDEO_EXT.test(src) ? "video" : "image";
}

function card(
  partial: Omit<MemoryCard, "type"> & { type?: MemoryMediaType }
): MemoryCard {
  const type = partial.type ?? inferMediaType(partial.src);
  return { ...partial, type };
}

export const IMAGE_DISPLAY_MS = 5000;

const ACCENT_PALETTE: ReadonlyArray<{ accent: string; glow: string }> = [
  { accent: "#ff4da6", glow: "rgba(255, 77, 166, 0.55)" },
  { accent: "#a855f7", glow: "rgba(168, 85, 247, 0.5)" },
  { accent: "#6366f1", glow: "rgba(99, 102, 241, 0.5)" },
  { accent: "#ec4899", glow: "rgba(236, 72, 153, 0.5)" },
  { accent: "#f472b6", glow: "rgba(244, 114, 182, 0.5)" },
  { accent: "#818cf8", glow: "rgba(129, 140, 248, 0.5)" },
  { accent: "#e879f9", glow: "rgba(232, 121, 249, 0.5)" },
  { accent: "#22d3ee", glow: "rgba(34, 211, 238, 0.45)" },
  { accent: "#fb7185", glow: "rgba(251, 113, 133, 0.5)" },
  { accent: "#c084fc", glow: "rgba(192, 132, 252, 0.5)" },
  { accent: "#fbbf24", glow: "rgba(251, 191, 36, 0.45)" },
  { accent: "#34d399", glow: "rgba(52, 211, 153, 0.45)" },
  { accent: "#60a5fa", glow: "rgba(96, 165, 250, 0.5)" },
  { accent: "#f97316", glow: "rgba(249, 115, 22, 0.45)" },
  { accent: "#a78bfa", glow: "rgba(167, 139, 250, 0.5)" },
  { accent: "#fb923c", glow: "rgba(251, 146, 60, 0.45)" },
];

/** ١٢ صورة — عدّل المسارات من public */
const IMAGE_SOURCES: readonly string[] = [
  "/Screenshot (654).png",
  "video/New/norha/mamtha.jpeg",
  "video/New/norha/lila.jpeg",
  "video/New/norha/nona.jpeg",
  "video/New/norha/nona1.jpeg",
  "video/New/norha/nona2.jpeg",
  "video/New/norha/nona3.jpeg",
  "video/New/norha/nona4.jpeg",
  "video/New/norha/nona5.jpeg",
  "video/New/norha/nona6.jpeg",
  "video/New/norha/What.jpeg",
  "images/cinma/WhatsApp.jpeg",
];

/** ٦ فيديوهات — عدّل المسارات من public/video */
const VIDEO_SOURCES: readonly string[] = [
  "video/New/okZYBIkQvi.mp4",
  "video/New/norha/_ام سعيد -- ملكه المصنعات-- --❤️❤️❤️❤️❤️(MP4).mp4",
  "video/New/norha/_foryou(MP4).mp4",
  "video/New/norha/نورهانا.mp4",
  "video/New/norha/الاغنيه تشتغل من هنا  والعياط كله يجي من هنا --❤️❤️❤️❤️❤️❤️❤️❤️(MP4).mp4",
  "video/New/norha/WhatsApp Video 2026-05-25 at 03.53.49.mp4",
];

const MEMORY_DATES: readonly string[] = [
  "٢٠ يوليو ٢٠٢٦",
  "١٤ فبراير ٢٠٢٦",
  "٩ مارس ٢٠٢٦",
  "٩ أبريل ٢٠٢٦",
  "٢١ مايو ٢٠٢٦",
  "١٠ يونيو ٢٠٢٦",
  "٥ يوليو ٢٠٢٦",
  "١٢ أغسطس ٢٠٢٦",
  "٣ سبتمبر ٢٠٢٦",
  "١٨ أكتوبر ٢٠٢٦",
  "٢ نوفمبر ٢٠٢٦",
  "٧ ديسمبر ٢٠٢٦",
  "١ يناير ٢٠٢٦",
  "١٤ فبراير ٢٠٢٦",
  "٢٠ مارس ٢٠٢٦",
  "٢٥ أبريل ٢٠٢٦",
  "٨ مايو ٢٠٢٦",
  "١٩ يونيو ٢٠٢٦",
];

/** صورة → فيديو → … (٦ أزواج) ثم باقي الصور (١٢ صورة + ٦ فيديو) */
function buildAlternatingMemories(): MemoryCard[] {
  const items: MemoryCard[] = [];
  let imageIndex = 0;
  let videoIndex = 0;
  let order = 0;

  const palette = (i: number) => ACCENT_PALETTE[i % ACCENT_PALETTE.length];

  while (imageIndex < IMAGE_SOURCES.length || videoIndex < VIDEO_SOURCES.length) {
    if (imageIndex < IMAGE_SOURCES.length) {
      const theme = palette(order);
      items.push(
        card({
          id: `m${order + 1}`,
          type: "image",
          src: IMAGE_SOURCES[imageIndex],
          quote: "",
          date: MEMORY_DATES[order] ?? "",
          accent: theme.accent,
          glow: theme.glow,
        })
      );
      imageIndex += 1;
      order += 1;
    }

    if (videoIndex < VIDEO_SOURCES.length) {
      const theme = palette(order);
      const poster = IMAGE_SOURCES[videoIndex % IMAGE_SOURCES.length];
      items.push(
        card({
          id: `m${order + 1}`,
          type: "video",
          src: VIDEO_SOURCES[videoIndex],
          poster,
          quote: "",
          date: MEMORY_DATES[order] ?? "",
          accent: theme.accent,
          glow: theme.glow,
        })
      );
      videoIndex += 1;
      order += 1;
    }
  }

  return items;
}

export const MEMORIES: MemoryCard[] = buildAlternatingMemories();

/** للخلفية: صورة أو بوستر الفيديو */
export function memoryPoster(memory: MemoryCard): string {
  return memory.poster ?? memory.src;
}
