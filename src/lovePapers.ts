/** ظرف واحد فيه مجموعة أوراق */
export type LoveEnvelope = {
  id: number;
  title?: string;
  dearName?: string;
  /** اسم على ختم الظرف (لو مش موجود يستخدم المؤلف الافتراضي) */
  name?: string;
  /** صورة الختم (لو مش موجودة تستخدم صورة المؤلف) */
  image?: string;
  papers: LovePaperItem[];
};

/** ورقة واحدة داخل ظرف الرسائل — عدّل المحتوى من src/data/love-envelopes.json (حد أقصى ٥ أوراق لكل ظرف) */
export type LovePaperItem =
  | {
      id: number;
      type: "text";
      title?: string;
      body: string;
    }
  | {
      id: number;
      type: "image";
      src: string;
      caption?: string;
    }
  | {
      id: number;
      type: "video";
      src: string;
      poster?: string;
      caption?: string;
    };

export type ScatterSlot = {
  x: number;
  y: number;
  rotate: number;
  scale: number;
  zIndex: number;
};

/** رفع بسيط فوق الظرف — بدون رفع زائد للأعلى */
export const SCATTER_LIFT_Y = -42;

/**
 * ترتيب الخروج: ترمية — يمين — ثانية — يسار — أعلى — أسفل — فوق الرسالة
 * المواضع متباعدة أفقياً وعمودياً عشان مفيش تغطية
 */
export type PaperReleaseSlotId =
  | "throw-first"
  | "right"
  | "second"
  | "left"
  | "top"
  | "bottom"
  | "above-envelope";

export const PAPER_RELEASE_ORDER: readonly PaperReleaseSlotId[] = [
  "throw-first",
  "right",
  "second",
  "left",
  "top",
  "bottom",
  "above-envelope",
] as const;

const RELEASE_SLOTS: Record<PaperReleaseSlotId, ScatterSlot> = {
  /** وسط — قريب من الظرف مش فوق الشاشة */
  "throw-first": { x: 0, y: -105, rotate: 4, scale: 1, zIndex: 62 },
  right: { x: 430, y: -75, rotate: 11, scale: 0.88, zIndex: 58 },
  second: { x: 235, y: 35, rotate: 6, scale: 0.86, zIndex: 59 },
  left: { x: -430, y: -75, rotate: -11, scale: 0.88, zIndex: 58 },
  /** ورقة ٥ — أعلى يسار (بعيد عن الورقة الأولى في الوسط) */
  top: { x: -305, y: -158, rotate: -6, scale: 0.9, zIndex: 65 },
  bottom: { x: -265, y: 55, rotate: -6, scale: 0.84, zIndex: 56 },
  "above-envelope": { x: 0, y: 25, rotate: 0, scale: 0.92, zIndex: 61 },
};

export function getReleaseSlot(paperIndex: number): ScatterSlot {
  const slotId =
    PAPER_RELEASE_ORDER[paperIndex % PAPER_RELEASE_ORDER.length];
  return RELEASE_SLOTS[slotId];
}

export const PAPER_HOLD_MS = 5000;
