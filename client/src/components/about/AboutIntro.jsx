import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

export default function AboutIntro() {
  const [hideChevron, setHideChevron] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setHideChevron(window.scrollY > 40);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="relative min-h-screen bg-black overflow-hidden">
      {/* SUBTLE TECH PATTERN */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(182,242,74,0.6) 1px, transparent 1px), linear-gradient(rgba(182,242,74,0.6) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage:
            "radial-gradient(circle at center, black 40%, transparent 75%)",
        }}
      />

      {/* SOFT CENTER GLOW */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(800px 500px at 50% 45%, rgba(182,242,74,0.14), rgba(0,0,0,0.92) 60%)",
        }}
      />

      {/* CONTENT */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <div className="max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-lime-400 mb-6 tracking-tight">
            About Marsh Monster
          </h1>

          <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
            We’re not another web dev agency — we’re a small, fast, focused team
            that engineers lightning-fast websites from the ground up.
            No templates. No bloat. Just clean systems built to scale.
          </p>
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