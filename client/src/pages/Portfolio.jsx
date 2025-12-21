import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

/* ---------- helpers ---------- */
function cn(...c) {
  return c.filter(Boolean).join(" ");
}

/* ---------- Page ---------- */
export default function Portfolio() {
  const PROJECTS = [
    {
      id: "efferent",
      title: "Efferent Labs",
      role: "Medical Device / Platform",
      summary:
        "High-performance frontend for a medical device company, built with auth-ready architecture and strict Lighthouse targets.",
      details:
        "We engineered a fast, compliant marketing surface with future authentication hooks, modular sections, and strict Lighthouse targets across devices.",
      cover: "/portfolio-1.png",
      url: "https://goliath-app-hz6rj.ondigitalocean.app",
    },
    {
      id: "gathering",
      title: "The Gathering",
      role: "Book Launch + Commerce",
      summary:
        "Conversion-first landing experience for a sci-fi release, combining narrative storytelling with a frictionless checkout path.",
      details:
        "Focused on story pacing, purchase clarity, and performance under load. Designed to scale into a larger content ecosystem.",
      cover: "/portfolio-4.png",
      url: "https://thegatheringbook.com",
    },
    {
      id: "breeze",
      title: "BreezeShooters HVAC",
      role: "Local Service Lead Engine",
      summary:
        "Mobile-first HVAC site engineered to turn traffic into calls, with aggressive performance tuning and sticky CTAs.",
      details:
        "Optimized for real-world users: fast loads, prominent CTAs, service-area SEO, and minimal friction to contact.",
      cover: "/portfolio-2.png",
      url: "https://breeze-shooters-app-nt9ww.ondigitalocean.app",
    },
  ];

  const [openId, setOpenId] = useState(null);
  const [showChevron, setShowChevron] = useState(true);

  /* hide chevron on scroll */
  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 60) setShowChevron(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="relative bg-black text-white overflow-hidden">
      {/* Ambient background */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(900px 520px at 50% 15%, rgba(182,242,74,0.12), rgba(0,0,0,0.96) 65%)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6">

        {/* ---------------- HERO ---------------- */}
        <section className="relative min-h-screen flex flex-col items-center justify-center text-center">
          <div className="text-xs tracking-[0.32em] uppercase text-gray-500 mb-6">
            Selected Work
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
            Systems we’ve{" "}
            <span className="text-lime-400">engineered</span>
          </h1>

          <p className="mt-8 text-gray-400 max-w-2xl">
            Every project is built with intent — speed, clarity, and long-term
            scalability. No templates. No filler.
          </p>

          {/* Chevron */}
          <AnimatePresence>
            {showChevron && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2"
              >
                <ChevronDown
                  size={32}
                  className="text-lime-400 animate-bounce"
                  style={{
                    filter: "drop-shadow(0 0 14px rgba(182,242,74,0.6))",
                    animationDuration: "1.6s",
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* ---------------- FEATURED PROJECTS ---------------- */}
        <section className="space-y-36 pb-32">
          {PROJECTS.map((p, i) => {
            const open = openId === p.id;

            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 48 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                viewport={{ once: false, amount: 0.3 }}
                className={cn(
                  "grid gap-12 items-start",
                  "md:grid-cols-2",
                  i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""
                )}
              >
                {/* Image */}
                <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-black/70 backdrop-blur-xl">
                  <img
                    src={p.cover}
                    alt={p.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Text */}
                <div className="space-y-6">
                  <div className="text-xs tracking-[0.28em] uppercase text-gray-500">
                    {p.role}
                  </div>

                  <h2 className="text-3xl md:text-4xl font-extrabold">
                    {p.title}
                  </h2>

                  <p className="text-gray-400 leading-relaxed max-w-xl">
                    {p.summary}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-4 pt-2">
                    {p.url && (
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-5 py-2.5 rounded-xl bg-lime-400 text-black font-semibold"
                      >
                        View live
                      </a>
                    )}
                    <button
                      onClick={() => setOpenId(open ? null : p.id)}
                      className={cn(
                        "px-5 py-2.5 rounded-xl border transition",
                        open
                          ? "border-lime-400 text-lime-400"
                          : "border-gray-700 hover:bg-[#141414]"
                      )}
                    >
                      {open ? "Hide details" : "Details"}
                    </button>
                  </div>

                  {/* Expandable details */}
                  <AnimatePresence>
                    {open && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl p-5 text-gray-300 text-sm leading-relaxed">
                          {p.details}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </section>

        {/* ---------------- CTA ---------------- */}
        <section className="pb-32">
          <div className="max-w-4xl mx-auto text-center rounded-3xl border border-white/10 bg-black/70 backdrop-blur-xl p-10">
            <div className="text-xs tracking-[0.32em] uppercase text-gray-500 mb-4">
              Private Work
            </div>

            <h3 className="text-2xl md:text-3xl font-extrabold">
              Some projects stay private —{" "}
              <span className="text-lime-400">by design.</span>
            </h3>

            <p className="mt-5 text-gray-400 max-w-xl mx-auto">
              If a project isn’t public, we’re happy to walk you through it
              directly.
            </p>

            <a
              href="/contact"
              className="inline-flex mt-8 px-6 py-3 rounded-2xl bg-lime-400 text-black font-semibold"
            >
              Request a walkthrough
            </a>
          </div>
        </section>
      </div>
    </section>
  );
}