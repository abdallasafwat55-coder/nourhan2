import { motion, useMotionValue } from "framer-motion";
import { Heart, Menu } from "lucide-react";
import { useCallback, useState } from "react";
import { AmbientScene } from "./AmbientScene";
import { FloatingHeartsBurst } from "./FloatingHeartsBurst";
import { MemoryCarousel } from "./MemoryCarousel";
import { MEMORIES } from "./memories";

type Props = {
  onOpenMessages?: () => void;
};

export function MemoryCarouselLanding({ onOpenMessages }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [heartBurst, setHeartBurst] = useState(0);
  const active = MEMORIES[activeIndex];
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleActiveIndexChange = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  return (
    <div
      className="memory-landing relative min-h-[100dvh] sm:min-h-[92vh] overflow-x-hidden bg-[#030108] text-white"
      onMouseMove={handleMouseMove}
    >
      <AmbientScene active={active} mouseX={mouseX} mouseY={mouseY} />
      <FloatingHeartsBurst burst={heartBurst} glow={active.glow} />

      <motion.header
        className="memory-navbar fixed inset-x-0 top-0 z-50"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-3 sm:px-6 sm:py-5">
          <div className="flex items-center gap-1.5 text-[11px] font-medium tracking-widest text-white/70 sm:gap-2 sm:text-base">
            <span className="uppercase">Midnight Express</span>
            <Heart className="h-3 w-3 fill-neonpink text-neonpink sm:h-4 sm:w-4" />
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 text-center whitespace-nowrap">
            <h1 className="font-display text-sm font-semibold sm:text-2xl">
              أجمل من يتم 24
              <Heart className="mr-0.5 inline h-3 w-3 fill-neonpink text-neonpink sm:mr-1 sm:h-4 sm:w-4" />
            </h1>
            <p className="text-[9px] text-text-muted sm:text-xs">لأحلى نونا في الدنيا</p>
          </div>

          <button
            type="button"
            className="memory-glass-pill flex h-9 w-9 items-center justify-center sm:h-11 sm:w-11"
            aria-label="القائمة"
            onClick={onOpenMessages}
          >
            <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>
      </motion.header>

      <section className="relative z-10 flex min-h-[100dvh] sm:min-h-[92vh] flex-col justify-start pt-28 pb-4 sm:pt-36 sm:pb-7 md:pt-38">
        <MemoryCarousel
          activeIndex={activeIndex}
          onActiveIndexChange={handleActiveIndexChange}
          onHeartClick={() => {
            setHeartBurst((n) => n + 1);
            onOpenMessages?.();
          }}
        />
      </section>
    </div>
  );
}
