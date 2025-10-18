import { motion } from "framer-motion";
import { Check } from "lucide-react";

export default function PricingSection({ plans, openForm, plansRef }) {
  return (
    <div ref={plansRef} className="max-w-6xl mx-auto px-6 pb-20">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 text-lime-400">
        Choose your build
      </h2>

      <div className="grid gap-8 md:grid-cols-3">
        {plans.map((plan) => (
          <motion.div
            key={plan.name}
            className={`w-full max-w-[26rem] mx-auto bg-[#1f1f1f] border rounded-2xl p-6 md:p-8 shadow-lg transition-transform overflow-hidden flex flex-col ${
              plan.highlight
                ? "border-lime-400 ring-1 ring-lime-400/40 relative -my-3"
                : "border-lime-700"
            }`}
            whileHover={{ scale: 1.02 }}
          >
            <div className="mb-2">
              {plan.badge && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-lime-400 text-black">
                  {plan.badge}
                </span>
              )}
            </div>

            <h3 className="text-2xl md:text-3xl font-extrabold text-lime-400">
              {plan.name}
            </h3>
            <p className="text-xl md:text-2xl font-bold mt-1">{plan.price}</p>
            <p className="text-xs text-gray-500 mt-1">
              Final quote varies by scope (content, integrations, animations).
            </p>

            <ul className="mt-5 space-y-2 md:space-y-3 text-gray-300 flex-1 text-white">
              {plan.features.map((f, i) => (
                <li key={i} className="flex gap-2 items-start">
                  <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-1" strokeWidth={3} />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <button
                onClick={() => openForm(plan.name)}
                className={`w-full relative overflow-hidden font-bold py-3 px-6 rounded transition-all ${
                  plan.highlight
                    ? "bg-lime-400 hover:bg-lime-300 text-black shadow-md hover:shadow-xl"
                    : "border border-lime-500/70 hover:border-lime-300 text-lime-300 hover:text-black hover:bg-lime-300"
                }`}
              >
                {plan.name === "Starter" ? plan.cta : "Get Exact Quote"}
              </button>
            </div>

            {plan.name === "Growth" && (
              <p className="text-xs text-gray-400 mt-3 italic">
                *14-day launch guarantee assumes timely content delivery and approvals.
              </p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}