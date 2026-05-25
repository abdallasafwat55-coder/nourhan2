import { useCallback, useEffect, useRef, useState } from "react";
import { SITE_MUSIC_SRC } from "./siteMusic";

type Props = {
  active?: boolean;
};

/** يمنع التشغيل (سينما، رسائل، …) حتى لو السكشن الأول ظاهر */
let playbackBlocked = false;
let userPaused = false;
let sectionVisible = true;

let sharedAudio: HTMLAudioElement | null = null;

function getSharedAudio(): HTMLAudioElement {
  if (!sharedAudio) {
    sharedAudio = new Audio(SITE_MUSIC_SRC);
    sharedAudio.loop = true;
    sharedAudio.preload = "auto";
  }
  return sharedAudio;
}

function pauseAllSiteMusicInDom() {
  const file = SITE_MUSIC_SRC.split("/").pop() ?? SITE_MUSIC_SRC;
  document.querySelectorAll("audio").forEach((el) => {
    const src = el.currentSrc || el.getAttribute("src") || "";
    if (src.includes(file) || src.includes(SITE_MUSIC_SRC)) {
      el.pause();
    }
  });
  getSharedAudio().pause();
}

export function setSiteMusicBlocked(blocked: boolean) {
  playbackBlocked = blocked;
  if (blocked) pauseAllSiteMusicInDom();
}

/**
 * الأغنية بتشتغل بس لما السكشن الأول (id="start") يكون ظاهر.
 * لما تسكرول بره السكشن الأغنية بتوقف (pause)،
 * ولما ترجع بتكمل من نفس المكان اللي وقفت فيه.
 */
export function BackgroundMusic({ active = true }: Props) {
  const [playing, setPlaying] = useState(false);
  const activeRef = useRef(active);

  activeRef.current = active;

  const play = useCallback(async () => {
    if (!activeRef.current || playbackBlocked || userPaused) return;
    const el = getSharedAudio();
    try {
      await el.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  }, []);

  const pause = useCallback(() => {
    pauseAllSiteMusicInDom();
    setPlaying(false);
  }, []);

  const toggle = useCallback(() => {
    if (playing) {
      userPaused = true;
      pause();
    } else {
      userPaused = false;
      void play();
    }
  }, [playing, play, pause]);

  useEffect(() => {
    setSiteMusicBlocked(!active);
  }, [active]);

  useEffect(() => {
    if (!active) {
      pause();
      return;
    }
    if (sectionVisible && !userPaused && !playbackBlocked) void play();
  }, [active, play, pause]);

  useEffect(() => {
    const onFirstGesture = () => {
      if (!activeRef.current || playbackBlocked) return;
      // الموسيقى تشتغل بس لما المستخدم يكون في السكشن الأول
      if (!sectionVisible) return;
      if (!playing && !userPaused) void play();
    };
    window.addEventListener("pointerdown", onFirstGesture, { once: true });
    return () => window.removeEventListener("pointerdown", onFirstGesture);
  }, [play, playing]);

  useEffect(() => {
    const section = document.getElementById("start");
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        sectionVisible = entry.isIntersecting;

        if (entry.isIntersecting) {
          if (activeRef.current && !userPaused && !playbackBlocked) {
            void play();
          }
        } else {
          pause();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [active, play, pause]);

  useEffect(() => {
    (window as Window & { __toggleSiteMusic?: () => void }).__toggleSiteMusic =
      toggle;
    (window as Window & { __stopSiteMusic?: () => void }).__stopSiteMusic =
      pause;
    return () => {
      delete (window as Window & { __toggleSiteMusic?: () => void })
        .__toggleSiteMusic;
      delete (window as Window & { __stopSiteMusic?: () => void })
        .__stopSiteMusic;
    };
  }, [toggle, pause]);

  return null;
}

export function toggleSiteMusic() {
  (
    window as Window & { __toggleSiteMusic?: () => void }
  ).__toggleSiteMusic?.();
}

export function stopSiteMusic() {
  pauseAllSiteMusicInDom();
  (
    window as Window & { __stopSiteMusic?: () => void }
  ).__stopSiteMusic?.();
}
