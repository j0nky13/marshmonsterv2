import { motion } from "framer-motion";

const GREEN = "#B6F24A";

export default function OurProcess() {
  const steps = [
    {
      title: "Listen",
      description:
        "We dig until the real problem surfaces. Goals, constraints, audience, intent — nothing assumed.",
    },
    {
      title: "Plan",
      description:
        "We map the build before a single line of code is written. Clean structure beats fast guesses.",
    },
    {
      title: "Build",
      description:
        "No frameworks-for-the-sake-of-it. Just lean, intentional code that does exactly what it should.",
    },
    {
      title: "Refine",
      description:
        "We test, tighten, and remove friction. Launch isn’t the end — it’s the proof.",
    },
  ];

  return (
    <section className="relative bg-black px-6 py-28">
      <div className="relative max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: false, amount: 0.3 }}
          className="mb-24 text-center"
        >
          <div className="text-xs tracking-[0.32em] uppercase text-slate-500">
            How we work
          </div>

          <h2
            className="mt-4 text-4xl md:text-5xl font-extrabold leading-tight"
            style={{ color: GREEN }}
          >
            Our Process
          </h2>

          <p className="mt-6 text-gray-400 text-lg max-w-xl mx-auto">
            Simple. Direct. Built to move fast without breaking later.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="space-y-20">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.08 }}
              viewport={{ once: false, amount: 0.35 }}
              className="relative"
            >
              {/* Divider */}
              {index !== 0 && (
                <div
                  className="absolute -top-12 left-0 h-px w-full"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(182,242,74,0.0), rgba(182,242,74,0.35), rgba(182,242,74,0.0))",
                  }}
                />
              )}

              <div className="flex items-start gap-8">
                {/* Number badge (ServicePreview-inspired) */}
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border"
                  style={{
                    borderColor: "rgba(182,242,74,0.22)",
                    background:
                      "radial-gradient(circle at 30% 30%, rgba(182,242,74,0.18), rgba(0,0,0,0.65))",
                    boxShadow: "0 0 18px rgba(182,242,74,0.35)",
                  }}
                >
                  <span
                    className="text-sm font-bold"
                    style={{ color: GREEN }}
                  >
                    {index + 1}
                  </span>
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <h3
                    className="text-2xl md:text-3xl font-extrabold tracking-tight"
                    style={{ color: GREEN }}
                  >
                    {step.title}
                  </h3>

                  <p className="text-gray-300 leading-relaxed max-w-2xl">
                    {step.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}