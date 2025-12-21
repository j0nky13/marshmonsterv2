import { motion } from "framer-motion";
import { Check } from "lucide-react";

export default function PricingSection({ plans, openForm, plansRef }) {
  return (
    <div ref={plansRef} className="max-w-6xl mx-auto px-6 pb-20">
      <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-14 text-white">
        Engagement models
      </h2>

      <div className="grid gap-10 md:grid-cols-3">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.06 }}
            viewport={{ once: true }}
            className={`
              relative flex flex-col
              border border-white/15
              rounded-3xl
              p-8
              transition
              hover:border-lime-400/60
              ${
                plan.highlight
                  ? "md:-mt-6 border-lime-400/80"
                  : ""
              }
            `}
          >
            {/* Badge (text only, no pill background) */}
            {plan.badge && (
              <div className="text-xs uppercase tracking-[0.28em] text-gray-500 mb-3">
                {plan.badge}
              </div>
            )}

            <h3 className="text-2xl md:text-3xl font-extrabold text-white">
              {plan.name}
            </h3>

            <p className="mt-2 text-lg text-gray-300 font-semibold">
              {plan.price}
            </p>

            <p className="text-xs text-gray-500 mt-1">
              Final scope depends on integrations, content, and complexity.
            </p>

            <ul className="mt-6 space-y-3 flex-1 text-gray-300">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <Check
                    className="w-4 h-4 text-lime-400 mt-1 flex-shrink-0"
                    strokeWidth={3}
                  />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <div className="mt-8">
              <button
                onClick={() => openForm(plan.name)}
                className={`
                  w-full rounded-2xl px-6 py-3
                  font-semibold
                  border border-white/20
                  text-white
                  transition
                  hover:border-lime-400
                  hover:text-lime-400
                `}
              >
                {plan.cta}
              </button>
            </div>

            {plan.name === "Growth" && (
              <p className="text-xs text-gray-500 mt-4 italic">
                *Timeline assumes timely content and feedback.
              </p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}