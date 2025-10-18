import { motion } from "framer-motion";

export default function PricingHero({ openForm, scrollToPlans }) {
  return (
    <div className="max-w-6xl mx-auto px-6 pt-20 pb-10 text-center">
      <motion.h1
        className="text-5xl md:text-6xl font-extrabold text-lime-400 tracking-tight"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Simple, transparent pricing.
      </motion.h1>
      <motion.p
        className="text-gray-300 mt-4 max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        Choose your starting point — launch fast or scale fully. Branding and identity services are custom-quoted for maximum flexibility.
      </motion.p>

      <motion.div
        className="flex flex-col sm:flex-row gap-3 justify-center mt-8"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <button
          onClick={() => openForm("Call")}
          className="bg-lime-400 hover:bg-lime-300 text-black font-bold py-3 px-6 rounded shadow-md hover:shadow-xl transition-all"
        >
          Book a 10-min Call
        </button>
        <button
          onClick={scrollToPlans}
          className="border border-lime-500/70 hover:border-lime-300 text-lime-300 hover:text-black hover:bg-lime-300 font-semibold py-3 px-6 rounded transition-all"
        >
          Compare Plans
        </button>
      </motion.div>
    </div>
  );
}