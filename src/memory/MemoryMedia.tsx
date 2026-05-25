import { type RefObject } from "react";
import type { MemoryCard } from "./memories";
import { memoryPoster } from "./memories";

type Props = {
  memory: MemoryCard;
  isCenter: boolean;
  className?: string;
  videoRef?: RefObject<HTMLVideoElement>;
  onVideoEnded?: () => void;
  onVideoPlay?: () => void;
  onVideoError?: () => void;
};

export function MemoryMedia({
  memory,
  isCenter,
  className = "h-full w-full object-cover",
  videoRef,
  onVideoEnded,
  onVideoPlay,
  onVideoError,
}: Props) {
  if (memory.type === "video") {
    return (
      <video
        ref={isCenter ? videoRef : undefined}
        src={memory.src}
        poster={memoryPoster(memory)}
        className={className}
        muted
        playsInline
        preload={isCenter ? "auto" : "metadata"}
        autoPlay={isCenter}
        controls={false}
        onEnded={isCenter ? onVideoEnded : undefined}
        onPlay={isCenter ? onVideoPlay : undefined}
        onError={isCenter ? onVideoError : undefined}
      />
    );
  }

  return (
    <img
      src={memory.src}
      alt=""
      className={className}
      draggable={false}
      loading={isCenter ? "eager" : "lazy"}
      decoding="async"
    />
  );
}
