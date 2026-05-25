import cinemaConfig from "./data/cinema.json";

export type CinemaConfig = {
  introTitle: string;
  video: string;
  poster?: string;
  muted: boolean;
  loop: boolean;
  background: string;
  backgroundFallback: string;
  fallbackSlides: string[];
};

function trimString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function stringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseConfig(data: unknown): CinemaConfig {
  const raw = typeof data === "object" && data !== null ? data : {};

  const video = trimString((raw as Record<string, unknown>).video) ?? "/video/movie.mp4";
  const poster = trimString((raw as Record<string, unknown>).poster);

  return {
    introTitle:
      trimString((raw as Record<string, unknown>).introTitle) ?? "ليلة عيد ميلادكِ",
    video,
    ...(poster ? { poster } : {}),
    muted: (raw as Record<string, unknown>).muted !== false,
    loop: (raw as Record<string, unknown>).loop !== false,
    background:
      trimString((raw as Record<string, unknown>).background) ??
      "/images/village-bg.jpg",
    backgroundFallback:
      trimString((raw as Record<string, unknown>).backgroundFallback) ??
      "/images/hero-fantasy.jpg",
    fallbackSlides: stringList((raw as Record<string, unknown>).fallbackSlides),
  };
}

export const CINEMA = parseConfig(cinemaConfig);
