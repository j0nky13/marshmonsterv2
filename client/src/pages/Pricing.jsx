import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import PricingHero from "../components/pricing/PricingHero";
import PricingSection from "../components/pricing/PricingSection";
import DesignSection from "../components/pricing/DesignSection";
import PricingFAQ from "../components/pricing/PricingFAQ";
import PricingCTA from "../components/pricing/PricingCTA";

function FloatingInput({ id, name, type = 'text', label, required = false }) {
  return (
    <div className="relative group">
      <input
        id={id}
        name={name}
        type={type}
        placeholder=" "
        required={required}
        className="peer w-full rounded-xl bg-[#181818]/95 text-white border border-gray-700/80 px-4 py-3.5
                   shadow-inner focus:outline-none focus:border-lime-400 focus:ring-4 focus:ring-lime-400/10
                   transition-colors placeholder-transparent"
      />
      {/* floating label */}
      <label
        htmlFor={id}
        className="absolute left-3 top-3 text-gray-400 px-1 rounded
                   transition-all duration-200 ease-out origin-left
                   peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:bg-transparent
                   peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:text-lime-300 peer-focus:bg-[#1f1f1f]
                   peer-[&:not(:placeholder-shown)]:top-0 peer-[&:not(:placeholder-shown)]:-translate-y-1/2 peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:text-gray-300 peer-[&:not(:placeholder-shown)]:bg-[#1f1f1f]"
      >
        {label}
      </label>
    </div>
  );
}

function FloatingTextarea({ id, name, label, rows = 5, required = false }) {
  return (
    <div className="relative group">
      <textarea
        id={id}
        name={name}
        placeholder=" "
        rows={rows}
        required={required}
        className="peer w-full rounded-xl bg-[#181818]/95 text-white border border-gray-700/80 px-4 py-3.5
                   shadow-inner focus:outline-none focus:border-lime-400 focus:ring-4 focus:ring-lime-400/10
                   transition-colors placeholder-transparent resize-none"
      />
      <label
        htmlFor={id}
        className="absolute left-3 top-3 text-gray-400 px-1 rounded
                   transition-all duration-200 ease-out origin-left
                   peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:bg-transparent
                   peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:text-lime-300 peer-focus:bg-[#1f1f1f]
                   peer-[&:not(:placeholder-shown)]:top-0 peer-[&:not(:placeholder-shown)]:-translate-y-1/2 peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:text-gray-300 peer-[&:not(:placeholder-shown)]:bg-[#1f1f1f]"
      >
        {label}
      </label>
    </div>
  );
}

const FORMSPREE_ENDPOINT =
  import.meta.env.VITE_FORMSPREE_ENDPOINT || "https://formspree.io/f/mnngdpny";

export default function Pricing() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const plansRef = useRef(null);

  const openForm = (planName) => {
    setSelectedPlan(planName);
    setModalOpen(true);
  };
  const closeForm = () => setModalOpen(false);

  useEffect(() => {
    if (modalOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
  }, [modalOpen]);

  const plans = [
    {
      name: "Starter",
      badge: "Best for quick wins",
      price: "Starting at $499",
      cta: "Start Starter",
      highlight: false,
      features: [
        "Single-page site or landing page",
        "Mobile responsive + fast load",
        "Basic SEO + Google Analytics",
        "Deployment included; hosting billed by usage (DB/storage as needed)",
        "1 round of revisions",
      ],
    },
    {
      name: "Growth",
      badge: "Most Popular",
      price: "Typical range: $1,800–$3,500",
      cta: "Get Exact Quote",
      highlight: true,
      features: [
        "3–6 page site (Home, About, Services, Contact, etc.)",
        "Custom design + copy guidance",
        "SEO setup + analytics dashboard",
        "Booking, forms, or basic e-commerce",
        "3 rounds of revisions",
        "14-day launch guarantee*",
      ],
    },
    {
      name: "Monster",
      badge: "Scale & enterprise",
      price: "Scoped from $4,000+",
      cta: "Get Exact Quote",
      highlight: false,
      features: [
        "Unlimited pages & custom components",
        "Stripe, memberships, or advanced e-commerce",
        "Admin dashboard & role-based access",
        "Integrations (HCP, Mail, CRM, automations)",
        "Priority support & ongoing optimization",
      ],
    },
  ];

  const faqs = [
    { q: "How long does a project take?", a: "Starter: 3–7 days. Growth: 7–14 days. Monster: depends on scope, but all are built in sprints." },
    { q: "Do you offer hosting?", a: "Yes — hosting is usage-based for database or app-heavy builds. We'll right-size it for you." },
    { q: "Can I upgrade later?", a: "Absolutely. Start small, scale up as you grow. Your investment carries forward." },
  ];

  return (
    <section className="bg-gradient-to-b from-[#121212] to-[#1a1a1a] text-white">
      <PricingHero openForm={openForm} scrollToPlans={() => plansRef.current.scrollIntoView({ behavior: "smooth" })} />
      <PricingSection plans={plans} openForm={openForm} plansRef={plansRef} />
      <DesignSection openForm={openForm} />
      <PricingFAQ faqs={faqs} />
      <PricingCTA openForm={openForm} />

      {/* Modal */}
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
              className="bg-[#1f1f1f] p-6 rounded-2xl shadow-xl w-full max-w-md relative border border-lime-600"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h3 className="text-2xl font-bold text-lime-400 mb-2">
                {selectedPlan || "Contact Us"}
              </h3>
              <form action={FORMSPREE_ENDPOINT} method="POST" className="space-y-4">
                <input type="hidden" name="plan" value={selectedPlan} />

                {selectedPlan === 'Call' ? (
                  <>
                    <FloatingInput id="mmc-name" name="name" type="text" label="Your Name" required />
                    <FloatingInput id="mmc-phone" name="phone" type="tel" label="Your Phone" required />
                    <FloatingInput id="mmc-email" name="email" type="email" label="Your Email" required />
                    <FloatingInput id="mmc-time" name="preferredTime" type="text" label="Best time to call (optional)" />
                    <FloatingTextarea id="mmc-notes" name="message" label="Anything we should know before the call? (optional)" />
                    <button
                      type="submit"
                      className="w-full bg-lime-400 hover:bg-lime-300 text-black font-bold py-3 px-6 rounded shadow-md hover:shadow-xl transition-all"
                    >
                      Request Call
                    </button>
                  </>
                ) : (
                  <>
                    <FloatingInput id="mm-name" name="name" type="text" label="Your Name" required />
                    <FloatingInput id="mm-email" name="email" type="email" label="Your Email" required />
                    <FloatingTextarea id="mm-message" name="message" label="Tell us a little about your project..." />
                    <button
                      type="submit"
                      className="w-full bg-lime-400 hover:bg-lime-300 text-black font-bold py-3 px-6 rounded shadow-md hover:shadow-xl transition-all"
                    >
                      Send Inquiry
                    </button>
                  </>
                )}
              </form>
              <button
                onClick={closeForm}
                className="absolute top-3 right-3 text-gray-400 hover:text-lime-400"
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}