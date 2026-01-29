import { useEffect, useRef } from "react";
import {
  Brain,
  ShieldCheck,
  Rocket,
  Cpu,
  TrendingUp,
} from "lucide-react";

const GREEN = "#B6F24A";

const slides = [
  {
    icon: Brain,
    title: "Built With Intention",
    description:
      "We don’t start with templates or shortcuts. Every system is designed with a clear purpose and built to do exactly what it needs to do — nothing more, nothing less.",
  },
  {
    icon: Rocket,
    title: "Performance That Matters",
    description:
      "Fast load times and smooth interactions keep people engaged. When things feel instant, trust goes up and friction disappears.",
  },
  {
    icon: ShieldCheck,
    title: "Protection From the Start",
    description:
      "We think about safety early so you don’t have to fix it later. Clean access, sensible defaults, and fewer points of failure.",
  },
  {
    icon: Cpu,
    title: "An Engine Behind the Scenes",
    description:
      "We use an internal system that helps us move faster without locking you into rigid patterns or limiting future growth.",
  },
];

function prefersReducedMotion() {
  if (typeof window === "undefined") return true;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
}

export default function WhyUs() {
  const itemRefs = useRef([]);
  const summaryRef = useRef(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const els = [
      sectionRef.current,
      ...itemRefs.current.filter(Boolean),
      summaryRef.current,
    ].filter(Boolean);

    sectionRef.current?.classList.add("mm-prep");

    // Prep state only when JS is running (prevents “invisible forever” when JS fails)
    for (const el of els) el.classList.add("mm-prep");

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("mm-in");
          io.unobserve(e.target);
        }
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px -10% 0px",
      }
    );

    for (const el of els) io.observe(el);

    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="bg-black text-white py-40 md:py-44 px-6 relative overflow-hidden"
    >
      <style>{`
        .mm-prep {
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 700ms cubic-bezier(0.22, 1, 0.36, 1),
            transform 700ms cubic-bezier(0.22, 1, 0.36, 1);
          will-change: opacity, transform;
        }
        .mm-in {
          opacity: 1;
          transform: translateY(0);
        }
        @media (prefers-reduced-motion: reduce) {
          .mm-prep {
            opacity: 1 !important;
            transform: none !important;
            transition: none !important;
          }
        }
        .mm-rail {
          transform: scaleX(0);
          transform-origin: left center;
          transition: transform 900ms cubic-bezier(0.22, 1, 0.36, 1);
          will-change: transform;
        }

        .mm-in .mm-rail {
          transform: scaleX(1);
        }
      `}</style>

      {/* NARRATIVE RAILS */}
      <div className="absolute inset-0 pointer-events-none rotate-[-2deg] md:rotate-[-3deg] origin-left">
        {/* Top rail */}
        <div
          className="absolute inset-x-0 top-[4%] md:top-[6%] h-[6px] md:h-[10px] mm-rail"
          style={{
            background:
              "linear-gradient(90deg, rgba(182,242,74,0), rgba(182,242,74,0.55), rgba(182,242,74,0))",
          }}
        />
        {/* Desktop top rail glow */}
        <div
          className="absolute inset-x-0 top-[6%] h-[10px] hidden md:block mm-rail"
          style={{
            background:
              "linear-gradient(90deg, rgba(182,242,74,0), rgba(182,242,74,0.85), rgba(182,242,74,0))",
            filter: "blur(2px)",
          }}
        />

        {/* Bottom rail */}
        <div
          className="absolute inset-x-0 bottom-[2%] h-[6px] md:h-[10px] mm-rail"
          style={{
            background:
              "linear-gradient(90deg, rgba(182,242,74,0), rgba(182,242,74,0.45), rgba(182,242,74,0))",
          }}
        />
        {/* Desktop bottom rail glow */}
        <div
          className="absolute inset-x-0 bottom-[2%] h-[10px] hidden md:block mm-rail"
          style={{
            background:
              "linear-gradient(90deg, rgba(182,242,74,0), rgba(182,242,74,0.7), rgba(182,242,74,0))",
            filter: "blur(2px)",
          }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-center mb-4">
          This Is Why People Choose Us
        </h2>

        <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto text-center mb-16">
          Not buzzwords. Not templates. These are the reasons clients trust us with
          their ideas — and why they stay.
        </p>

        <div className="relative max-w-5xl mx-auto space-y-28 md:space-y-40">
          {slides.map((slide, i) => {
            const Icon = slide.icon;

            return (
              <div
                key={i}
                ref={(el) => (itemRefs.current[i] = el)}
                style={{ transitionDelay: `${i * 110}ms` }}
                className={`flex items-start gap-6 max-w-xl text-left md:text-left ${
                  i % 2 === 0
                    ? "md:ml-0"
                    : "md:ml-auto md:mr-28"
                } transition-transform duration-300 ease-out md:hover:translate-x-1`}
              >
                {/* ICON */}
                <div className="flex-shrink-0 mt-1">
                  <Icon
                    size={24}
                    color={GREEN}
                  />
                </div>

                {/* CONTENT */}
                <div className="relative">
                  <h3 className="text-xl font-semibold tracking-tight mb-2">
                    {slide.title}
                  </h3>

                  <p className="text-base text-slate-400 leading-relaxed max-w-prose mt-3">
                    {slide.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* SUMMARY */}
        <div ref={summaryRef} className="mt-28 pt-0 text-center">
          <h3 className="text-2xl md:text-3xl font-semibold tracking-tight mb-6">
            You’re not hiring a website. You’re choosing how it works.
          </h3>

          <p className="text-base md:text-lg text-slate-300 max-w-3xl mx-auto text-center mb-12">
            Most teams focus on how things look. We focus on how they behave.
            That difference shows up in speed, stability, and results.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm text-slate-300 text-center">
            <div className="flex flex-col items-center gap-2">
              <Brain color={GREEN} className="w-6 h-6 md:w-7 md:h-7" />
              Purpose-Built
            </div>
            <div className="flex flex-col items-center gap-2">
              <Cpu color={GREEN} className="w-6 h-6 md:w-7 md:h-7" />
              Engine-Driven
            </div>
            <div className="flex flex-col items-center gap-2">
              <ShieldCheck color={GREEN} className="w-6 h-6 md:w-7 md:h-7" />
              Secure by Default
            </div>
            <div className="flex flex-col items-center gap-2">
              <TrendingUp color={GREEN} className="w-6 h-6 md:w-7 md:h-7" />
              Built to Convert
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}