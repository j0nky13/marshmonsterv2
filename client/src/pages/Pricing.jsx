import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

import PricingSection from "../components/pricing/PricingSection";
import DesignSection from "../components/pricing/DesignSection";
import PricingFAQ from "../components/pricing/PricingFAQ";
import PricingCTA from "../components/pricing/PricingCTA";

/* ---------------- floating fields ---------------- */

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

function FloatingTextarea({ id, name, label, rows = 5 }) {
  return (
    <div className="relative group">
      <textarea
        id={id}
        name={name}
        rows={rows}
        placeholder=" "
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

/* ---------------- config ---------------- */

const FORMSPREE_ENDPOINT =
  import.meta.env.VITE_FORMSPREE_ENDPOINT || "https://formspree.io/f/mnngdpny";

export default function Pricing() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showChevron, setShowChevron] = useState(true);
  const plansRef = useRef(null);

  /* chevron fade on scroll */
  useEffect(() => {
    const onScroll = () => setShowChevron(window.scrollY < 80);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openForm = (planName) => {
    setSelectedPlan(planName);
    setModalOpen(true);
  };
  const closeForm = () => setModalOpen(false);

  useEffect(() => {
    document.body.style.overflow = modalOpen ? "hidden" : "";
  }, [modalOpen]);

  const plans = [
    {
      name: "Launch Build",
      badge: "Focused scope",
      price: "$500–$1,200",
      cta: "Discuss launch",
      highlight: false,
      features: [
        "Single-purpose site or landing experience",
        "Performance-first layout",
        "Mobile-first responsive build",
        "Basic SEO + analytics",
        "Deployment included",
        "1 revision cycle",
      ],
    },
    {
      name: "Product Build",
      badge: "Most common",
      price: "$2,000–$4,000",
      cta: "Scope my project",
      highlight: true,
      features: [
        "Multi-page or app-style frontend",
        "Custom UI system",
        "Auth-ready architecture",
        "Dashboards or commerce",
        "SEO + analytics baseline",
        "3 revision cycles",
      ],
    },
    {
      name: "Platform Build",
      badge: "Software & scale",
      price: "Scoped",
      cta: "Talk architecture",
      highlight: false,
      features: [
        "Custom SaaS or internal tools",
        "Subscriptions or memberships",
        "Admin dashboards + roles",
        "API integrations",
        "Scalable deployment",
        "Optimization options",
      ],
    },
  ];

  const faqs = [
    {
      q: "Is this just for websites?",
      a: "No — we design software foundations, apps, and SaaS products."
    },
    {
      q: "Can this scale later?",
      a: "Everything is architected for growth from day one."
    },
    {
      q: "Do you offer hosting?",
      a: "Yes, usage-based and right-sized per project."
    },
  ];

  return (
    <section className="relative bg-black text-white overflow-hidden">

      {/* ambient field */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(1100px 600px at 50% 18%, rgba(182,242,74,0.08), rgba(0,0,0,0.96) 65%)",
        }}
      />

      <div className="relative z-10">

        {/* ---------------- HERO ---------------- */}
        <section className="min-h-[90vh] flex flex-col items-center justify-center text-center px-6">
          <div className="max-w-4xl">
            <div className="text-xs tracking-[0.32em] uppercase text-gray-500 mb-6">
              Engagement models
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
              Build the <span className="text-lime-400">right system</span>,
              <br /> not just a site
            </h1>

            <p className="mt-8 text-gray-400 max-w-2xl mx-auto">
              We engineer products, platforms, and software foundations —
              intentionally, and built to scale.
            </p>
          </div>

          <motion.div
            className="absolute bottom-10"
            animate={{ opacity: showChevron ? 1 : 0, y: showChevron ? 0 : 10 }}
            transition={{ duration: 0.4 }}
          >
            <ChevronDown
              size={28}
              className="text-lime-400 animate-bounce"
              style={{
                filter: "drop-shadow(0 0 12px rgba(182,242,74,0.45))",
                animationDuration: "1.6s",
              }}
            />
          </motion.div>
        </section>

        {/* ---------------- PRICING ---------------- */}
        <section ref={plansRef} className="py-28 px-6">
          <PricingSection plans={plans} openForm={openForm} />
        </section>

        <DesignSection openForm={openForm} />

        {/* ---------------- FAQ ---------------- */}
        <section className="py-24 px-6">
          <PricingFAQ faqs={faqs} />
        </section>

        {/* ---------------- CTA ---------------- */}
        <section className="pb-28 px-6">
          <PricingCTA openForm={openForm} />
        </section>
      </div>

      {/* ---------------- MODAL ---------------- */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeForm}
          >
            <motion.div
              className="bg-black p-6 rounded-3xl w-full max-w-md border border-white/15"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
            >
              <h3 className="text-2xl font-extrabold text-lime-400 mb-2">
                {selectedPlan || "Start a project"}
              </h3>

              <form action={FORMSPREE_ENDPOINT} method="POST" className="space-y-4">
                <input type="hidden" name="plan" value={selectedPlan} />
                <FloatingInput id="mm-name" name="name" label="Your name" required />
                <FloatingInput id="mm-email" name="email" type="email" label="Email" required />
                <FloatingTextarea
                  id="mm-message"
                  name="message"
                  label="Tell us what you’re building…"
                />
                <button
                  type="submit"
                  className="w-full rounded-2xl px-6 py-3 font-semibold text-black bg-lime-400 hover:bg-lime-300 transition"
                >
                  Send inquiry
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}