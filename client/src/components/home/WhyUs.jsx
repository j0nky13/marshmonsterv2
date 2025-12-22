import {
  Rocket,
  Brain,
  ShieldCheck,
  TrendingUp,
  ChevronDown,
} from "lucide-react";
import {
  motion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useRef, useLayoutEffect, useState } from "react";

const GREEN = "#B6F24A";

const slides = [
  {
    icon: Rocket,
    title: "Built With Intention",
    description:
      "We don’t start with templates or shortcuts. Every system is designed with a clear purpose and built to do exactly what it needs to do — nothing more, nothing less.",
  },
  {
    icon: TrendingUp,
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
    icon: Brain,
    title: "An Engine Behind the Scenes",
    description:
      "We use an internal system that helps us move faster without locking you into rigid patterns or limiting future growth.",
  },
];

export default function WhyUs() {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);

  const [maxX, setMaxX] = useState(0);
  const [vh, setVh] = useState(window.innerHeight);

  useLayoutEffect(() => {
    if (!trackRef.current) return;
    const totalWidth = trackRef.current.scrollWidth;
    setMaxX(totalWidth - window.innerWidth);
    setVh(window.innerHeight);
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const x = useTransform(scrollYProgress, [0, 1], [0, -maxX]);

  // Chevron fades when user scrolls either direction
  const chevronOpacity = useTransform(
    scrollYProgress,
    [0, 0.08, 0.9, 1],
    [1, 0, 0, 1]
  );

  return (
    <section
      ref={sectionRef}
      className="relative bg-black text-white"
      style={{ height: maxX + vh }}
    >
      {/* Sticky viewport */}
      <div className="sticky top-0 h-screen overflow-hidden flex items-center">
        <motion.div ref={trackRef} style={{ x }} className="flex">
          {slides.map((slide, i) => {
            const Icon = slide.icon;
            return (
              <div
                key={i}
                className="w-screen flex items-center justify-center px-6 md:px-12"
              >
                <div className="max-w-3xl">
                  <Icon size={36} color={GREEN} />
                  <h2 className="mt-6 text-3xl md:text-5xl font-extrabold leading-tight">
                    {slide.title}
                  </h2>
                  <div
                    className="h-px w-16 my-6"
                    style={{ backgroundColor: GREEN }}
                  />
                  <p className="text-lg text-slate-300 max-w-xl">
                    {slide.description}
                  </p>
                </div>
              </div>
            );
          })}

          {/* SUMMARY */}
          <div className="w-screen flex items-center justify-center px-6 md:px-12">
            <div className="max-w-4xl text-center">
              <h3 className="text-4xl md:text-5xl font-extrabold mb-6">
                This isn’t a stack.{" "}
                <span style={{ color: GREEN }}>It’s an engine.</span>
              </h3>
              <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-12">
                Every decision compounds. Performance, safety, motion, and
                conversion are designed together — not patched in later.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-10 text-sm text-slate-300">
                <div className="flex flex-col items-center gap-2">
                  <Rocket size={20} color={GREEN} />
                  Purpose-Built
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Brain size={20} color={GREEN} />
                  Engine-Driven
                </div>
                <div className="flex flex-col items-center gap-2">
                  <ShieldCheck size={20} color={GREEN} />
                  Secure by Default
                </div>
                <div className="flex flex-col items-center gap-2">
                  <TrendingUp size={20} color={GREEN} />
                  Built to Convert
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Chevron */}
      <motion.div
        style={{ opacity: chevronOpacity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <ChevronDown
          size={28}
          className="animate-bounce"
          color={GREEN}
          style={{ animationDuration: "1.6s" }}
        />
      </motion.div>
    </section>
  );
}