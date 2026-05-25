import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { stopSiteMusic } from "./memory/BackgroundMusic";

type Envelope = {
  id: number;
  title: string;
  papers: string[];
};

const ENVELOPES: Envelope[] = [
  { id: 0, title: "ظرف الأمنيات", papers: ["Dear gannah", "Dear gannah"] },
  { id: 1, title: "ظرف العمر العشرين", papers: ["Dear gannah"] },
  { id: 2, title: "ظرف الذكريات", papers: ["Dear gannah"] },
  { id: 3, title: "ظرف الضحك", papers: ["Dear gannah", "Dear gannah"] },
  { id: 4, title: "ظرف من القلب", papers: ["Dear gannah"] },
];

export default function Envelopes() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [visibleCounts, setVisibleCounts] = useState<number[]>(
    Array(ENVELOPES.length).fill(0)
  );

  useEffect(() => {
    if (openIndex === null) return;

    // reveal papers one by one
    const total = ENVELOPES[openIndex].papers.length;
    setVisibleCounts((s) => s.map((v, i) => (i === openIndex ? 0 : v)));

    const timers: number[] = [];
    for (let i = 0; i < total; i++) {
      const t = window.setTimeout(() => {
        setVisibleCounts((s) => {
          const copy = [...s];
          copy[openIndex] = i + 1;
          return copy;
        });
      }, 600 * (i + 1));
      timers.push(t);
    }

    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [openIndex]);

  return (
    <div className="mx-auto my-8 max-w-4xl px-6">
      <h3 className="mb-4 text-center text-xl font-semibold text-rose-600">ظروف عيد الميلاد</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {ENVELOPES.map((env) => {
          const opened = openIndex === env.id;
          const visible = visibleCounts[env.id] || 0;

          return (
            <div key={env.id} className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => {
                  if (!opened) {
                    stopSiteMusic();
                  }
                  setOpenIndex(opened ? null : env.id);
                }}
                className="group relative flex h-32 w-40 items-end justify-center overflow-visible rounded-md bg-rose-100 p-2 shadow-md"
              >
                <motion.div
                  animate={opened ? { rotateX: 0 } : { rotateX: 15 }}
                  transition={{ duration: 0.45 }}
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full origin-bottom rounded-b-md bg-rose-200 p-3 text-center text-sm font-medium text-rose-700 shadow-inner"
                >
                  {env.title}
                </motion.div>

                {/* flap */}
                <motion.div
                  className="absolute top-0 h-24 w-40 origin-top rounded-t-md bg-rose-300 shadow"
                  animate={opened ? { rotateX: -180 } : { rotateX: 0 }}
                  transition={{ duration: 0.5 }}
                  style={{ transformStyle: "preserve-3d" }}
                />
              </button>

              <div className="mt-3 w-full">
                {env.papers.slice(0, visible).map((p, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.45 }}
                    className="mb-2 rounded border bg-white p-3 text-sm shadow"
                  >
                    <div className="font-semibold">ورقة {idx + 1}</div>
                    <div className="mt-1 text-xs text-gray-700">{p}</div>
                  </motion.div>
                ))}

                {opened && visible === 0 && (
                  <div className="mt-2 text-center text-xs text-gray-500">فتح الظرف...</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
