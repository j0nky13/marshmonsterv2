import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import ParticleBackground from "../ParticleBackground";
import FloatingCode from "../FloatingCode";
import { createMessage } from "../../lib/messagesApi";

const GREEN = "#B6F24A";

export default function HeroSection() {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [reveal, setReveal] = useState(false);
  const [subtitleIn, setSubtitleIn] = useState(false);
  const [ctaIn, setCtaIn] = useState(false);

  const heroRef = useRef(null);
  const ctaRef = useRef(null);

  /* ---------------- intro timing ---------------- */
  useEffect(() => {
    const t1 = setTimeout(() => setReveal(true), 300);
    const t2 = setTimeout(() => setSubtitleIn(true), 1100);
    const t3 = setTimeout(() => setCtaIn(true), 1250);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  /* ---------------- cursor glow ---------------- */
  useEffect(() => {
    const btn = ctaRef.current;
    if (!btn) return;

    const move = (e) => {
      const r = btn.getBoundingClientRect();
      btn.style.setProperty("--x", `${e.clientX - r.left}px`);
      btn.style.setProperty("--y", `${e.clientY - r.top}px`);
    };

    btn.addEventListener("pointermove", move);
    return () => btn.removeEventListener("pointermove", move);
  }, []);

  /* ---------------- scroll exit ---------------- */
  useEffect(() => {
    const onScroll = () => {
      if (!heroRef.current) return;
      const y = window.scrollY;
      heroRef.current.style.opacity = `${Math.max(0, 1 - y / 400)}`;
      heroRef.current.style.transform = `translateY(${Math.min(y / 2, 200)}px)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.target);

    try {
      await createMessage({
        name: formData.get("name"),
        email: formData.get("email"),
        message: formData.get("message"),
        source: "hero-modal",
        page: "/",
      });
      setSubmitted(true);
    } catch {
      setError("Failed to send message. Please try again.");
    }
  }

  return (
    <>
      {/* HERO */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-black px-6"
      >
        <FloatingCode />

        <div className="absolute inset-0 z-0">
          <ParticleBackground />
          <div
            className="
              absolute inset-0
              bg-[radial-gradient(circle_at_center,rgba(182,242,74,0.14)_0%,rgba(0,0,0,0.7)_55%,#000_100%)]
              md:bg-[radial-gradient(circle_at_center,rgba(182,242,74,0.08)_0%,rgba(0,0,0,0.85)_55%,#000_100%)]
            "
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center gap-10">
          {/* HEADLINE */}
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05] text-white flex flex-wrap justify-center">
            <span
              className="inline-block transition-transform duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)]"
              style={{
                transform: reveal ? "translateX(-1.25rem)" : "translateX(0)",
              }}
            >
              We build&nbsp;
            </span>

            <span className="inline-flex overflow-hidden">
              {"cool shit".split("").map((c, i) => (
                <span
                  key={i}
                  className="inline-block transition-all duration-500"
                  style={{
                    color: GREEN,
                    transform: reveal
                      ? "translateY(0)"
                      : "translateY(120%)",
                    transitionDelay: `${i * 60}ms`,
                  }}
                >
                  {c === " " ? "\u00A0" : c}
                </span>
              ))}
            </span>

            <span
              className="inline-block ml-1 transition-all duration-500"
              style={{
                color: GREEN,
                transform: reveal ? "scale(1)" : "scale(0)",
                opacity: reveal ? 1 : 0,
                transitionDelay: `${"cool shit".length * 60 + 120}ms`,
              }}
            >
              .
            </span>
          </h1>

          {/* SUBTITLE */}
          <p
            className={`max-w-2xl text-lg md:text-xl leading-relaxed transition-all duration-700 ${
              subtitleIn
                ? "opacity-100 translate-y-0 text-white"
                : "opacity-0 translate-y-6"
            }`}
          >
            No templates. No builders. No bloat.
            <br />
            Just fast, custom-engineered digital experiences.
          </p>

          {/* CTA */}
          <button
            ref={ctaRef}
            onClick={() => setOpen(true)}
            className={`relative px-12 py-4 rounded-full text-sm font-semibold uppercase tracking-wide overflow-hidden transition-all duration-500 ${
              ctaIn
                ? "opacity-100 scale-100"
                : "opacity-0 scale-75 pointer-events-none"
            }`}
            style={{
              backgroundColor: GREEN,
              color: "#0f0f0f",
              boxShadow: ctaIn
                ? "0 0 40px rgba(182,242,74,0.35)"
                : "0 0 0 rgba(0,0,0,0)",
            }}
          >
            <span className="relative z-10">Start a project</span>
            <span
              className="absolute inset-0 opacity-0 hover:opacity-100 transition"
              style={{
                background:
                  "radial-gradient(circle at var(--x,50%) var(--y,50%), rgba(255,255,255,0.45), transparent 60%)",
              }}
            />
          </button>
        </div>

      {/* DOWN ARROW — END OF SCREEN */}
<div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
  <ChevronDown
    size={34}
    color={GREEN}
    className="animate-bounce opacity-80"
  />
</div>
      </section>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm px-4">
          <div
            className="bg-black w-full max-w-xl rounded-xl border p-6 relative"
            style={{ borderColor: "rgba(182,242,74,0.25)" }}
          >
            <button
              onClick={() => {
                setOpen(false);
                setSubmitted(false);
                setError("");
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>

            <h2 className="text-2xl font-semibold text-white mb-1">
              Let’s talk
            </h2>
            <p className="text-sm text-slate-400 mb-6">
              We usually reply within 24 hours.
            </p>

            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {["name", "email"].map((f) => (
                  <input
                    key={f}
                    name={f}
                    required
                    placeholder={f[0].toUpperCase() + f.slice(1)}
                    className="w-full rounded bg-black/50 border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-[rgba(182,242,74,0.6)]"
                  />
                ))}

                <textarea
                  name="message"
                  rows="4"
                  required
                  placeholder="What are we building?"
                  className="w-full rounded bg-black/50 border border-white/10 px-3 py-2 text-sm text-white resize-none outline-none focus:border-[rgba(182,242,74,0.6)]"
                />

                {error && (
                  <div className="text-xs text-red-400">{error}</div>
                )}

                <button
                  type="submit"
                  className="w-full py-2 rounded font-semibold"
                  style={{ backgroundColor: GREEN, color: "#0f0f0f" }}
                >
                  Send message
                </button>
              </form>
            ) : (
              <div
                className="text-center py-10 text-lg animate-pulse"
                style={{ color: GREEN }}
              >
                Message sent. We’ll be in touch.
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}