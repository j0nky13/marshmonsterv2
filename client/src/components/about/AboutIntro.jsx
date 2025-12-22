import { ChevronDown } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const GREEN = "#B6F24A";

export default function AboutIntro() {
  const [hideChevron, setHideChevron] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setHideChevron(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const gridOpacity = useTransform(scrollYProgress, [0, 0.6], [0.08, 0.02]);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0.55]);

  const titleY = useTransform(scrollYProgress, [0, 0.35], [0, -18]);
  const textY = useTransform(scrollYProgress, [0, 0.35], [0, -10]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen bg-black overflow-hidden"
    >
      {/* SUBTLE TECH GRID */}
      <motion.div
        aria-hidden
        className="absolute inset-0"
        style={{
          opacity: gridOpacity,
          backgroundImage:
            "linear-gradient(90deg, rgba(182,242,74,0.6) 1px, transparent 1px), linear-gradient(rgba(182,242,74,0.6) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage:
            "radial-gradient(circle at center, black 42%, transparent 75%)",
        }}
        animate={{ backgroundPosition: ["0px 0px", "56px 56px"] }}
        transition={{ duration: 22, ease: "linear", repeat: Infinity }}
      />

      {/* SOFT CENTER GLOW */}
      <motion.div
        aria-hidden
        className="absolute inset-0"
        style={{
          opacity: glowOpacity,
          background:
            "radial-gradient(900px 520px at 50% 46%, rgba(182,242,74,0.14), rgba(0,0,0,0.92) 62%)",
        }}
        animate={{ opacity: [1, 0.9, 1] }}
        transition={{ duration: 7, ease: "easeInOut", repeat: Infinity }}
      />

      {/* CONTENT */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <div className="max-w-4xl text-center">
          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-lime-400"
            initial={{ opacity: 0, y: 28, filter: "blur(14px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{ y: titleY }}
          >
            Built deliberately.
            <span className="block text-white">
              Engineered to move fast.
            </span>
          </motion.h1>

          <motion.p
            className="mt-6 text-lg md:text-xl text-gray-300 leading-relaxed"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.15 }}
            style={{ y: textY }}
          >
            Marsh Monster isn’t a template shop or a churn-and-burn agency.
            We’re a small team focused on building fast, durable systems —
            websites that load instantly, scale cleanly, and don’t collapse
            under their own weight six months later.
          </motion.p>
        </div>
      </div>

      {/* DOWN CHEVRON */}
      <div
        className={`
          absolute bottom-8 left-1/2 -translate-x-1/2
          transition-all duration-500 ease-out
          ${hideChevron ? "opacity-0 translate-y-6 pointer-events-none" : "opacity-100"}
        `}
      >
        <ChevronDown
          size={28}
          className="text-lime-400 animate-bounce"
          style={{
            filter: "drop-shadow(0 0 14px rgba(182,242,74,0.6))",
            animationDuration: "1.6s",
          }}
        />
      </div>
    </section>
  );
}