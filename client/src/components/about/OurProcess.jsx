import { motion } from "framer-motion";

export default function OurProcess() {
  const steps = [
    {
      title: "Listen",
      description:
        "We dive deep into your goals, challenges, and audience to understand what really matters.",
    },
    {
      title: "Plan",
      description:
        "We craft a clear, effective strategy tailored to your needs and timelines.",
    },
    {
      title: "Build",
      description:
        "We write lean, scalable code and design with purpose — no fluff, no bloat.",
    },
    {
      title: "Refine",
      description:
        "We test thoroughly, polish every detail, and launch with confidence.",
    },
  ];

  return (
    <section className="py-20 px-6 bg-[#0f0f0f] text-center relative overflow-x-hidden">
      <div className="max-w-5xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: false, amount: 0.3 }}
        >
          <h2 className="text-3xl font-semibold text-lime-400 mb-4">Our Process</h2>
          <p className="text-lg text-gray-300 leading-relaxed mb-12">
            We move fast, stay focused, and always deliver. Here’s how we do it:
          </p>
        </motion.div>
        <div className="relative flex flex-col gap-10 md:ml-12">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              whileInView={{ opacity: 1, x: 0, scale: 1.02 }}
              initial={{ opacity: 0, x: index % 2 === 0 ? -60 : 60, scale: 0.95 }}
              transition={{ duration: 0.7, delay: index * 0.2 }}
              className="relative bg-[#1c1c1c] text-left border border-gray-700 shadow-lg shadow-lime-400/50 px-6 py-5 rounded-md mx-auto w-full md:max-w-2xl pl-10"
            >
              <div className="absolute -left-5 top-5 md:-left-[3.5rem] md:top-5 flex items-center space-x-2">
                <div className="relative">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-lime-400 rounded-full border-4 border-[#0f0f0f] shadow-lg shadow-lime-400/70" />
                  <span className="absolute inset-0 flex items-center justify-center text-black font-bold select-none">
                    {index + 1}
                  </span>
                </div>
              </div>
              <h3 className="text-lime-400 text-xl font-semibold mb-1">
                {step.title}
              </h3>
              <p className="text-gray-300">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
