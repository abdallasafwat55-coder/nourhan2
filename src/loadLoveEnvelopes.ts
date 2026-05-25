import envelopesConfig from "./data/love-envelopes.json";
import type { LoveEnvelope, LovePaperItem } from "./lovePapers";

export const MAX_PAPERS_PER_ENVELOPE = 5;

export type LoveAuthor = {
  name: string;
  image: string;
};

type EnvelopesFile = {
  recipientName?: string;
  author?: unknown;
  envelopes: unknown[];
};

function parseAuthor(raw: unknown): LoveAuthor {
  if (!isRecord(raw)) {
    return { name: "Abdal", image: "/images/g5.jpg" };
  }
  const name =
    typeof raw.name === "string" && raw.name.trim() ? raw.name.trim() : "Abdal";
  const image =
    typeof raw.image === "string" && raw.image.trim()
      ? raw.image.trim()
      : "/images/g5.jpg";
  return { name, image };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parsePaper(raw: unknown, envelopeId: number, index: number): LovePaperItem | null {
  if (!isRecord(raw)) return null;

  const id = typeof raw.id === "number" ? raw.id : envelopeId * 100 + index + 1;
  const type = raw.type;

  if (type === "text") {
    if (typeof raw.body !== "string" || !raw.body.trim()) return null;
    return {
      id,
      type: "text",
      ...(typeof raw.title === "string" && raw.title.trim()
        ? { title: raw.title.trim() }
        : {}),
      body: raw.body.trim(),
    };
  }

  if (type === "image") {
    if (typeof raw.src !== "string" || !raw.src.trim()) return null;
    return {
      id,
      type: "image",
      src: raw.src.trim(),
      ...(typeof raw.caption === "string" && raw.caption.trim()
        ? { caption: raw.caption.trim() }
        : {}),
    };
  }

  if (type === "video") {
    if (typeof raw.src !== "string" || !raw.src.trim()) return null;
    return {
      id,
      type: "video",
      src: raw.src.trim(),
      ...(typeof raw.poster === "string" && raw.poster.trim()
        ? { poster: raw.poster.trim() }
        : {}),
      ...(typeof raw.caption === "string" && raw.caption.trim()
        ? { caption: raw.caption.trim() }
        : {}),
    };
  }

  return null;
}

function parseEnvelope(raw: unknown, index: number): LoveEnvelope | null {
  if (!isRecord(raw)) return null;

  const id = typeof raw.id === "number" ? raw.id : index + 1;
  const papersRaw = Array.isArray(raw.papers) ? raw.papers : [];

  if (papersRaw.length > MAX_PAPERS_PER_ENVELOPE) {
    console.warn(
      `[love-envelopes] الظرف ${id}: فيه ${papersRaw.length} ورقة — هيتاخد أول ${MAX_PAPERS_PER_ENVELOPE} بس.`
    );
  }

  const papers = papersRaw
    .slice(0, MAX_PAPERS_PER_ENVELOPE)
    .map((paper, paperIndex) => parsePaper(paper, id, paperIndex))
    .filter((paper): paper is LovePaperItem => paper !== null);

  if (papers.length === 0) return null;

  return {
    id,
    ...(typeof raw.title === "string" && raw.title.trim()
      ? { title: raw.title.trim() }
      : {}),
    ...(typeof raw.dearName === "string" && raw.dearName.trim()
      ? { dearName: raw.dearName.trim() }
      : {}),
    ...(typeof raw.name === "string" && raw.name.trim()
      ? { name: raw.name.trim() }
      : {}),
    ...(typeof raw.image === "string" && raw.image.trim()
      ? { image: raw.image.trim() }
      : {}),
    papers,
  };
}

function parseFile(data: unknown): {
  recipientName: string;
  author: LoveAuthor;
  envelopes: LoveEnvelope[];
} {
  if (!isRecord(data) || !Array.isArray(data.envelopes)) {
    console.error("[love-envelopes] الملف لازم يحتوي على مصفوفة envelopes.");
    return { recipientName: "gannah", author: parseAuthor(null), envelopes: [] };
  }

  const recipientName =
    typeof data.recipientName === "string" && data.recipientName.trim()
      ? data.recipientName.trim()
      : "gannah";

  const author = parseAuthor((data as EnvelopesFile).author);

  const envelopes = (data as EnvelopesFile).envelopes
    .map((envelope, index) => parseEnvelope(envelope, index))
    .filter((envelope): envelope is LoveEnvelope => envelope !== null);

  return { recipientName, author, envelopes };
}

const parsed = parseFile(envelopesConfig);

export const LOVE_ENVELOPES: LoveEnvelope[] = parsed.envelopes;
export const LOVE_RECIPIENT_NAME = parsed.recipientName;
export const LOVE_AUTHOR = parsed.author;
