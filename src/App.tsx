import { lazy, Suspense, useEffect, useState } from "react";
import { Heart, HeartHandshake, Music2 } from "lucide-react";
import { FacebookIcon, InstagramIcon } from "./BrandSocialIcons";
import { CINEMA } from "./loadCinemaConfig";
import { LOVE_AUTHOR, LOVE_ENVELOPES } from "./loadLoveEnvelopes";
import Opening from "./Opening";
import {
  BackgroundMusic,
  setSiteMusicBlocked,
  stopSiteMusic,
  toggleSiteMusic,
} from "./memory/BackgroundMusic";
import { AnimatePresence } from "framer-motion";

const MemoryCarouselLanding = lazy(() =>
  import("./memory/MemoryCarouselLanding").then((m) => ({
    default: m.MemoryCarouselLanding,
  }))
);
const HeartEnvelopeReveal = lazy(() =>
  import("./HeartEnvelopeReveal").then((m) => ({
    default: m.HeartEnvelopeReveal,
  }))
);
const CinemaExperience = lazy(() =>
  import("./cinema/CinemaExperience").then((m) => ({
    default: m.CinemaExperience,
  }))
);
const LoveEnvelopeModal = lazy(() =>
  import("./LoveEnvelopeModal").then((m) => ({
    default: m.LoveEnvelopeModal,
  }))
);

const footerSocial = [
  { Icon: InstagramIcon, label: "إنستغرام" as const },
  { Icon: FacebookIcon, label: "فيسبوك" as const },
  { Icon: HeartHandshake, label: "حب" as const },
];

export default function App() {
  const [cinemaOpen, setCinemaOpen] = useState(false);
  const [showOpening, setShowOpening] = useState(true);
  const [messagesOpen, setMessagesOpen] = useState(false);

  const scrollToMessages = () => {
    document.getElementById("messages")?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    setSiteMusicBlocked(cinemaOpen);
    if (cinemaOpen) stopSiteMusic();
  }, [cinemaOpen]);

  return (
    <>
      <AnimatePresence mode="sync">
        {showOpening && (
          <Opening
            key="birthday-opening"
            onEnterCinema={() => {
              setSiteMusicBlocked(true);
              stopSiteMusic();
              setShowOpening(false);
              setCinemaOpen(true);
            }}
          />
        )}
      </AnimatePresence>

      {!showOpening && (
        <Suspense fallback={null}>
          <main
            dir="rtl"
            className="min-h-screen bg-[#030108] text-white overflow-x-hidden selection:bg-pink-500/25"
          >
            <CinemaExperience
              open={cinemaOpen}
              onClose={() => setCinemaOpen(false)}
              config={CINEMA}
            />

            <div id="start">
              <MemoryCarouselLanding onOpenMessages={scrollToMessages} />
            </div>

            <section
              id="messages"
              className="relative z-20 mx-auto max-w-7xl scroll-mt-28 px-3 py-8 sm:px-4 sm:py-10"
            >
              <HeartEnvelopeReveal onOpenMessages={() => setMessagesOpen(true)} />
            </section>

            <LoveEnvelopeModal
              open={messagesOpen}
              onClose={() => setMessagesOpen(false)}
              envelopes={LOVE_ENVELOPES}
              author={LOVE_AUTHOR}
            />

            <footer className="relative z-20 mt-12 border-t border-pink-200/15 py-12 sm:py-16">
              <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 sm:px-6 md:flex-row md:gap-8">
                <div className="flex gap-3 sm:gap-4">
                  {footerSocial.map(({ Icon, label }) => (
                    <button
                      key={label}
                      type="button"
                      aria-label={label}
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-pink-200/20 bg-white/5 transition hover:bg-pink-500/20 sm:h-14 sm:w-14"
                    >
                      <Icon size={22} />
                    </button>
                  ))}
                </div>

                <div className="text-center">
                  <h3 className="mb-2 flex items-center justify-center gap-2 text-2xl font-bold sm:mb-3 sm:text-3xl md:text-4xl">
                    <Heart className="fill-neonpink text-neonpink" />
                    عيد ميلاد سعيد يا نونا
                  </h3>
                  <p className="text-base text-white/70 sm:text-lg md:text-xl">
                    لسنة جديدة مليانة فرح وصحة وأحلام تتحقق
                  </p>
                </div>

                <div className="text-white/60">Midnight Express</div>
              </div>
            </footer>

            <BackgroundMusic active={!cinemaOpen} />

            {!cinemaOpen && (
              <button
                type="button"
                aria-label="موسيقى"
                onClick={() => toggleSiteMusic()}
                className="fixed bottom-4 left-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-purple-500 text-white shadow-[0_0_35px_rgba(255,120,200,0.45)] transition hover:scale-110 sm:bottom-8 sm:left-8 sm:h-16 sm:w-16"
              >
                <Music2 className="h-5 w-5 sm:h-7 sm:w-7" />
              </button>
            )}
          </main>
        </Suspense>
      )}
    </>
  );
}
