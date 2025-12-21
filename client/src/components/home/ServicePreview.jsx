// ServicePreview.jsx
import { motion, useScroll, useTransform } from "framer-motion";
import { Code, Globe, Rocket, Search, ArrowRight } from "lucide-react";
import { useMemo, useRef, useEffect, useState } from "react";

const GREEN = "#B6F24A";

export default function ServicePreview() {
  const ref = useRef(null);

  // These refs are ONLY for the floating behavior
  const leftWrapRef = useRef(null);     // wrapper that defines left column area
  const leftCardRef = useRef(null);     // actual card we float
  const [floatMode, setFloatMode] = useState("normal"); // normal | fixed | bottom
  const [bottomTop, setBottomTop] = useState(0);

  const services = useMemo(
    () => [
      {
        title: "Custom Websites",
        icon: Code,
        tagline: "No templates. No drag-and-drop.",
        description:
          "Hand-built React/Vite sites engineered for speed, clean architecture, and long-term maintainability.",
        bullets: ["Vite + React", "Tailwind systems", "Component-first UX"],
      },
      {
        title: "E-Commerce Systems",
        icon: Globe,
        tagline: "Brand-first storefronts.",
        description:
          "Custom storefront builds with optimized UX flows, conversion-minded layout, and scalable structure.",
        bullets: ["Custom product UI", "Fast checkout UX", "Performance budgets"],
      },
      {
        title: "Performance Optimization",
        icon: Rocket,
        tagline: "Make it feel instant.",
        description:
          "We turn slow sites into lean machines: better LCP, less layout shift, less bloat — more conversion.",
        bullets: ["Core Web Vitals", "Bundle trimming", "Load strategy"],
      },
      {
        title: "Technical SEO",
        icon: Search,
        tagline: "SEO built into the foundation.",
        description:
          "Clean DOM, structured metadata, crawlability — the stuff builders rarely get right without hacks.",
        bullets: ["Schema/OG/Twitter", "Metadata strategy", "Index hygiene"],
      },
    ],
    []
  );

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const spineScale = useTransform(scrollYProgress, [0.2, 0.85], [0, 1]);
  const glowOpacity = useTransform(scrollYProgress, [0.0, 0.4, 1], [0, 1, 0]);

  /**
   * FLOAT LOGIC:
   * - "fixed" while section is in view and not past the bottom
   * - "bottom" when we would overlap past the section end
   * - "normal" before the section reaches the viewport center
   *
   * This avoids sticky weirdness and gives you the exact “float” feel.
   */
  useEffect(() => {
    const onScroll = () => {
      const section = ref.current;
      const leftWrap = leftWrapRef.current;
      const card = leftCardRef.current;

      if (!section || !leftWrap || !card) return;

      const sectionRect = section.getBoundingClientRect();
      const wrapRect = leftWrap.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();

      const viewportH = window.innerHeight;

      // where we want the card to sit when fixed
      const fixedTopPx = viewportH / 2 - cardRect.height / 2;

      // Start floating when section has reached a reasonable point in view
      const sectionTopInView = sectionRect.top;
      const sectionBottomInView = sectionRect.bottom;

      // if section isn't in view at all
      if (sectionBottomInView <= 0 || sectionTopInView >= viewportH) {
        setFloatMode("normal");
        return;
      }

      // If the section hasn't come down enough to justify floating yet
      // (prevents it from snapping under the previous section)
      if (sectionRect.top > fixedTopPx) {
        setFloatMode("normal");
        return;
      }

      // Compute where the card would land if we "pin" it to the bottom
      // of the left column area (so it never escapes the section)
      const wrapTopDoc = window.scrollY + wrapRect.top;
      const wrapHeight = leftWrap.offsetHeight;
      const cardHeight = card.offsetHeight;

      const bottomPinnedTopDoc = wrapTopDoc + (wrapHeight - cardHeight);
      const bottomPinnedTopPx = bottomPinnedTopDoc - window.scrollY;

      // If fixed would push it past the wrap's bottom, switch to "bottom" mode
      if (bottomPinnedTopPx < fixedTopPx) {
        setFloatMode("bottom");
        setBottomTop(wrapHeight - cardHeight);
        return;
      }

      // Otherwise: float fixed in the center
      setFloatMode("fixed");
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section
      ref={ref}
      className="relative bg-black text-white py-28 px-6 overflow-hidden"
      style={{ backgroundColor: "#000000" }}
    >
      {/* Subtle “engine” ambience */}
      <motion.div
        aria-hidden="true"
        style={{ opacity: glowOpacity }}
        className="absolute inset-0 pointer-events-none"
      >
        <div
          className="absolute -top-40 left-1/2 -translate-x-1/2 h-[700px] w-[700px] rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(182,242,74,0.14) 0%, rgba(0,0,0,0) 62%)",
          }}
        />
        <div
          className="absolute bottom-[-280px] right-[-220px] h-[650px] w-[650px] rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(182,242,74,0.10) 0%, rgba(0,0,0,0) 60%)",
          }}
        />
      </motion.div>

      {/* IMPORTANT FIX:
          On lg, the grid items must STRETCH so the left column becomes as tall as the right rail.
          Otherwise, sticky has no “scroll room” and it just sits at the top. */}
      <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-12 items-start lg:items-stretch">
        {/* LEFT: “Console” (FLOATS CENTERED WHILE SECTION IS IN VIEW) */}
        <div ref={leftWrapRef} className="lg:col-span-5 lg:flex lg:items-stretch relative">
          {/* This empty spacer keeps layout stable when card becomes fixed */}
          <div className="w-full" style={{ minHeight: "1px" }} />

          <div
            className="w-full self-center"
            style={{
              position:
                floatMode === "fixed"
                  ? "fixed"
                  : floatMode === "bottom"
                  ? "absolute"
                  : "relative",
              top:
                floatMode === "fixed"
                  ? "50%"
                  : floatMode === "bottom"
                  ? bottomTop
                  : "auto",
              transform:
                floatMode === "fixed"
                  ? "translateY(-50%)"
                  : "none",
              left: floatMode === "fixed" ? undefined : "0",
              right: floatMode === "fixed" ? undefined : "0",
              width: floatMode === "fixed" ? leftWrapRef.current?.offsetWidth : "100%",
              maxWidth: "100%",
              zIndex: 30,
              pointerEvents: "auto",
            }}
          >
            <motion.div
              ref={leftCardRef}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.5 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="rounded-3xl border border-white/10 bg-black/60 backdrop-blur-xl p-8"
            >
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="text-xs tracking-[0.24em] text-slate-400 uppercase">
                  What we do
                </div>
                <div
                  className="h-2 w-2 rounded-full"
                  style={{
                    backgroundColor: GREEN,
                    boxShadow: "0 0 18px rgba(182,242,74,0.6)",
                  }}
                />
              </div>

              <h2 className="text-4xl md:text-5xl font-extrabold leading-[1.02]">
                We don’t sell a stack.
                <span className="block" style={{ color: GREEN }}>
                  We ship an engine.
                </span>
              </h2>

              <p className="mt-5 text-slate-300 text-lg leading-relaxed">
                Builders make websites. We engineer systems — fast, secure, and designed
                to scale without becoming a maintenance nightmare.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-3">
                {[
                  ["Speed", "Core Web Vitals"],
                  ["Security", "Passwordless-ready"],
                  ["UX", "Conversion-minded"],
                  ["Scale", "Maintainable code"],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3"
                  >
                    <div className="text-xs text-slate-500">{k}</div>
                    <div className="text-sm font-semibold text-slate-200">{v}</div>
                  </div>
                ))}
              </div>

              <button
                className="mt-8 w-full rounded-2xl px-5 py-3 font-semibold text-black flex items-center justify-center gap-2"
                style={{
                  backgroundColor: GREEN,
                  boxShadow: "0 0 34px rgba(182,242,74,0.22)",
                }}
                onClick={() => {
                  const el = document.getElementById("contact");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Start a project <ArrowRight size={18} />
              </button>
            </motion.div>
          </div>
        </div>

        {/* RIGHT: “Service rail” */}
        <div className="lg:col-span-7 relative">
          {/* Spine */}
          <div className="hidden md:block absolute left-4 top-4 bottom-4 w-px bg-white/10" />
          <motion.div
            aria-hidden="true"
            style={{ scaleY: spineScale, transformOrigin: "top" }}
            className="hidden md:block absolute left-4 top-4 bottom-4 w-px"
          >
            <div
              className="h-full w-full"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(182,242,74,0.0), rgba(182,242,74,0.9), rgba(182,242,74,0.0))",
                boxShadow: "0 0 18px rgba(182,242,74,0.35)",
              }}
            />
          </motion.div>

          <div className="space-y-7 md:space-y-8">
            {services.map((s, idx) => {
              const Icon = s.icon;

              return (
                <motion.div
                  key={s.title}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.45 }}
                  transition={{ duration: 0.65, ease: "easeOut", delay: idx * 0.05 }}
                  className="group relative"
                >
                  {/* Node */}
                  <div className="hidden md:block absolute left-[7px] top-7">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{
                        backgroundColor: GREEN,
                        boxShadow: "0 0 18px rgba(182,242,74,0.55)",
                      }}
                    />
                  </div>

                  <div className="md:pl-14">
                    <div className="rounded-3xl border border-white/10 bg-black/55 backdrop-blur-xl p-7 transition-transform duration-300 group-hover:-translate-y-1">
                      <div className="flex items-start justify-between gap-6">
                        <div className="min-w-0">
                          <div className="flex items-center gap-3">
                            <div
                              className="flex h-10 w-10 items-center justify-center rounded-2xl border"
                              style={{
                                borderColor: "rgba(182,242,74,0.22)",
                                background:
                                  "radial-gradient(circle at 30% 30%, rgba(182,242,74,0.18), rgba(0,0,0,0.65))",
                              }}
                            >
                              <Icon size={20} color={GREEN} />
                            </div>

                            <div className="text-xs tracking-[0.24em] text-slate-500 uppercase">
                              Stage {String(idx + 1).padStart(2, "0")}
                            </div>
                          </div>

                          <h3 className="mt-4 text-2xl md:text-3xl font-extrabold tracking-tight">
                            {s.title}
                          </h3>

                          <div className="mt-2 text-sm" style={{ color: GREEN }}>
                            {s.tagline}
                          </div>

                          <p className="mt-4 text-slate-300 leading-relaxed">
                            {s.description}
                          </p>
                        </div>

                        {/* Right “meter” */}
                        <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
                          <div className="text-xs text-slate-500">impact</div>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 rounded-full bg-white/10 overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${70 + idx * 7}%`,
                                  backgroundColor: GREEN,
                                  boxShadow: "0 0 14px rgba(182,242,74,0.35)",
                                }}
                              />
                            </div>
                            <div className="text-xs text-slate-400">
                              {70 + idx * 7}%
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bullets (tighter, more “spec sheet”) */}
                      <div className="mt-6 flex flex-wrap gap-2">
                        {s.bullets.map((b) => (
                          <span
                            key={b}
                            className="text-xs rounded-full px-3 py-1 border"
                            style={{
                              borderColor: "rgba(255,255,255,0.10)",
                              backgroundColor: "rgba(255,255,255,0.04)",
                              color: "rgba(226,232,240,0.92)",
                            }}
                          >
                            {b}
                          </span>
                        ))}
                      </div>

                      {/* Micro accent */}
                      <div
                        className="mt-6 h-px w-full"
                        style={{
                          background:
                            "linear-gradient(90deg, rgba(182,242,74,0.0), rgba(182,242,74,0.40), rgba(182,242,74,0.0))",
                          opacity: 0.8,
                        }}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom “engine note” (CENTERED + DETACHED FROM SPINE) */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.45 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="mt-16 md:mt-20 max-w-4xl mx-auto px-2"
      >
        <div className="rounded-3xl border border-white/10 bg-black/60 backdrop-blur-xl p-8 text-center">
          <div className="text-xs tracking-[0.24em] text-slate-500 uppercase">
            Delivery philosophy
          </div>

          <div className="mt-4 text-2xl md:text-3xl font-extrabold leading-tight">
            Ship fast. Stay clean.{" "}
            <span style={{ color: GREEN }}>Scale without regret.</span>
          </div>

          <p className="mt-4 text-slate-300 leading-relaxed">
            Every build is designed so you can add features later without rewriting the foundation.
            That’s what an engine does.
          </p>
        </div>
      </motion.div>
    </section>
  );
}