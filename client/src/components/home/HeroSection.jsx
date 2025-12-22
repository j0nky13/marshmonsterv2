import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import ParticleBackground from "../ParticleBackground";
import FloatingCode from "../FloatingCode";
import { createMessage } from "../../lib/messagesApi";

const GREEN = "#B6F24A";

/* ---------- floating fields ---------- */

function FloatingInput({ id, name, type = "text", label, required = false }) {
  return (
    <div className="relative group">
      <input
        id={id}
        name={name}
        type={type}
        placeholder=" "
        required={required}
        className="peer w-full rounded-2xl bg-black text-white border border-white/15 px-4 py-3.5
                   focus:outline-none focus:border-lime-400 focus:ring-4 focus:ring-lime-400/10
                   transition placeholder-transparent"
      />
      <label
        htmlFor={id}
        className="absolute left-4 top-3.5 text-gray-400 text-sm transition-all
                   peer-placeholder-shown:top-3.5
                   peer-focus:-top-2 peer-focus:text-xs peer-focus:text-lime-300 peer-focus:bg-black peer-focus:px-1
                   peer-[&:not(:placeholder-shown)]:-top-2 peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:bg-black peer-[&:not(:placeholder-shown)]:px-1"
      >
        {label}
      </label>
    </div>
  );
}

function FloatingTextarea({ id, name, label, rows = 4, required = false }) {
  return (
    <div className="relative group">
      <textarea
        id={id}
        name={name}
        rows={rows}
        placeholder=" "
        required={required}
        className="peer w-full rounded-2xl bg-black text-white border border-white/15 px-4 py-3.5
                   focus:outline-none focus:border-lime-400 focus:ring-4 focus:ring-lime-400/10
                   transition placeholder-transparent resize-none"
      />
      <label
        htmlFor={id}
        className="absolute left-4 top-3.5 text-gray-400 text-sm transition-all
                   peer-placeholder-shown:top-3.5
                   peer-focus:-top-2 peer-focus:text-xs peer-focus:text-lime-300 peer-focus:bg-black peer-focus:px-1
                   peer-[&:not(:placeholder-shown)]:-top-2 peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:bg-black peer-[&:not(:placeholder-shown)]:px-1"
      >
        {label}
      </label>
    </div>
  );
}

function FloatingSelect({ id, name, label, required = false, options = [] }) {
  return (
    <div className="relative group">
      <select
        id={id}
        name={name}
        required={required}
        defaultValue=""
        className="peer w-full appearance-none rounded-2xl bg-black text-white border border-white/15 px-4 py-3.5
                   focus:outline-none focus:border-lime-400 focus:ring-4 focus:ring-lime-400/10
                   transition"
      >
        <option value="" disabled>
          Select…
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <label
        htmlFor={id}
        className="absolute left-4 -top-2 text-xs text-lime-300 bg-black px-1"
      >
        {label}
      </label>

      {/* caret */}
      <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
        ▾
      </div>
    </div>
  );
}

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

  /* ---------------- body lock ---------------- */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.target);

    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      company: formData.get("company"),
      timeframe: formData.get("timeframe"),
      message: formData.get("message"),
      source: "hero-modal",
      page: "/",
    };

    try {
      await createMessage(payload);
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
              We build
            </span>

            <span className="inline-flex overflow-hidden">
              {"cool stuff".split("").map((c, i) => (
                <span
                  key={i}
                  className="inline-block transition-all duration-500"
                  style={{
                    color: GREEN,
                    transform: reveal ? "translateY(0)" : "translateY(120%)",
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
                transitionDelay: `${"cool stuff".length * 60 + 120}ms`,
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

        {/* DOWN ARROW */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <ChevronDown size={34} color={GREEN} className="animate-bounce opacity-80" />
        </div>
      </section>

      {/* MODAL */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              className="relative bg-black p-6 rounded-3xl w-full max-w-md border border-white/15"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
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

              <h3 className="text-2xl font-extrabold text-lime-400 mb-2">
                Start a project
              </h3>

              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <FloatingInput id="hero-name" name="name" label="Your name" required />
                  <FloatingInput id="hero-email" name="email" type="email" label="Email" required />
                  <FloatingInput
                    id="hero-phone"
                    name="phone"
                    type="tel"
                    label="Phone number"
                  />
                  <FloatingInput
                    id="hero-company"
                    name="company"
                    label="Company name"
                  />

                  <FloatingSelect
                    id="hero-timeframe"
                    name="timeframe"
                    label="Timeframe"
                    options={[
                      { value: "asap", label: "ASAP" },
                      { value: "2-4-weeks", label: "2–4 weeks" },
                      { value: "1-2-months", label: "1–2 months" },
                      { value: "3-plus-months", label: "3+ months" },
                      { value: "exploring", label: "Just exploring" },
                    ]}
                  />

                  <FloatingTextarea
                    id="hero-message"
                    name="message"
                    label="Tell us what you’re building…"
                  />

                  {error && <div className="text-xs text-red-400">{error}</div>}

                  <button
                    type="submit"
                    className="w-full rounded-2xl px-6 py-3 font-semibold text-black bg-lime-400 hover:bg-lime-300 transition"
                  >
                    Send inquiry
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}